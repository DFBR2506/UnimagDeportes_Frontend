# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/transversal.e2e.js >> Diseño >> [TRX-02] la barra inferior no tapa el final de la página
- Location: e2e/demo/transversal.e2e.js:32:3

# Error details

```
Error: /app/mis-reservas/reglas

/app/mis-reservas/reglas

expect(received).toMatchObject(expected)

- Expected  - 1
+ Received  + 1

  Object {
-   "tapado": 0,
+   "tapado": 30,
  }

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=f5e1]:
  - generic [ref=f5e2]:
    - generic [ref=f5e3]:
      - banner [ref=f5e4]:
        - generic [ref=f5e5]:
          - button "UNIMAG DEPORTES" [ref=f5e6] [cursor=pointer]:
            - generic [ref=f5e8]:
              - generic [ref=f5e9]: UNIMAG
              - generic [ref=f5e10]: DEPORTES
          - button "MP" [ref=f5e12] [cursor=pointer]
      - main [ref=f5e17]:
        - generic [ref=f5e19]:
          - navigation "Primary" [ref=f5e20]:
            - list [ref=f5e21]:
              - listitem [ref=f5e22]:
                - button "Reservas" [ref=f5e23] [cursor=pointer]
              - listitem [ref=f5e25]:
                - button "Mi cuota" [ref=f5e26] [cursor=pointer]
              - listitem [ref=f5e28]:
                - button "Reglas de uso" [ref=f5e29] [cursor=pointer]
          - generic [ref=f5e33]:
            - generic [ref=f5e35]:
              - heading "Reglas de uso" [level=1] [ref=f5e36]
              - paragraph [ref=f5e37]: Valores vigentes configurados para todas las personas.
            - generic [ref=f5e39]:
              - generic [ref=f5e40]:
                - term [ref=f5e41]: Franja
                - definition [ref=f5e42]: 60 minutos
              - generic [ref=f5e43]:
                - term [ref=f5e44]: Duración máxima
                - definition [ref=f5e45]: 2 franjas consecutivas (2 horas)
              - generic [ref=f5e46]:
                - term [ref=f5e47]: Cuota semanal
                - definition [ref=f5e48]: 4 horas
              - generic [ref=f5e49]:
                - term [ref=f5e50]: Anticipación máxima
                - definition [ref=f5e51]: 7 días
              - generic [ref=f5e52]:
                - term [ref=f5e53]: Tolerancia
                - definition [ref=f5e54]: 10 minutos tras el inicio
              - generic [ref=f5e55]:
                - term [ref=f5e56]: Cancelación tardía
                - definition [ref=f5e57]: Menos de 60 minutos
              - generic [ref=f5e58]:
                - term [ref=f5e59]: Ventana de check-in
                - definition [ref=f5e60]: 10 min antes hasta el fin de la reserva
              - generic [ref=f5e61]:
                - term [ref=f5e62]: Recordatorio
                - definition [ref=f5e63]: 2 horas antes por correo
              - generic [ref=f5e64]:
                - term [ref=f5e65]: Suspensión
                - definition [ref=f5e66]: 3 inasistencias en el mes → 7 días
            - generic [ref=f5e67]:
              - heading "En lenguaje claro" [level=2] [ref=f5e68]
              - generic [ref=f5e70]:
                - heading [level=3] [ref=f5e72]:
                  - button "¿Qué pasa si no asisto?" [ref=f5e73]
                - heading [level=3] [ref=f5e78]:
                  - button "¿Puedo cancelar en cualquier momento?" [ref=f5e79]
                - heading [level=3] [ref=f5e84]:
                  - button "¿Cómo confirmo mi asistencia?" [ref=f5e85]
                - heading [level=3] [ref=f5e90]:
                  - button "¿Puedo pedir implementos?" [ref=f5e91]
                - heading [level=3] [ref=f5e96]:
                  - button "¿Las reservas tienen costo?" [ref=f5e97]
    - navigation "Principal" [ref=f5e101]:
      - list [ref=f5e102]:
        - listitem [ref=f5e103]:
          - button "Inicio" [ref=f5e104] [cursor=pointer]
        - listitem [ref=f5e108]:
          - button "Canchas" [ref=f5e109] [cursor=pointer]
        - listitem [ref=f5e112]:
          - button "Reservas" [ref=f5e113] [cursor=pointer]
        - listitem [ref=f5e118]:
          - button "Contacto" [ref=f5e119] [cursor=pointer]
  - generic:
    - region "Notifications"
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
> 45  |       await expect.poll(solape, { message: path }).toMatchObject({ tapado: 0 })
      |                                                    ^ Error: /app/mis-reservas/reglas
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
  101 |     await expect(page.getByLabel('Correo institucional')).toHaveValue('maria', { timeout: 500 })
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
```