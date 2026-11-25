# Unimag Deportes — Cliente web

Cliente de la API real de reservas de espacios deportivos de la Universidad del
Magdalena, con demostración opcional en el navegador. Implementa las pantallas de Figma
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

Si necesita configuración local, copie `.env.example` a `.env.local` **solo si este
último no existe**. Los valores predeterminados son:

```dotenv
VITE_API_URL=/api
VITE_BACKEND_URL=http://localhost:8080
VITE_DEMO_LOGIN=false
```

El navegador solicita `/api/...`; el proxy de desarrollo de Vite retira `/api`
y reenvía a Spring Boot. La API real no tiene ese prefijo. Reinicie Vite o
recompile tras cambiar variables. Todas las variables `VITE_*` son públicas:
no incluya secretos JWT, SMTP ni PostgreSQL.

### Backend local y acceso OTP

Desde `../Unimag-Deportes`, complete su entorno según
[la guía del backend](../Unimag-Deportes/docs/techincal-plan/backend-connection.md).
Necesita claves independientes de al menos 32 bytes en `APP_AUTH_JWT_SECRET` y
`APP_AUTH_CODE_HMAC_SECRET`, además de:

```dotenv
APP_AUTH_ADMIN_EMAILS=<correo institucional administrador>
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
APP_CHECKIN_FRONTEND_ORIGIN=http://localhost:5173
APP_MAIL_CONTACT_URL=http://localhost:5173/app/contacto
APP_MAIL_CANCELLATION_URL=http://localhost:5173/reservations/{id}/cancel
APP_MAIL_CONTACT_RECIPIENT=salcendra@unimagdalena.edu.co
SPRING_PROFILES_ACTIVE=dev
APP_PORT=8080
```

Los marcadores `<...>` deben completarse; no son valores válidos. No sobrescriba
un `.env` existente ni guarde secretos en Git. Para ejecutar el backend en Docker:

```powershell
docker compose --profile app up --build -d
docker compose --profile app ps
```

Espere a que `app` esté saludable. Después de cambiar variables, recree únicamente
la aplicación con `docker compose --profile app up -d --force-recreate app`;
no borre volúmenes ni recree la base de datos para corregir configuración.

Los códigos reales se capturan en **Mailpit: http://localhost:8025**; no se envían a
Internet. Compose fija SMTP en `mailpit:1025`, por lo que cambiar `MAIL_HOST` en
`.env` no habilita por sí solo un proveedor externo. El rol lo asigna el backend:
`APP_AUTH_ADMIN_EMAILS` solo afecta el rol inicial de cuentas nuevas, no promueve
cuentas existentes ni depende del prefijo del correo.

Para comprobar el proxy sin solicitar un código:

```powershell
curl.exe -i http://localhost:5173/api/me
```

Un `401` sin token demuestra conectividad. Si falla la solicitud de código,
revise la respuesta de `/api/auth/code`, el estado de la API, las URLs de correo,
los límites de reenvío y SMTP. Mantenga los orígenes coherentes con el puerto
real de Vite. Para QR HTTP local se requiere el perfil `dev`; desactívelo en producción.
Un teléfono no puede acceder a su PC mediante `localhost`: necesita un origen
accesible desde la red y configuración correspondiente.

## Recorrido

- **Acceso (UC01):** bienvenida → correo institucional (solo `@unimagdalena.edu.co`) →
  código OTP real de 6 dígitos → nombre en el primer ingreso. El JWT se conserva en
  `localStorage` bajo `ud-token` y viaja solo en `Authorization: Bearer`, nunca en URLs
  ni cookies. Los fallos transitorios de sesión y carga inicial permiten reintentar.
- **Estudiante:** inicio, disponibilidad (disciplina/espacio/fecha, hasta 2 franjas
  consecutivas), confirmación con validaciones (RN-10..18), comprobante, mis reservas,
  cancelación a tiempo/tardía, cuota semanal, reglas, contacto y check-in QR
  (`/checkin/:espacio`, con ventana real).
- **Administrador:** inicia sesión con una cuenta cuyo rol sea `ADMIN` y entra por «Modo administrador»:
  panel de ocupación, espacios y franjas (crear/editar), bloqueos institucionales
  (cancelan reservas afectadas — RN-43), consulta paginada de bloqueos e historial de
  cancelaciones, configuración de reglas (se refleja en toda la app) y generación de
  QR por espacio.

En **Administrador → Bloqueos**, el historial se filtra por espacio, fechas incluidas
y estado. «No cancelado» también incluye franjas finalizadas. La cancelación selecciona
el ID de `GET /admin/blocks`, no el motivo del calendario; exige motivo y reautenticación
reciente. Solo admite una primera cancelación antes del fin de la franja. El historial
conserva los datos originales y muestra UUID del administrador, fecha y motivo de
cancelación. Cancelar no reactiva reservas, no cancela toda una recurrencia ni levanta
el mantenimiento; la disponibilidad y la ocupación se vuelven a consultar.

La API es la autoridad para permisos, cuota, disponibilidad, stock y sanciones.
Usa UUID y fechas de `America/Bogota`; el calendario abarca hoy…hoy + 6 inclusive.
Una instalación nueva puede no contener espacios ni implementos: créelos mediante
la administración, sin insertar fixtures demo en la base compartida.

En creación y edición de espacios solo se prohíbe **Fútbol 5 + Fútbol 11**.
El formulario, la simulación y el backend validan esa combinación. Las demás siguen
permitidas, incluidos baloncesto + voleibol y Fútbol 5 + tenis.

### Demostración opcional

Solo `VITE_DEMO_LOGIN=true` muestra el bloque «Recorrido MVP» y habilita sesiones
simuladas. Ausencia, vacío, `false`, `TRUE` y `1` no la activan. No utiliza
`/dev/login` ni se activa como respaldo ante fallos de red o de la API.
Al desactivarla se elimina un token `demo:*` antiguo, pero se conservan los datos demo.
Exclusivamente en la simulación, la ocupación es determinista y reservas, bloqueos,
espacios y reglas persisten en `localStorage`; las imágenes subidas son temporales.

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

En la demostración, las imágenes cargadas mediante el formulario administrativo prevalecen durante la
sesión de la página. No escriben en `public/`: después de recargar se recuperan los
archivos demo. Los espacios nuevos sin archivo asociado deben volver a cargar su
imagen. El visor conserva únicamente el panorama en uso y libera descargas/URLs al
cambiar de cancha o sesión y al desmontarse; no acumula panoramas en una caché global.
Cada instancia posee un contenedor y un contexto independientes. Al cerrarla se
cancelan descargas y callbacks, se descartan texturas tardías y se completa la
destrucción cuando termina la carga pendiente, evitando reinicializar servicios ya
destruidos. También se limpian las construcciones parciales si falla el constructor.

### Integración con backend

`useSpacePanorama` consume el mismo cliente HTTP y el mismo contrato en ambos modos:

```http
GET /spaces/{id}/images/PANORAMA
Authorization: Bearer <token>
```

- Con demostración habilitada y un token `demo:…`, `mockApi` devuelve la imagen subida temporalmente o descarga
  el archivo local asociado. No necesita backend ni un CDN externo.
- Con una sesión real, el cliente pide el binario al backend configurado mediante
  `VITE_API_URL`. La respuesta debe ser una imagen PNG/JPG/JPEG/WebP válida, no JSON ni HTML.
- Un `404` indica ausencia de imagen; un `401` conserva el manejo global de sesión.
  Los errores del backend **no** se ocultan usando fotografías demo.
- La descarga usa Bearer y pasa al visor como URL `blob:`; el token nunca se incluye
  en la URL. Los archivos de `public/` son públicos y solo corresponden a la demo.
- El backend valida y persiste las imágenes en PostgreSQL (`space_image`), no en
  Supabase Storage. La creación usa multipart y el reemplazo su endpoint de imágenes.
  Configure CORS para despliegues con orígenes distintos. El visor no cambia.

### Comprobaciones

```bash
npm test
npm run test:integration
npm run test:browser:blocks
npm run lint
npm run build
```

`npm test` conserva Vitest para panoramas y pruebas React; `test:integration` ejecuta
`node --test tests/*.test.js` con Vite, sin dependencias adicionales. Cubre configuración,
demo, disciplinas, HTTP, multipart, errores de sesión y SSE. Estas pruebas controlan
respuestas; por sí solas no acreditan conexión con una API real. No añaden fotografías
a `public/panoramas/`. En el backend, `.\mvnw.cmd clean verify` requiere Java 25 y Docker
y debe ejecutarse sin configuración de producción heredada, especialmente
`SPRING_CONFIG_IMPORT`; Testcontainers proporciona servicios aislados.

`test:browser:blocks` inicia Vite y una API de prueba aislada, y usa Chrome headless
en escritorio (1440 × 1000) y móvil emulado (390 × 844). En Windows busca Chrome en
`C:\Program Files\Google\Chrome\Application\chrome.exe`; `CHROME_PATH` permite indicar
otro binario. En otros sistemas requiere además `TMPDIR`. Comprueba confirmación,
OTP, errores, reintento idempotente, historial, filtros, foco de teclado y SSE. Guarda
capturas en el directorio temporal y elimina su perfil de Chrome al terminar. No usa
datos reales ni acredita por sí solo integración con Spring Boot o accesibilidad completa.

## Despliegue

El [informe de integración](docs/integracion-backend.md) registra los archivos
afectados, las verificaciones realizadas y sus limitaciones.

- Compile con `VITE_DEMO_LOGIN=false`.
- Use una `VITE_API_URL` pública HTTPS con CORS exacto en el backend, o un proxy
  de producción `/api` que retire ese prefijo. El proxy de Vite solo existe en desarrollo.
- Configure URLs públicas de contacto, cancelación y QR, y resuelva rutas SPA
  al abrir directamente enlaces de correo o `/checkin/:spaceId`.
- Desactive `dev` e inyecte secretos, PostgreSQL y SMTP desde el entorno seguro.
- Permita SSE sin buffering ni timeouts incompatibles, y multipart hasta 30 MiB
  por archivo y 64 MiB por solicitud.
- SMTP institucional, navegación móvil y accesibilidad requieren aceptación en
  el entorno real; esta integración no implementa SMTP externo ni Supabase Storage.
