# Unimag Deportes — Prototipo web

Prototipo simulado (sin backend) de la plataforma de reserva de espacios deportivos de la
Universidad del Magdalena. Implementa las pantallas del prototipo de Figma
(`prototipo-unimag_deportes`) sobre las reglas de negocio del proyecto
[Unimag-Deportes](../Unimag-Deportes/docs/reglas-y-contexto/unimagDeportes.md).

## Stack

- **React 19 + Vite** (React Compiler habilitado)
- **Tailwind CSS v4** con tema institucional (azul, dorado y rojo — RNF-06)
- **[SmoothUI](https://smoothui.dev)** — los 47 *primitives* vendorizados en
  `src/components/smoothui/` (Base UI + Motion)
- **Motion** — animaciones lentas y suaves en todas las pantallas
- **React Router 7**
- **Photo Sphere Viewer** — panoramas esféricos con carga diferida y controles accesibles

## Ejecutar

```bash
npm install
npm run dev
```

## Recorrido

- **Acceso (UC01):** bienvenida → correo institucional (solo `@unimagdalena.edu.co`) →
  código OTP de 6 dígitos (cualquier código vale en el prototipo) → nombre en el primer
  ingreso. La sesión persiste en `localStorage`.
- **Estudiante:** inicio, disponibilidad (disciplina/espacio/fecha, hasta 2 franjas
  consecutivas), confirmación con validaciones (RN-10..18), comprobante, mis reservas,
  cancelación a tiempo/tardía, cuota semanal, reglas, contacto y check-in QR
  (`/checkin/:espacio`, con ventana real).
- **Administrador:** inicia sesión con un correo que empiece por `admin`
  (p. ej. `admin.deportes@unimagdalena.edu.co`) y entra por «Modo administrador»:
  panel de ocupación, espacios y franjas (crear/editar), bloqueos institucionales
  (cancelan reservas afectadas — RN-43), configuración de reglas (se refleja en toda la
  app) y generación de QR por espacio.

La ocupación de franjas es determinista por (espacio, fecha, hora); reservas, bloqueos,
espacios y reglas editadas persisten en `localStorage`. Para reiniciar la demo, borra el
almacenamiento del sitio.

## Panoramas 360° del Recorrido MVP

El código ya asocia las canchas con estos archivos. Solo coloca tus fotografías en
`public/panoramas/` con los nombres exactos siguientes y recarga la página:

En desarrollo basta con recargar. Si ya generaste `dist/`, ejecuta de nuevo
`npm run build` para incluir las fotografías en el despliegue.

| Cancha | Archivo |
| --- | --- |
| Cancha múltiple 1 — baloncesto y voleibol | `multiple-1.png` |
| Cancha múltiple 2 — fútbol 5 y baloncesto | `multiple-2.png` |
| Cancha de tenis 1 | `tenis-1.png` |
| Cancha fútbol 5 — inicialmente en mantenimiento | `futbol-5.png` |
| Cancha fútbol 11 | `futbol-11.png` |

PNG es la referencia principal, pero puedes usar el mismo nombre con extensión
`.jpg`, `.jpeg` o `.webp` sin editar código; por ejemplo, `multiple-1.jpeg`.
La búsqueda sigue el orden **PNG → JPG → JPEG → WebP** y se detiene en el primer
archivo disponible. Si coexisten varias versiones, se utiliza PNG. Solo se prueba
otra extensión cuando falta el archivo; los errores de red o servidor no se ocultan.

No es necesario editar código ni añadir imágenes de **PREVIEW**. Las miniaturas
conservan su sistema y recursos actuales. El catálogo demo sustituye Tenis 2 por
Múltiple 2; las sesiones ya guardadas se migran una sola vez sin borrar sus reservas,
bloqueos ni espacios personalizados.

### Requisitos de las fotografías

- Los panoramas pueden elaborarse manualmente y tener **cualquier proporción**.
- PNG recomendado para los archivos demo; también se admiten JPG/JPEG y WebP,
  tanto en la carpeta local como en el selector administrativo y el visor.
  Máximo **30 MiB por archivo original**.
- Antes de mostrar la imagen, el visor adapta **todo el encuadre a 2:1**, estirándolo
  o comprimiéndolo, **sin recortar**. No se sobrescribe el archivo ni se modifica PREVIEW.
- El ancho resultante es par, con un máximo de **4096 × 2048 px** para limitar la
  memoria de la textura. Los archivos ya 2:1 que caben en ese límite no se recodifican.
- Las adaptaciones se generan como PNG en memoria para conservar transparencia y
  evitar pérdidas adicionales de compresión. También se aplican a imágenes del backend.
- El visor ignora los metadatos XMP/GPano de recorte: la textura preparada siempre
  representa la esfera completa, incluso si el archivo original ya tenía proporción 2:1.
- No se admiten SVG, archivos dañados ni imágenes sin dimensiones válidas.
- Cuanto más se aleje la proporción original de 2:1, mayor será la deformación.
  El ajuste no reconstruye partes que falten ni convierte una fotografía convencional
  en una proyección equirectangular: el contenido debería representar 360° × 180°.

Si falta un archivo, aparece **«Panorama no disponible»** con su nombre esperado y
un botón para reintentar. No se muestra un recorrido ficticio ni se bloquea el
calendario. El visor permite arrastrar, usar flechas del teclado, acercar/alejar,
pausar el giro y abrir pantalla completa. En móvil se usan dos dedos; con ratón,
Ctrl + rueda evita interferir con el desplazamiento de la página. La orientación
mostrada es relativa, no el norte geográfico. El giro automático respeta movimiento
reducido. Se requiere WebGL; si falla, permanece una ilustración 2D identificada.
Si se pierde el contexto durante el uso, se retira el visor y aparece la alternativa
2D con un botón para crear una instancia nueva. La restauración del contexto anterior
no reactiva un visor cerrado.

En **Administrador → Espacios → Ver 360°** se puede consultar cualquier panorama,
incluido el de fútbol 5 en mantenimiento. En estudiante solo aparecen canchas activas.

Las imágenes cargadas mediante el formulario administrativo prevalecen durante la
sesión de la página. No escriben en `public/`: después de recargar se recuperan los
archivos demo. Los espacios nuevos sin archivo asociado deben volver a cargar su
imagen. El visor conserva únicamente el panorama en uso y libera descargas/URLs al
cambiar de cancha o sesión y al desmontarse; no acumula panoramas en una caché global.
Cada instancia posee un contenedor y un contexto independientes. Al cerrarla se
cancelan descargas y callbacks, se descartan texturas tardías y se completa la
destrucción cuando termina la carga pendiente, evitando reinicializar servicios ya
destruidos. También se limpian las construcciones parciales si falla el constructor.

### Integración futura con backend

`useSpacePanorama` consume el mismo cliente HTTP y el mismo contrato en ambos modos:

```http
GET /spaces/{id}/images/PANORAMA
Authorization: Bearer <token>
```

- Con un token `demo:…`, `mockApi` devuelve la imagen subida temporalmente o descarga
  el archivo local asociado. No necesita backend ni un CDN externo.
- Con una sesión real, el cliente pide el binario al backend configurado mediante
  `VITE_API_URL`. La respuesta debe ser una imagen PNG/JPG/JPEG/WebP válida, no JSON ni HTML.
- Un `404` indica ausencia de imagen; un `401` conserva el manejo global de sesión.
  Los errores del backend **no** se ocultan usando fotografías demo.
- La descarga usa Bearer y pasa al visor como URL `blob:`; el token nunca se incluye
  en la URL. Los archivos de `public/` son públicos y solo corresponden a la demo.
- El backend deberá validar y persistir los archivos, admitir los contratos multipart
  actuales y configurar CORS en despliegues con orígenes distintos. El visor no cambia.

### Comprobaciones

```bash
npm test
npm run lint
npm run build
```

Las pruebas utilizan respuestas e imágenes simuladas en memoria; no añaden fotografías
a `public/panoramas/`.
