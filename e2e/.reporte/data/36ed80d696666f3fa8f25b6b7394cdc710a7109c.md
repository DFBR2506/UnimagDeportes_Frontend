# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/estudiante.e2e.js >> Entrada y sesión >> [ACC-47] la demo conserva el destino
- Location: e2e/demo/estudiante.e2e.js:94:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /checkin/
Received string:  "http://localhost:5190/app/inicio"
Timeout: 3000ms

Call log:
  - Expect "toHaveURL" with timeout 3000ms
    9 × locator resolved to <html lang="es">…</html>
      - unexpected value "http://localhost:5190/app/inicio"

```

```yaml
- banner:
  - button "UNIMAG DEPORTES"
  - navigation "Principal":
    - button "Inicio"
    - button "Disponibilidad"
    - button "Mis reservas"
  - button "MP María Pérez"
- main:
  - heading "Hola, María" [level=1]
  - paragraph: Tu actividad deportiva universitaria, en un solo lugar.
  - heading "Reserva tu próximo espacio" [level=2]
  - paragraph: Consulta franjas libres y confirma en segundos.
  - button "Consultar disponibilidad"
  - heading "Mi cuota semanal" [level=2]
  - paragraph: 0 h usadas
  - progressbar "Cuota semanal": x
  - paragraph: 4 h disponibles · reinicia el lunes
  - heading "Accesos rápidos" [level=2]
  - link "Mis reservas Aún no tienes reservas próximas":
    - /url: /app/mis-reservas
  - link "Check-in QR Confirma asistencia al ingresar al espacio":
    - /url: /app/mis-reservas
  - link "Reglas de uso Consulta los valores vigentes del sistema":
    - /url: /app/mis-reservas/reglas
- button "Contactar al administrador"
- region "Notifications"
```

# Test source

```ts
  1   | import { HOY, ID, LUNES_SIGUIENTE, MANANA, abrirCancha, celda, columna, continuar, estado, expect, leerEstado, libres, reserva, test, titulo } from '../support/demo.js'
  2   | 
  3   | const confirmar = (page) => page.getByRole('button', { name: 'Confirmar reserva' })
  4   | const panel = (page) => page.getByText('Franja seleccionada').locator('visible=true').locator('../..')
  5   | /** Cancha de prueba sin ocupación simulada: no depende del azar de la fecha. */
  6   | const reservarPrimera = async (page, day = 1) => {
  7   |   await libres(page, day).first().click()
  8   |   await continuar(page)
  9   |   await expect(titulo(page, 'Confirma tu reserva')).toBeVisible()
  10  |   await page.waitForTimeout(800) // QA-30: la pantalla se monta dos veces y descarta lo tecleado antes
  11  | }
  12  | 
  13  | test.describe('Entrada y sesión', () => {
  14  |   test('[ACC-01][ACC-02] rutas sin sesión y botón deshabilitado @firefox', async ({ page }) => {
  15  |     for (const p of ['/', '/xyz', '/app/inicio', '/admin']) {
  16  |       await page.goto(p)
  17  |       await expect(page).toHaveURL(/bienvenida/)
  18  |     }
  19  |     await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  20  |     const boton = page.getByRole('button', { name: 'Solicitar código' })
  21  |     await expect(boton).toBeDisabled()
  22  |     await page.getByLabel('Correo institucional').fill('   ')
  23  |     await expect(boton).toBeDisabled()
  24  |   })
  25  | 
  26  |   test('[ACC-03][ACC-04][ACC-06] dominio no permitido', async ({ page }) => {
  27  |     for (const email of ['alguien@gmail.com', 'a@unimagdalena.edu.co.evil.com']) {
  28  |       await page.goto('/acceso')
  29  |       await page.getByLabel('Correo institucional').fill(email)
  30  |       await page.getByRole('button', { name: 'Solicitar código' }).click()
  31  |       await expect(page.getByText(`${email} no pertenece`)).toBeVisible()
  32  |       await expect(page.getByText('No se envió ningún correo')).toBeVisible()
  33  |     }
  34  |     await page.getByRole('button', { name: 'Volver a intentar' }).click()
  35  |     await expect(page.getByLabel('Correo institucional')).toBeEditable()
  36  |   })
  37  | 
  38  |   test('[ACC-05] correo mal escrito no navega', async ({ page }) => {
  39  |     await page.goto('/acceso')
  40  |     for (const email of ['sin-arroba', 'a@b@unimagdalena.edu.co']) {
  41  |       await page.getByLabel('Correo institucional').fill(email)
  42  |       await page.getByRole('button', { name: 'Solicitar código' }).click()
  43  |       await expect(page).toHaveURL(/\/acceso$/)
  44  |     }
  45  |   })
  46  | 
  47  |   test('[ACC-07] sin backend avisa y se queda', async ({ page }) => {
  48  |     await page.route('**/api/**', (r) => r.abort())
  49  |     await page.goto('/acceso')
  50  |     await page.getByLabel('Correo institucional').fill('ana@unimagdalena.edu.co')
  51  |     await page.getByRole('button', { name: 'Solicitar código' }).click()
  52  |     await expect(page.getByText('No pudimos enviar el código')).toBeVisible()
  53  |     await expect(page).toHaveURL(/\/acceso$/)
  54  |   })
  55  | 
  56  |   test('[ACC-20] /acceso/codigo directo vuelve a /acceso', async ({ page }) => {
  57  |     await page.goto('/acceso/codigo')
  58  |     await expect(page).toHaveURL(/\/acceso$/)
  59  |   })
  60  | 
  61  |   test('[ACC-40][ACC-52] la sesión sobrevive a recargar; el acceso redirige @movil @firefox', async ({ page, demo }) => {
  62  |     await demo({ role: null })
  63  |     await page.goto('/')
  64  |     await page.getByRole('button', { name: 'Entrar como estudiante' }).click()
  65  |     await expect(titulo(page, 'Hola, María')).toBeVisible()
  66  |     await page.reload()
  67  |     await expect(titulo(page, 'Hola, María')).toBeVisible()
  68  |     for (const p of ['/bienvenida', '/acceso']) {
  69  |       await page.goto(p)
  70  |       await expect(page).toHaveURL(/app\/inicio/)
  71  |     }
  72  |   })
  73  | 
  74  |   test('[ACC-41] el estudiante no entra al administrador', async ({ page, demo }) => {
  75  |     await demo()
  76  |     for (const p of ['/admin', '/admin/espacios', '/admin/bloqueos', '/admin/reglas', '/admin/espacios/qr']) {
  77  |       await page.goto(p)
  78  |       await expect(page).toHaveURL(/app\/inicio/)
  79  |     }
  80  |   })
  81  | 
  82  |   test('[ACC-44][ACC-45] cerrar sesión borra el token y Atrás no muestra datos', async ({ page, demo }) => {
  83  |     await demo()
  84  |     await page.goto('/app/mis-reservas')
  85  |     await page.locator('header button').last().click()
  86  |     await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click()
  87  |     await expect(page).toHaveURL(/bienvenida/)
  88  |     expect(await page.evaluate(() => localStorage.getItem('ud-token'))).toBeNull()
  89  |     expect(await page.context().cookies()).toEqual([])
  90  |     await page.goBack()
  91  |     await expect(page.getByText('María')).toBeHidden()
  92  |   })
  93  | 
  94  |   test('[ACC-47] la demo conserva el destino', async ({ page, demo }) => {
  95  |     test.fail(true, 'QA-08')
  96  |     await demo({ role: null })
  97  |     await page.goto(`/checkin/${ID.multiple1}`)
  98  |     await page.getByRole('button', { name: 'Entrar como estudiante' }).click()
  99  |     await expect(page).not.toHaveURL(/bienvenida/)
> 100 |     await expect(page).toHaveURL(/checkin/, { timeout: 3000 })
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  101 |   })
  102 | })
  103 | 
  104 | test.describe('Disponibilidad', () => {
  105 |   test('[DIS-01][DIS-02] cuatro canchas en orden y con sus datos @movil', async ({ page, demo }) => {
  106 |     await demo()
  107 |     await page.goto('/app/disponibilidad')
  108 |     const cards = page.getByRole('button', { name: /Ver horario/ })
  109 |     await expect(cards).toHaveCount(4)
  110 |     const names = await cards.locator('p.font-display').allTextContents()
  111 |     expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')))
  112 |     await expect(page.getByText('Cancha fútbol 5')).toHaveCount(0)
  113 |     await expect(cards.filter({ hasText: 'tenis 1' })).toContainText('6:00 a. m. – 6:00 p. m.')
  114 |     await expect(cards.filter({ hasText: 'tenis 1' })).toContainText('Aforo 4')
  115 |   })
  116 | 
  117 |   test('[DIS-03] las franjas libres de hoy coinciden con el calendario', async ({ page, demo }) => {
  118 |     await demo()
  119 |     await page.goto('/app/disponibilidad')
  120 |     const card = page.getByRole('button', { name: /múltiple 1.*Ver horario/ })
  121 |     await expect(card).toContainText(/franjas? libres? hoy|Sin franjas/)
  122 |     const n = Number(/(\d+) franjas? libre/.exec(await card.textContent())?.[1] ?? 0)
  123 |     await card.click()
  124 |     await expect(page.getByText(/En vivo/)).toBeVisible()
  125 |     await expect(libres(page, 0)).toHaveCount(n)
  126 |   })
  127 | 
  128 |   test('[DIS-04] singular con una sola franja', async ({ page, demo }) => {
  129 |     test.fail(true, 'QA-09')
  130 |     const state = estado()
  131 |     state.spaces = [state.spaces[0]]
  132 |     await demo({ state })
  133 |     await abrirCancha(page)
  134 |     const horas = await columna(page, 0).locator('button').evaluateAll((els) => els.flatMap((e, i) => (e.disabled ? [] : [8 + i])))
  135 |     expect(horas.length).toBeGreaterThan(1)
  136 |     await page.evaluate(({ horas, id, date }) => {
  137 |       const k = 'ud-demo-state-v1', s = JSON.parse(localStorage.getItem(k))
  138 |       s.blocks = horas.slice(1).map((h) => ({ id: `b${h}`, spaceId: id, date, startHour: h, endHour: h + 1, reason: 'x', type: 'CLASS' }))
  139 |       localStorage.setItem(k, JSON.stringify(s))
  140 |     }, { horas, id: ID.multiple1, date: HOY })
  141 |     await page.goto('/app/disponibilidad')
  142 |     await expect(page.getByRole('button', { name: /múltiple 1.*1 franjas? libres? hoy/ })).toBeVisible()
  143 |     await expect(page.getByRole('button', { name: /1 franja libre hoy/ })).toBeVisible({ timeout: 1500 })
  144 |   })
  145 | 
  146 |   test('[DIS-05] sin canchas activas', async ({ page, demo }) => {
  147 |     const state = estado()
  148 |     state.spaces.forEach((s) => (s.status = 'MAINTENANCE'))
  149 |     await demo({ state })
  150 |     await page.goto('/app/disponibilidad')
  151 |     await expect(page.getByText('No hay espacios disponibles')).toBeVisible()
  152 |   })
  153 | 
  154 |   test('[DIS-06] cancha inexistente o en mantenimiento', async ({ page, demo }) => {
  155 |     await demo()
  156 |     for (const id of ['no-existe', ID.futbol5]) {
  157 |       await page.goto(`/app/disponibilidad/${id}`)
  158 |       await expect(page).toHaveURL(/disponibilidad$/)
  159 |     }
  160 |   })
  161 | 
  162 |   test('[DIS-10][DIS-11][DIS-12] 7 días, horizonte y pasado', async ({ page, demo }) => {
  163 |     await demo()
  164 |     await abrirCancha(page)
  165 |     await expect(page.locator('[aria-busy] > div.border-l')).toHaveCount(7)
  166 |     await expect(columna(page, 0).locator('button')).toHaveCount(12)
  167 |     for (const h of [8, 9]) await expect(celda(page, 0, h)).toBeDisabled()
  168 |     await page.getByRole('button', { name: 'Semana siguiente' }).click()
  169 |     await expect(page.getByRole('button', { name: 'Semana siguiente' })).toBeDisabled()
  170 |     await expect.poll(() => columna(page, 1).locator('button:not([disabled])').count()).toBe(0)
  171 |   })
  172 | 
  173 |   test('[DIS-11] la demo usa el mismo horizonte que el backend (hoy + 6)', async ({ page, demo }) => {
  174 |     test.fail(true, 'QA-28: el simulador quedó en 7 días y el backend pasó a 6')
  175 |     await demo()
  176 |     await page.goto('/app/mis-reservas/reglas')
  177 |     const fila = page.locator('dl > div', { hasText: 'Anticipación máxima' })
  178 |     await expect(fila).toContainText(/\d días/)
  179 |     await page.waitForTimeout(1000)
  180 |     await expect(fila).toContainText('6 días', { timeout: 1500 })
  181 |   })
  182 | 
  183 |   for (const [id, min, ok] of [['DIS-13', 9, true], ['DIS-14', 11, false]]) {
  184 |     test(`[${id}] minuto ${min} de la franja en curso`, async ({ page, demo }) => {
  185 |       // se busca una hora libre de hoy para situar el reloj dentro de ella
  186 |       await demo({ time: `${HOY}T06:00:00-05:00` })
  187 |       await abrirCancha(page)
  188 |       const label = await libres(page, 0).first().getAttribute('aria-label')
  189 |       const index = await columna(page, 0).locator('button').evaluateAll((els, l) => els.findIndex((e) => e.getAttribute('aria-label') === l), label)
  190 |       const hour = 8 + index
  191 |       await page.clock.setFixedTime(new Date(`${HOY}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00-05:00`))
  192 |       await abrirCancha(page)
  193 |       await expect(celda(page, 0, hour)).toBeEnabled({ enabled: ok })
  194 |     })
  195 |   }
  196 | 
  197 |   test('[DIS-15][DIS-16] motivos visibles y sin nombres', async ({ page, demo }) => {
  198 |     await demo({ state: estado({ blocks: [{ id: 'b', spaceId: ID.multiple1, date: MANANA, startHour: 9, endHour: 11, reason: 'Torneo interno', type: 'EVENT' }] }) })
  199 |     await abrirCancha(page)
  200 |     await expect(columna(page, 1).locator('[title^="Torneo interno · 9:00 a. m."]')).toBeVisible()
```