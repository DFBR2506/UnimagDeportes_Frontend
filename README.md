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
