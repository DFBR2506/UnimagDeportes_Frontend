# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/admin.e2e.js >> Bloqueos >> [ADM-56] sin fechas coincidentes avisa
- Location: e2e/demo/admin.e2e.js:321:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByText('Bloqueo confirmado')
Expected: 0
Received: 1
Timeout:  500ms

Call log:
  - Expect "toHaveCount" getByText('Bloqueo confirmado') with timeout 500ms
  - waiting for getByText('Bloqueo confirmado')
    5 × locator resolved to 1 element
      - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - button "UNIMAG DEPORTES" [ref=e6] [cursor=pointer]:
          - generic [ref=e8]:
            - generic [ref=e9]: UNIMAG
            - generic [ref=e10]: DEPORTES
        - generic [ref=e11]: Admin
        - navigation "Principal" [ref=e13]:
          - button "Panel de ocupación" [ref=e14] [cursor=pointer]
          - button "Espacios" [ref=e18] [cursor=pointer]
          - button "Bloquear franjas" [ref=e23] [cursor=pointer]
          - button "Reglas de uso" [ref=e29] [cursor=pointer]
        - button "ED Equipo de Deportes" [ref=e34] [cursor=pointer]:
          - generic [ref=e35]: ED
          - generic [ref=e37]: Equipo de Deportes
    - main [ref=e40]:
      - generic [ref=e42]:
        - generic [ref=e44]:
          - heading "Bloquear franjas" [level=1] [ref=e45]
          - paragraph [ref=e46]: Los bloqueos tienen prioridad sobre las reservas futuras.
        - generic [ref=e48]:
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: Espacio
              - combobox "Espacio" [ref=e53] [cursor=pointer]:
                - generic [ref=e54]: Cancha múltiple 1
            - generic [ref=e58]:
              - generic [ref=e59]: Tipo
              - combobox "Tipo" [ref=e61] [cursor=pointer]:
                - generic [ref=e62]: Clases y grupos formativos
          - generic [ref=e66]:
            - generic [ref=e67]:
              - generic [ref=e68]: Desde
              - textbox "Desde" [ref=e69]: 2026-11-24
            - generic [ref=e70]:
              - generic [ref=e71]: Desde
              - combobox "Hora de inicio" [ref=e73] [cursor=pointer]:
                - generic [ref=e74]: 8:00 a. m.
            - generic [ref=e78]:
              - generic [ref=e79]: Hasta
              - combobox "Hora de fin" [ref=e81] [cursor=pointer]:
                - generic [ref=e82]: 9:00 a. m.
          - generic [ref=e87]:
            - generic [ref=e88]: Motivo
            - textbox "Motivo" [ref=e89]:
              - /placeholder: Clase de voleibol
            - paragraph [ref=e90]: Se muestra en el calendario de los estudiantes (RN-44).
          - generic [ref=e91]:
            - generic [ref=e92]:
              - paragraph [ref=e93]: Modalidad
              - group "Modalidad del bloqueo" [ref=e94]:
                - button "Bloqueo puntual" [ref=e95]
                - button "Fijo / recurrente" [pressed] [ref=e96]
            - generic [ref=e97]:
              - generic [ref=e98]:
                - paragraph [ref=e99]: Se repite los
                - group "Días de la semana" [ref=e100]:
                  - button "Lun" [ref=e101]
                  - button "Mar" [ref=e102]
                  - button "Mié" [ref=e103]
                  - button "Jue" [ref=e104]
                  - button "Vie" [ref=e105]
                  - button "Sáb" [ref=e106]
                  - button "Dom" [pressed] [ref=e107]
              - generic [ref=e108]:
                - generic [ref=e109]: Hasta el
                - textbox "Hasta el" [ref=e110]: 2026-11-25
          - paragraph [ref=e111]: Las reservas futuras afectadas se cancelan por administrador sin contar cuota y se avisa por correo. Si alguna franja tiene una reserva en curso, no se crea nada. (RN-43) Por seguridad te pediremos un código enviado a tu correo.
          - generic [ref=e112]:
            - button "Confirmar bloqueo" [disabled]
        - generic [ref=e113]:
          - heading "Creados en esta sesión" [level=2] [ref=e114]
          - list [ref=e115]:
            - listitem [ref=e116]:
              - generic [ref=e117]:
                - paragraph [ref=e118]: Cancha múltiple 1 · 8:00 a. m.–9:00 a. m.
                - paragraph [ref=e119]: Desde Martes, 24 de noviembre hasta Miércoles, 25 de noviembre · Grupo · 0 franja(s)
              - generic [ref=e120]: Recurrente
  - generic:
    - region "Notifications":
      - dialog "Bloqueo confirmado" [ref=e121]:
        - generic [ref=e122]:
          - generic [ref=e123]:
            - heading "Bloqueo confirmado" [level=2] [ref=e124]
            - paragraph [ref=e125]: 0 franja(s) bloqueadas.
          - button [aria-hidden] [ref=e126]
```

# Test source

```ts
  227 |     await abrirCancha(page)
  228 |     await libres(page, 1).first().click()
  229 |     await page.getByRole('button', { name: /^Continuar/ }).locator('visible=true').click()
  230 |     await expect(page.getByText('Balón de baloncesto')).toBeVisible()
  231 |     await expect(page.getByText('Petos')).toHaveCount(0)
  232 |   })
  233 | 
  234 |   test('[ADM-43] stock por debajo de lo comprometido', async ({ page, demo }) => {
  235 |     await abrir(page, demo, { state: estado({ reservations: [reserva('a', { date: MANANA, hour: 9, equipment: [{ equipmentId: 'eq-petos', quantity: 5 }] })] }) })
  236 |     await fila(page, /Petos/).getByRole('button', { name: 'Editar' }).click()
  237 |     const campo = dialogo(page).getByLabel(/Stock/)
  238 |     await campo.fill('4')
  239 |     await dialogo(page).getByRole('button', { name: 'Guardar cambios' }).click()
  240 |     await expect(page.getByText(/no puede ser menor a 5/)).toBeVisible()
  241 |     await campo.fill('5')
  242 |     await dialogo(page).getByRole('button', { name: 'Guardar cambios' }).click()
  243 |     await expect(page.getByText('Implemento actualizado')).toBeVisible()
  244 |   })
  245 | })
  246 | 
  247 | test.describe('Bloqueos', () => {
  248 |   const abrir = async (page, demo, extra) => {
  249 |     await demo(admin(extra))
  250 |     await page.goto('/admin/bloqueos')
  251 |     await elegir(page, 'Espacio', 'Cancha múltiple 1')
  252 |   }
  253 |   const motivo = (page) => page.getByPlaceholder('Clase de voleibol')
  254 |   const ok = (page) => page.getByRole('button', { name: 'Confirmar bloqueo' })
  255 |   const franja = async (page, date, desde, hasta) => {
  256 |     await page.locator('#block-date').fill(date)
  257 |     await elegir(page, 'Hora de inicio', desde)
  258 |     await elegir(page, 'Hora de fin', hasta)
  259 |   }
  260 | 
  261 |   test('[ADM-50][ADM-51][ADM-61][DIS-15] puntual, motivo y lista @movil', async ({ page, demo, isMobile }) => {
  262 |     await abrir(page, demo)
  263 |     await expect(ok(page)).toBeDisabled()
  264 |     await motivo(page).fill('   ')
  265 |     await expect(ok(page)).toBeDisabled()
  266 |     await motivo(page).fill('Torneo QA')
  267 |     await franja(page, MANANA, '10:00 a. m.', '12:00 p. m.')
  268 |     await ok(page).click()
  269 |     await expect(page.getByText('2 franja(s) bloqueadas.')).toBeVisible()
  270 |     await expect(page.getByText('Creados en esta sesión')).toBeVisible()
  271 |     await page.goto('/admin/bloqueos')
  272 |     await expect(titulo(page, 'Bloquear franjas')).toBeVisible()
  273 |     await expect(page.getByText('Creados en esta sesión')).toHaveCount(0)
  274 |     if (isMobile) return
  275 |     await entrarComo(page, 'student', '/app/inicio')
  276 |     await abrirCancha(page)
  277 |     await expect(columna(page, 1).locator('[title^="Torneo QA"]')).toBeVisible()
  278 |   })
  279 | 
  280 |   test('[ADM-52] cancela la reserva del estudiante y libera la cuota', async ({ page, demo }) => {
  281 |     await abrir(page, demo, { state: estado({ reservations: [reserva('a', { date: MANANA, hour: 10 })] }) })
  282 |     await motivo(page).fill('Clase')
  283 |     await franja(page, MANANA, '10:00 a. m.', '11:00 a. m.')
  284 |     await ok(page).click()
  285 |     await expect(page.getByText('1 reserva(s) cancelada(s)')).toBeVisible()
  286 |     await entrarComo(page, 'student', '/app/mis-reservas')
  287 |     await page.getByRole('tab', { name: 'Historial (1)' }).click()
  288 |     await expect(page.getByText('Cancelada por administrador')).toBeVisible()
  289 |     await page.goto('/app/inicio')
  290 |     await expect(page.getByText('4 h disponibles')).toBeVisible()
  291 |   })
  292 | 
  293 |   test('[ADM-53] con reserva en uso no crea nada', async ({ page, demo }) => {
  294 |     await abrir(page, demo, { state: estado({ reservations: [reserva('a', { hour: 10, status: 'IN_USE' })] }) })
  295 |     await motivo(page).fill('Clase')
  296 |     await franja(page, HOY, '10:00 a. m.', '11:00 a. m.')
  297 |     await ok(page).click()
  298 |     await expect(page.getByText(/reserva en curso; no se creó/)).toBeVisible()
  299 |     expect((await leerEstado(page)).blocks).toHaveLength(0)
  300 |   })
  301 | 
  302 |   const recurrente = async (page, dias, hasta) => {
  303 |     await motivo(page).fill('Grupo')
  304 |     await page.getByRole('button', { name: 'Fijo / recurrente' }).click()
  305 |     for (const d of dias) await page.getByRole('button', { name: d, exact: true }).click()
  306 |     if (hasta) await page.locator('#block-until').fill(hasta)
  307 |   }
  308 |   test('[ADM-54][ADM-55] recurrente y sus validaciones', async ({ page, demo }) => {
  309 |     await abrir(page, demo)
  310 |     await franja(page, MANANA, '8:00 a. m.', '10:00 a. m.')
  311 |     await recurrente(page, [])
  312 |     await expect(ok(page)).toBeDisabled()
  313 |     await page.getByRole('button', { name: 'Lun', exact: true }).click()
  314 |     await page.getByRole('button', { name: 'Mié', exact: true }).click()
  315 |     await page.locator('#block-until').fill('2026-11-20')
  316 |     await expect(ok(page)).toBeDisabled()
  317 |     await page.locator('#block-until').fill('2026-12-08')
  318 |     await ok(page).click()
  319 |     await expect(page.getByText('8 franja(s) bloqueadas.')).toBeVisible() // 25/11, 30/11, 2/12 y 7/12, 2 h
  320 |   })
  321 |   test('[ADM-56] sin fechas coincidentes avisa', async ({ page, demo }) => {
  322 |     test.fail(true, 'QA-10')
  323 |     await abrir(page, demo)
  324 |     await recurrente(page, ['Dom'], '2026-11-25')
  325 |     await ok(page).click()
  326 |     await expect(page.getByText(/Bloqueo confirmado|No se pudo/)).toBeVisible()
> 327 |     await expect(page.getByText('Bloqueo confirmado')).toHaveCount(0, { timeout: 500 })
      |                                                        ^ Error: expect(locator).toHaveCount(expected) failed
  328 |   })
  329 |   test('[ADM-57] fecha pasada escrita a mano', async ({ page, demo }) => {
  330 |     await abrir(page, demo)
  331 |     await motivo(page).fill('x')
  332 |     await page.locator('#block-date').fill('2026-11-01')
  333 |     await ok(page).click()
  334 |     await page.waitForTimeout(800)
  335 |     expect((await leerEstado(page)).blocks).toHaveLength(0)
  336 |   })
  337 |   test('[ADM-59] las horas se ajustan al cambiar de espacio', async ({ page, demo }) => {
  338 |     await abrir(page, demo)
  339 |     await elegir(page, 'Hora de inicio', '7:00 p. m.')
  340 |     await elegir(page, 'Espacio', 'Cancha de tenis 1')
  341 |     await expect(page.getByLabel('Hora de inicio').locator('visible=true').first()).toContainText('6:00 a. m.')
  342 |   })
  343 | })
  344 | 
  345 | test.describe('Reglas y QR', () => {
  346 |   test('[ADM-70][ADM-71][ADM-72][ADM-73][MIS-51] editar, limitar, descartar y reflejar', async ({ page, demo }) => {
  347 |     await demo(admin())
  348 |     await page.goto('/admin/reglas')
  349 |     const guardar = page.getByRole('button', { name: 'Guardar cambios' }), descartar = page.getByRole('button', { name: 'Descartar' })
  350 |     const cuota = page.getByLabel(/Cuota semanal/), faltas = page.getByLabel(/Inasistencias para suspender/)
  351 |     await expect(guardar).toBeDisabled()
  352 |     await expect(descartar).toBeDisabled()
  353 |     for (const [c, v, e] of [[cuota, '0', '1'], [cuota, '999', '168'], [faltas, '0', '1'], [faltas, '99', '31']]) {
  354 |       await c.fill(v)
  355 |       await c.blur()
  356 |       await expect(c).toHaveValue(e)
  357 |     }
  358 |     await descartar.click()
  359 |     await expect(cuota).toHaveValue('4')
  360 |     await cuota.fill('6')
  361 |     await cuota.blur()
  362 |     await guardar.click()
  363 |     await expect(page.getByText('Reglas actualizadas')).toBeVisible()
  364 |     await entrarComo(page, 'student', '/app/mis-reservas/reglas')
  365 |     await expect(page.getByText('6 horas', { exact: true })).toBeVisible()
  366 |     await page.goto('/app/inicio')
  367 |     await expect(page.getByText('6 h disponibles')).toBeVisible()
  368 |   })
  369 | 
  370 |   test('[ADM-80][ADM-82] QR por espacio y descarga', async ({ page, demo }) => {
  371 |     await demo(admin())
  372 |     await page.goto('/admin/espacios/qr')
  373 |     const img = page.locator('main img[alt^="Código QR"]')
  374 |     await expect(img).toBeVisible()
  375 |     const antes = await img.getAttribute('src')
  376 |     await elegir(page, 'Espacio', 'Cancha múltiple 2')
  377 |     await expect(img).not.toHaveAttribute('src', antes)
  378 |     const [descarga] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Descargar SVG' }).click()])
  379 |     expect(descarga.suggestedFilename()).toMatch(/\.svg$/)
  380 |   })
  381 | 
  382 |   test('[ADM-82] el archivo conserva las tildes del nombre de forma legible', async ({ page, demo }) => {
  383 |     test.fail(true, 'QA-33: «múltiple» queda como «m-ltiple»')
  384 |     await demo(admin())
  385 |     await page.goto('/admin/espacios/qr')
  386 |     await elegir(page, 'Espacio', 'Cancha múltiple 2')
  387 |     await expect(page.locator('a[download]')).toHaveAttribute('download', /m[uú]ltiple/, { timeout: 2000 })
  388 |   })
  389 | 
  390 |   test('[ADM-81] al imprimir solo salen nombre y QR, en una hoja', async ({ page, demo }) => {
  391 |     await demo(admin())
  392 |     await page.goto('/admin/espacios/qr')
  393 |     await expect(page.locator('main img[alt^="Código QR"]')).toBeVisible()
  394 |     await page.emulateMedia({ media: 'print' })
  395 |     await expect(page.locator('.print-sheet')).toBeVisible()
  396 |     await expect(page.locator('#root')).toBeHidden()
  397 |     const pdf = await page.pdf()
  398 |     expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(1)
  399 |   })
  400 | })
  401 | 
  402 | test('[ACC-42][ACC-43] el administrador ve como estudiante, solo consulta', async ({ page, demo }) => {
  403 |   await demo(admin())
  404 |   await page.goto('/admin')
  405 |   await page.locator('header button').last().click()
  406 |   await page.getByRole('menuitem', { name: 'Ver como estudiante' }).click()
  407 |   await expect(page).toHaveURL(/app\/inicio/)
  408 |   await abrirCancha(page)
  409 |   await expect(page.getByText('Vista de consulta')).toBeVisible()
  410 |   await expect(celda(page, 1, 10)).toBeDisabled()
  411 |   await page.locator('header button').last().click()
  412 |   await page.getByRole('menuitem', { name: 'Modo administrador' }).click()
  413 |   await expect(page).toHaveURL(/\/admin$/)
  414 | })
  415 | 
```