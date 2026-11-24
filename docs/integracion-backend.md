# Integración con la API real — entrega del 17 de noviembre de 2026

## Resultado y alcance

Se reutilizaron el cliente HTTP, JWT, adaptadores, imágenes autenticadas, SSE y
endpoints existentes. La aplicación usa la API real por defecto. La demostración
solo se activa con `VITE_DEMO_LOGIN=true`; no funciona como respaldo ante errores.
Los fallos de sesión, carga inicial, disponibilidad e implementos se muestran con
reintentos. El calendario tiene siete fechas, desde hoy hasta hoy + 6 en Bogotá.
Solo se rechaza la combinación Fútbol 5 + Fútbol 11, sin impedir otros espacios
multidisciplina ni modificar el esquema de la base.

No había conflictos de merge en ninguno de los repositorios al comenzar. El
frontend estaba limpio; el backend tenía ocho archivos modificados previamente.
Se revisaron y conservaron esas modificaciones sin atribuirlas a esta ejecución.
No se crearon ramas, commits ni pushes; no se modificaron secretos, archivos
`.env` locales, bases del usuario ni `package-lock.json`.

## Archivos por repositorio

### Frontend: modificados o añadidos en esta ejecución

- `.env.example`: demo explícitamente desactivada y advertencia sobre variables públicas.
- `README.md`: ejecución real, entorno, OTP/Mailpit, roles, panoramas y despliegue.
- `package.json`: script `test:integration`, conservando `test` con Vitest.
- `vitest.config.js`: separar las pruebas Vitest de las del ejecutor nativo.
- `src/lib/config.js`: bandera de demostración.
- `src/lib/api.js`: aislamiento demo, token por solicitud, errores tardíos y cierre SSE.
- `src/lib/mockApi.js`: horizonte y validación antes de mutar/persistir espacios.
- `src/data/domain.js`: horizonte y regla compartida de incompatibilidad.
- `src/store.jsx`: restauración reintentable, carga inicial y guardas de sesión.
- `src/components/app/ConnectionState.jsx`: presentación compartida de carga/error.
- `src/components/app/Shell.jsx`: protección de sesión y carga de datos.
- `src/App.jsx`: estado visible en la redirección inicial; rutas existentes conservadas.
- `src/pages/auth/Welcome.jsx`: accesos demo condicionales.
- `src/pages/auth/AuthLayout.jsx`: retirar la etiqueta general de aplicación simulada.
- `src/pages/admin/AdminSpaces.jsx`: impedir la combinación y permitir reparar espacios antiguos.
- `src/pages/student/CourtPicker.jsx`: errores de espacios y disponibilidad por cancha.
- `src/pages/student/ConfirmReservation.jsx`: error/reintento de implementos opcionales.
- `src/store.test.jsx`: cinco regresiones de carga, sesión, limpieza y respuestas antiguas.
- `tests/helpers.js`: aislamiento de Vite, variables, módulos y globales.
- `tests/config.test.js`: matriz de activación de demo.
- `tests/demo.test.js`: aislamiento, AbortSignal y rechazo sin mutaciones parciales.
- `tests/integration.test.js`: dominio, HTTP, multipart, errores y SSE.

### Backend: sin modificaciones nuevas en esta ejecución

La regla, contratos y casos solicitados ya estaban presentes en los cambios previos:

- `src/main/java/unimagdeportes/service/space/SpaceService.java`.
- `src/test/java/unimagdeportes/service/space/SpaceServiceTest.java`.
- `src/test/java/unimagdeportes/integration/space/SpaceImageIntegrationTest.java`.
- `docs/features/007-gestionar-espacios-y-franjas/spec.md`.
- `docs/reglas-y-contexto/unimagDeportes.md`.
- `docs/techincal-plan/backend-connection.md`.
- `docs/techincal-plan/contracts/spaces/POST-admin-spaces.md`.
- `docs/techincal-plan/contracts/spaces/PUT-admin-spaces-id.md`.

## Configuración necesaria

El [README](../README.md#ejecutar) contiene las variables y el arranque local.
Los valores efectivos comprobados para la compilación del frontend fueron:

```dotenv
VITE_API_URL=/api
VITE_BACKEND_URL=http://localhost:8080
VITE_DEMO_LOGIN=false
```

El backend necesita claves JWT/HMAC independientes, correo administrador, conexión
PostgreSQL/SMTP y URLs/orígenes coherentes. Consulte su
[guía de conexión](../../Unimag-Deportes/docs/techincal-plan/backend-connection.md)
y `.env.example`. Para QR con HTTP local se requiere `dev`; no debe usarse en producción.
Compose dirige el correo a Mailpit, no al buzón institucional.

## Verificación de esta ejecución

| Comando | Resultado actual |
| --- | --- |
| `npm ci --no-audit --no-fund` | Instalación desde el lockfile, sin modificarlo. El primer intento agotó 120 s; el segundo terminó correctamente. |
| `npm test` | 95 pruebas aprobadas en ocho archivos, incluidos los panoramas existentes. |
| `node --test tests/*.test.js` | Nueve pruebas principales y seis subcasos de configuración: 15 aprobadas. |
| `npm run lint` | Sin errores; conserva advertencias React y de componentes existentes, además de efectos de carga. |
| `npm run build` | Correcto; advertencia por bundles mayores de 500 kB. |
| `.\mvnw.cmd clean verify` | El log registra 281 pruebas sin fallos, errores ni omisiones, `BUILD SUCCESS` y JAR generado. Véase la salvedad de PowerShell. |
| `.\mvnw.cmd '-Dtest=SpaceServiceTest,SpaceImageIntegrationTest' test` mediante `cmd.exe` | Once pruebas aprobadas, `BUILD SUCCESS` y salida correcta del proceso. |
| `git diff --check` en ambos repositorios | Sin errores; Git advierte conversión LF/CRLF. |

El envoltorio de PowerShell devolvió código 1 en la ejecución completa, al capturar
advertencias nativas de Java como `NativeCommandError`; no se oculta esta anomalía.
El log de Maven sí termina en éxito y la repetición focalizada mediante `cmd.exe`
termina correctamente. Logs locales, no incluidos en Git:

- `C:\Users\sebas\AppData\Local\Temp\opencode\unimag-integration-current-verify.log`.
- `C:\Users\sebas\AppData\Local\Temp\opencode\unimag-integration-current-spaces.log`.
- `C:\Users\sebas\AppData\Local\Temp\opencode\unimag-integration-current-lint.log`.

### API y navegador reales

Se revisaron y ejecutaron los scripts temporales existentes
`unimag-integration-smoke.mjs` y `unimag-browser-smoke.mjs` desde
`C:\Users\sebas\AppData\Local\Temp\opencode`, no distribuidos con este repositorio.
Crearon PostgreSQL y Mailpit exclusivos, claves de prueba independientes y una
API/Vite con puertos propios. El cliente JS consumió la API real a través del proxy.

Se comprobaron OTP recibido por SMTP en Mailpit, perfil y rol, CORS, multipart,
rechazo POST/PUT incompatible, espacio multidisciplina, imagen Bearer, QR,
implementos, disponibilidad, stock, reserva persistida, SSE, cuota, listado,
cancelación, panel, parámetros, logout y recursos protegidos.

Chrome headless con perfil temporal comprobó bienvenida sin accesos demo,
sesión administradora real, carga de espacios y exclusión reversible de ambas
modalidades de fútbol, manteniendo habilitados baloncesto y voleibol. No detectó
excepciones JavaScript en ese recorrido. Usó un JWT obtenido por OTP en la prueba
HTTP: no automatizó todo el formulario OTP del navegador.

El script cerró Chrome, Vite y JAR y eliminó únicamente sus contenedores y recursos
temporales. La consulta posterior por la etiqueta de los contenedores de esta
prueba no devolvió recursos.

## Pendientes y fuera de alcance

- No se implementaron SMTP externo ni Supabase Storage; imágenes en PostgreSQL.
- No se acredita recepción institucional de correo, aceptación móvil completa,
  accesibilidad completa ni despliegue en producción.
- La prueba aislada no valida la configuración ni datos de una instalación local
  preexistente del usuario.
- No se cambió el esquema ni se corrigieron automáticamente espacios antiguos.
- Sin desviaciones funcionales deliberadas respecto de la guía; se conservó Vitest
  y se añadió un ejecutor separado para las pruebas nativas.
- Es recomendable una revisión posterior con `@auditor`; no se lanzó un subagente.
