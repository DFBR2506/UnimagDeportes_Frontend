# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/transversal.e2e.js >> Diseño >> [QA-30] lo escrito durante la transición no se pierde
- Location: e2e/demo/transversal.e2e.js:93:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByLabel('Correo institucional')
Expected: "maria"
Received: ""
Timeout:  500ms

Call log:
  - Expect "toHaveValue" getByLabel('Correo institucional') with timeout 500ms
  - waiting for getByLabel('Correo institucional')
    6 × locator resolved to <input value="" id="email" type="email" data-focused="" data-slot="input" autocomplete="email" aria-labelledby="base-ui-_r_f_" aria-describedby="base-ui-_r_h_" placeholder="nombre@unimagdalena.edu.co" class="flex w-full min-w-0 rounded-md border border-foreground/25 bg-background px-3 text-base md:text-sm shadow-xs outline-none state-transition file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground/60 focus-visible:border-ring focus-ring disabled:cursor-not-…/>
      - unexpected value ""

```

```yaml
- textbox "Correo institucional":
  - /placeholder: nombre@unimagdalena.edu.co
```

# Test source

```ts
  1   | import AxeBuilder from '@axe-core/playwright'
  2   | import { HOY, ID, MANANA, abrirCancha, dialogo, estado, expect, leerEstado, libres, reserva, test, titulo } from '../support/demo.js'
  3   | import { png } from '../stack/png.mjs'
  4   | 
  5   | const PANTALLAS = {
  6   |   null: ['/bienvenida', '/acceso', '/acceso/no-permitido'],
  7   |   student: ['/app/inicio', '/app/disponibilidad', `/app/disponibilidad/${ID.multiple1}`, '/app/mis-reservas', '/app/mis-reservas/cuota', '/app/mis-reservas/reglas', '/app/mis-reservas/cancelar/r', `/checkin/${ID.multiple1}`, '/app/conflicto'],
  8   |   admin: ['/admin', '/admin/espacios', '/admin/espacios/implementos', '/admin/espacios/qr', '/admin/bloqueos', '/admin/reglas'],
  9   | }
  10  | const conReserva = () => estado({ reservations: [reserva('r', { date: MANANA, hour: 9 })] })
  11  | const asentar = (page) => page.waitForTimeout(2200) // animaciones de entrada
  12  | 
  13  | test.describe('Diseño', () => {
  14  |   for (const width of [320, 390, 767, 768, 1023, 1024, 1280]) {
  15  |     test(`[TRX-01][TRX-03] ${width} px: sin desborde y con un solo menú`, async ({ page, demo }) => {
  16  |       test.setTimeout(120_000)
  17  |       await page.setViewportSize({ width, height: 800 })
  18  |       await demo({ role: null, state: conReserva() })
  19  |       for (const [role, paths] of Object.entries(PANTALLAS)) {
  20  |         await page.goto('/bienvenida')
  21  |         await page.evaluate((r) => (r === 'null' ? localStorage.removeItem('ud-token') : localStorage.setItem('ud-token', `demo:${r}`)), role)
  22  |         for (const path of paths) {
  23  |           await page.goto(path)
  24  |           await page.waitForTimeout(900)
  25  |           expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${path} a ${width}`).toBeLessThanOrEqual(0)
  26  |           if (role !== 'null') await expect(page.getByRole('navigation', { name: 'Principal' }).locator('visible=true'), path).toHaveCount(1)
  27  |         }
  28  |       }
  29  |     })
  30  |   }
  31  | 
  32  |   test('[TRX-02] la barra inferior no tapa el final de la página', async ({ page, demo }) => {
  33  |     await page.setViewportSize({ width: 390, height: 800 })
  34  |     await demo({ state: conReserva() })
  35  |     for (const path of PANTALLAS.student) {
  36  |       await page.goto(path)
  37  |       await asentar(page)
  38  |       const solape = () => page.evaluate(() => {
  39  |         scrollTo(0, document.body.scrollHeight)
  40  |         const barra = [...document.querySelectorAll('nav[aria-label="Principal"]')].find((n) => getComputedStyle(n).position === 'fixed').getBoundingClientRect().top
  41  |         const items = [...document.querySelectorAll('main a, main button, main p')].filter((e) => e.offsetParent)
  42  |         const ultimo = items.reduce((a, e) => (e.getBoundingClientRect().bottom > a.getBoundingClientRect().bottom ? e : a))
  43  |         return { tapado: Math.max(0, Math.floor(ultimo.getBoundingClientRect().bottom - barra)), cual: ultimo.textContent.slice(0, 60) }
  44  |       })
  45  |       await expect.poll(solape, { message: path }).toMatchObject({ tapado: 0 })
  46  |     }
  47  |   })
  48  | 
  49  |   test('[TRX-04] al cambiar de sección en móvil abre arriba @movil', async ({ page, demo }) => {
  50  |     await page.setViewportSize({ width: 390, height: 700 })
  51  |     await demo()
  52  |     await page.goto('/app/mis-reservas/reglas')
  53  |     await asentar(page)
  54  |     await page.evaluate(() => scrollTo(0, 500))
  55  |     await page.getByRole('button', { name: 'Canchas' }).click()
  56  |     await expect(titulo(page, 'Disponibilidad')).toBeVisible()
  57  |     await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  58  |   })
  59  | 
  60  |   test('[DIS-38][DIS-39][DIS-40] calendario táctil @movil', async ({ page, demo, isMobile }) => {
  61  |     test.skip(!isMobile, 'solo con pantalla táctil')
  62  |     await demo()
  63  |     await abrirCancha(page)
  64  |     await expect(page.locator('[aria-busy] > div.border-l').locator('visible=true')).toHaveCount(1)
  65  |     await page.getByRole('button', { name: /Miércoles, 25/ }).tap()
  66  |     const cell = page.locator('[aria-busy] button:not([disabled])').locator('visible=true').first()
  67  |     await cell.scrollIntoViewIfNeeded()
  68  |     const box = await cell.boundingBox()
  69  |     const cdp = await page.context().newCDPSession(page)
  70  |     const y0 = await page.evaluate(() => scrollY)
  71  |     const dedo = (type, dy) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: dy == null ? [] : [{ x: Math.round(box.x + 40), y: Math.round(box.y + 20 + dy) }] })
  72  |     await dedo('touchStart', 0)
  73  |     for (let i = 1; i <= 10; i++) await dedo('touchMove', -20 * i)
  74  |     await dedo('touchEnd')
  75  |     await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(y0)
  76  |     await page.waitForTimeout(600)
  77  |     await expect(page.getByText('Franja seleccionada').locator('visible=true')).toHaveCount(0)
  78  |     await cell.tap()
  79  |     const seguir = page.getByRole('button', { name: /^Continuar/ }).locator('visible=true')
  80  |     await expect(seguir).toBeInViewport()
  81  |     await seguir.tap()
  82  |     await expect(titulo(page, 'Confirma tu reserva')).toBeVisible()
  83  |   })
  84  | 
  85  |   test('[TRX-08] cambiar de sección muy rápido no deja pantallas en blanco', async ({ page, demo, errores }) => {
  86  |     await demo()
  87  |     await page.goto('/app/inicio')
  88  |     for (let i = 0; i < 12; i++) await page.getByRole('navigation', { name: 'Principal' }).locator('visible=true').getByRole('button').nth(i % 3).click({ force: true })
  89  |     await expect(titulo(page, 'Mis reservas')).toBeVisible()
  90  |     expect(errores).toEqual([])
  91  |   })
  92  | 
  93  |   test('[QA-30] lo escrito durante la transición no se pierde', async ({ page }) => {
  94  |     test.fail(true, 'QA-30: la pantalla entrante se monta dos veces')
  95  |     await page.goto('/bienvenida')
  96  |     await asentar(page)
  97  |     await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  98  |     await page.waitForTimeout(150)
  99  |     await page.keyboard.type('maria', { delay: 20 })
  100 |     await page.waitForTimeout(1500)
> 101 |     await expect(page.getByLabel('Correo institucional')).toHaveValue('maria', { timeout: 500 })
      |                                                           ^ Error: expect(locator).toHaveValue(expected) failed
  102 |   })
  103 | })
  104 | 
  105 | test.describe('Accesibilidad', () => {
  106 |   // Contraste aparte (QA-11): así cualquier otra infracción sí hace fallar la prueba.
  107 |   for (const [role, paths] of Object.entries(PANTALLAS)) {
  108 |     for (const path of paths) {
  109 |       test(`[TRX-23] axe ${path.replace(ID.multiple1, ':cancha')}`, async ({ page, demo }) => {
  110 |         await demo({ role: role === 'null' ? null : role, state: conReserva() })
  111 |         await page.goto(path)
  112 |         await asentar(page)
  113 |         const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).disableRules(['color-contrast']).analyze()
  114 |         expect(violations.map((v) => `${v.id}: ${v.nodes[0].target}`)).toEqual([])
  115 |       })
  116 |     }
  117 |   }
  118 |   for (const path of [`/app/disponibilidad/${ID.multiple1}`, '/admin']) {
  119 |     test(`[TRX-23] contraste en ${path.replace(ID.multiple1, ':cancha')}`, async ({ page, demo }) => {
  120 |       test.fail(true, 'QA-11')
  121 |       await demo({ role: path.startsWith('/admin') ? 'admin' : 'student', time: null })
  122 |       await page.goto(path)
  123 |       await page.waitForTimeout(3500)
  124 |       const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()
  125 |       expect(violations).toEqual([])
  126 |     })
  127 |   }
  128 | 
  129 |   test('[TRX-21] diálogos: foco dentro y Esc devuelve el foco', async ({ page, demo }) => {
  130 |     await demo({ role: 'admin' })
  131 |     await page.goto('/admin/espacios')
  132 |     await asentar(page)
  133 |     const abrir = page.getByRole('button', { name: 'Crear espacio' })
  134 |     await abrir.click()
  135 |     const d = dialogo(page)
  136 |     await expect(d).toBeVisible()
  137 |     for (let i = 0; i < 40; i++) {
  138 |       await page.keyboard.press('Tab')
  139 |       expect(await d.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body || document.activeElement.hasAttribute('data-base-ui-focus-guard'))).toBe(true)
  140 |     }
  141 |     await page.keyboard.press('Escape')
  142 |     await expect(d).toBeHidden()
  143 |     await expect(abrir).toBeFocused()
  144 |   })
  145 | 
  146 |   test('[TRX-25] «reducir movimiento» detiene las animaciones decorativas', async ({ page }) => {
  147 |     test.fail(true, 'QA-31: solo el visor 360° lo respeta')
  148 |     await page.emulateMedia({ reducedMotion: 'reduce' })
  149 |     await page.goto('/bienvenida')
  150 |     await asentar(page)
  151 |     const pos = () => page.locator('.blur-3xl').first().evaluate((e) => getComputedStyle(e).transform)
  152 |     const a = await pos()
  153 |     await page.waitForTimeout(1000)
  154 |     expect(await pos()).toBe(a)
  155 |   })
  156 | 
  157 |   test('[TRX-20] los botones de cantidad se anuncian en español', async ({ page, demo }) => {
  158 |     test.fail(true, 'QA-34: dicen «Increment» y «Decrement»')
  159 |     await demo({ role: 'admin' })
  160 |     await page.goto('/admin/reglas')
  161 |     await expect(page.getByLabel(/Cuota semanal/)).toBeVisible()
  162 |     await expect(page.getByRole('button', { name: 'Increment' })).toHaveCount(0, { timeout: 1000 })
  163 |   })
  164 | })
  165 | 
  166 | test.describe('Contacto', () => {
  167 |   test('[TRX-30][TRX-31][TRX-32][TRX-34] abrir, validar y enviar @movil', async ({ page, demo, isMobile }) => {
  168 |     await demo()
  169 |     await page.goto('/app/inicio')
  170 |     await page.getByRole('button', { name: isMobile ? 'Contacto' : 'Contactar al administrador', exact: true }).click()
  171 |     const d = dialogo(page), enviar = d.getByRole('button', { name: 'Enviar mensaje' })
  172 |     await d.getByLabel('Mensaje').fill('   ')
  173 |     await expect(enviar).toBeDisabled()
  174 |     await d.getByLabel('Mensaje').fill('<script>alert(1)</script>')
  175 |     await enviar.click()
  176 |     await expect(page.getByText('Mensaje enviado')).toBeVisible()
  177 |     await expect(d).toBeHidden()
  178 |   })
  179 | 
  180 |   test('[TRX-33] el enlace del correo abre el formulario y recargar no lo reabre', async ({ page, demo }) => {
  181 |     await demo()
  182 |     await page.goto('/app/contacto')
  183 |     await expect(dialogo(page)).toBeVisible()
  184 |     await page.reload()
  185 |     await expect(titulo(page, /Hola/)).toBeVisible()
  186 |     await expect(dialogo(page)).toHaveCount(0)
  187 |   })
  188 | 
  189 |   test('[TRX-34] cerrar sin enviar conserva el borrador', async ({ page, demo }) => {
  190 |     test.fail(true, 'QA-12')
  191 |     await demo()
  192 |     await page.goto('/app/contacto')
  193 |     await page.getByLabel('Mensaje').fill('borrador')
  194 |     await page.keyboard.press('Escape')
  195 |     await expect(dialogo(page)).toBeHidden()
  196 |     await page.getByRole('button', { name: 'Contactar al administrador' }).click()
  197 |     await expect(page.getByLabel('Mensaje')).toHaveValue('borrador', { timeout: 1500 })
  198 |   })
  199 | })
  200 | 
  201 | test.describe('Robustez', () => {
```