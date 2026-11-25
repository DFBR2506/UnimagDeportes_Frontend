# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/estudiante.e2e.js >> Reservar >> [RES-11] semana siguiente con la actual agotada
- Location: e2e/demo/estudiante.e2e.js:400:3

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator:  getByRole('button', { name: 'Confirmar reserva' })
Expected: enabled
Received: disabled
Timeout:  3000ms

Call log:
  - Expect "toBeEnabled" getByRole('button', { name: 'Confirmar reserva' }) with timeout 3000ms
  - waiting for getByRole('button', { name: 'Confirmar reserva' })
    9 × locator resolved to <button disabled type="button" data-variant="candy" class="relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium outline-none ring-offset-background transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-solid focus-visible:outline-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:shadow-none disabled:ring-foreground/20 motion-reduce:tra…>…</button>
      - unexpected value "disabled"

```

```yaml
- button "Confirmar reserva" [disabled]
```

# Test source

```ts
  307 |     await fila(page, hit).scrollIntoViewIfNeeded()
  308 |     const a = await fila(page, hit).boundingBox()
  309 |     await page.mouse.move(a.x + 20, a.y + 20)
  310 |     await page.mouse.down()
  311 |     await page.mouse.move(a.x + 20, a.y + 80, { steps: 6 })
  312 |     await page.mouse.up()
  313 |     await expect(panel(page)).toContainText('· 1 h ·')
  314 |   })
  315 | 
  316 |   test('[DIS-36] solo queda la última, aunque sea otro día', async ({ page, demo }) => {
  317 |     await demo()
  318 |     await abrirCancha(page)
  319 |     await libres(page, 1).first().click()
  320 |     await libres(page, 2).first().click()
  321 |     await expect(panel(page)).toContainText('Jueves, 26 de noviembre')
  322 |     await expect(page.getByText('Nueva reserva', { exact: true })).toHaveCount(1)
  323 |   })
  324 | 
  325 |   test('[DIS-37][TRX-20] reservar solo con teclado @firefox', async ({ page, demo }) => {
  326 |     await demo()
  327 |     await abrirCancha(page)
  328 |     const cell = libres(page, 1).first()
  329 |     await cell.focus()
  330 |     await page.keyboard.press('Enter')
  331 |     await expect(panel(page)).toContainText('· 1 h ·')
  332 |     const next = page.getByRole('button', { name: /^Continuar/ }).locator('visible=true')
  333 |     await next.focus()
  334 |     await page.keyboard.press('Enter')
  335 |     await expect(titulo(page, 'Confirma tu reserva')).toBeVisible()
  336 |     await confirmar(page).focus()
  337 |     await page.keyboard.press('Enter')
  338 |     await expect(titulo(page, 'Reserva confirmada')).toBeVisible()
  339 |   })
  340 | })
  341 | 
  342 | test.describe('Reservar', () => {
  343 |   test('[RES-01][RES-03][MIS-40] reserva, comprobante y cuota @movil @firefox', async ({ page, demo, errores, isMobile }) => {
  344 |     await demo()
  345 |     await abrirCancha(page)
  346 |     if (isMobile) {
  347 |       await page.getByRole('button', { name: /Miércoles, 25/ }).click()
  348 |       await page.locator('[aria-busy] button:not([disabled])').locator('visible=true').first().click()
  349 |       await continuar(page)
  350 |     } else await reservarPrimera(page)
  351 |     await expect(page.locator('dl')).toContainText('Miércoles, 25 de noviembre')
  352 |     await confirmar(page).click()
  353 |     await expect(titulo(page, 'Reserva confirmada')).toBeVisible()
  354 |     await page.getByRole('button', { name: 'Ir a Mis reservas' }).click()
  355 |     await expect(page.getByRole('tab', { name: 'Próximas (1)' })).toBeVisible()
  356 |     await page.goto('/app/inicio')
  357 |     await expect(page.getByText('3 h disponibles')).toBeVisible()
  358 |     await page.goto('/app/mis-reservas/cuota')
  359 |     await expect(page.getByText('Cuota máxima: 4 h')).toBeVisible()
  360 |     expect(errores.filter((e) => !/panorama|WebGL|GL Driver/i.test(e))).toEqual([])
  361 |   })
  362 | 
  363 |   test('[RES-05] doble clic crea una sola', async ({ page, demo }) => {
  364 |     await demo()
  365 |     await abrirCancha(page)
  366 |     await reservarPrimera(page)
  367 |     await confirmar(page).dblclick()
  368 |     await expect(titulo(page, 'Reserva confirmada')).toBeVisible()
  369 |     expect((await leerEstado(page)).reservations).toHaveLength(1)
  370 |   })
  371 | 
  372 |   test('[RES-06] conflicto y regreso a la misma cancha', async ({ page, demo }) => {
  373 |     await demo({ random: 0.05 })
  374 |     await abrirCancha(page)
  375 |     await reservarPrimera(page)
  376 |     await confirmar(page).click()
  377 |     await expect(titulo(page, 'La franja ya no está disponible')).toBeVisible()
  378 |     await page.getByRole('button', { name: /Volver al calendario/ }).click()
  379 |     await expect(page).toHaveURL(new RegExp(ID.multiple1))
  380 |     expect((await leerEstado(page)).reservations).toHaveLength(0)
  381 |   })
  382 | 
  383 |   test('[RES-07] solape con otra cancha', async ({ page, demo }) => {
  384 |     const all = Array.from({ length: 6 }, (_, i) => reserva(`r${i}`, { space: ID.tenis1, date: MANANA, hour: 8 + 2 * i, hours: 2 }))
  385 |     await demo({ state: estado({ reservations: all, params: { weeklyHours: 40, noShows: 3 } }) })
  386 |     await abrirCancha(page)
  387 |     await reservarPrimera(page)
  388 |     await expect(page.getByText('Se cruza con otra reserva tuya')).toBeVisible()
  389 |     await expect(confirmar(page)).toBeDisabled()
  390 |   })
  391 | 
  392 |   test('[RES-09] cuota agotada esta semana', async ({ page, demo }) => {
  393 |     await demo({ state: estado({ reservations: [reserva('a', { date: HOY, hour: 6, hours: 4, space: ID.tenis1, status: 'COMPLETED' })] }) })
  394 |     await abrirCancha(page)
  395 |     await reservarPrimera(page, 1)
  396 |     await expect(page.getByText('solo te quedan 0 h esta semana')).toBeVisible()
  397 |     await expect(confirmar(page)).toBeDisabled()
  398 |   })
  399 | 
  400 |   test('[RES-11] semana siguiente con la actual agotada', async ({ page, demo }) => {
  401 |     test.fail(true, 'QA-01')
  402 |     await demo({ state: estado({ reservations: [reserva('a', { date: HOY, hour: 6, hours: 4, space: ID.tenis1, status: 'COMPLETED' })] }) })
  403 |     await abrirCancha(page)
  404 |     await reservarPrimera(page, 6)
  405 |     await expect(page.locator('dl')).toContainText('30 de noviembre')
  406 |     expect(LUNES_SIGUIENTE).toBe('2026-11-30')
> 407 |     await expect(confirmar(page)).toBeEnabled({ timeout: 3000 })
      |                                   ^ Error: expect(locator).toBeEnabled() failed
  408 |   })
  409 | 
  410 |   test('[RES-12] la semana siguiente también tiene su límite', async ({ page, demo }) => {
  411 |     await demo({ state: estado({ reservations: [reserva('a', { date: LUNES_SIGUIENTE, hour: 6, hours: 4, space: ID.tenis1 })] }) })
  412 |     await abrirCancha(page)
  413 |     const free = libres(page, 6)
  414 |     const label = await free.last().getAttribute('aria-label')
  415 |     expect(label).toBeTruthy()
  416 |     await free.last().click()
  417 |     await continuar(page)
  418 |     await confirmar(page).click()
  419 |     await expect(page.getByText(/supera tu cuota semanal|solapa/)).toBeVisible()
  420 |   })
  421 | 
  422 |   test('[RES-13] pasa la tolerancia antes de confirmar', async ({ page, demo }) => {
  423 |     await demo({ time: `${HOY}T06:00:00-05:00` })
  424 |     await abrirCancha(page)
  425 |     const label = await libres(page, 0).first().getAttribute('aria-label')
  426 |     await libres(page, 0).first().click()
  427 |     await continuar(page)
  428 |     const hour = 8 + (await page.evaluate((l) => ({ '8': 0, '9': 1, '10': 2, '11': 3, '12': 4, '1': 5, '2': 6, '3': 7, '4': 8, '5': 9, '6': 10, '7': 11 })[l.split(':')[0]], label))
  429 |     await page.clock.setFixedTime(new Date(`${HOY}T${String(hour).padStart(2, '0')}:11:00-05:00`))
  430 |     await confirmar(page).click()
  431 |     await expect(page.getByText('La franja ya no se puede reservar')).toBeVisible()
  432 |   })
  433 | 
  434 |   test('[RES-14][RES-15] sin borrador vuelve; volver no crea nada', async ({ page, demo }) => {
  435 |     await demo()
  436 |     await page.goto('/app/reservar')
  437 |     await expect(page).toHaveURL(/disponibilidad$/)
  438 |     await abrirCancha(page)
  439 |     await reservarPrimera(page)
  440 |     await page.getByRole('button', { name: 'Volver al calendario' }).click()
  441 |     await expect(page).toHaveURL(new RegExp(ID.multiple1))
  442 |     expect((await leerEstado(page)).reservations).toHaveLength(0)
  443 |   })
  444 | 
  445 |   test('[RES-16][RES-17] Atrás no duplica y recargar conserva el comprobante', async ({ page, demo }) => {
  446 |     await demo()
  447 |     await abrirCancha(page)
  448 |     await reservarPrimera(page)
  449 |     await confirmar(page).click()
  450 |     await expect(titulo(page, 'Reserva confirmada')).toBeVisible()
  451 |     await page.reload()
  452 |     await expect(titulo(page, 'Reserva confirmada')).toBeVisible()
  453 |     await page.goBack()
  454 |     await expect(confirmar(page)).toBeHidden()
  455 |     expect((await leerEstado(page)).reservations).toHaveLength(1)
  456 |   })
  457 | 
  458 |   test('[RES-30][RES-31][RES-33][RES-34] implementos', async ({ page, demo }) => {
  459 |     await demo()
  460 |     await abrirCancha(page)
  461 |     await reservarPrimera(page)
  462 |     await expect(page.getByText('Balón de baloncesto')).toBeVisible()
  463 |     await expect(page.getByText('Petos')).toBeVisible()
  464 |     await expect(page.getByText(/voleibol/i)).toHaveCount(0)
  465 |     const campo = page.getByLabel('Cantidad de Balón de baloncesto')
  466 |     for (const [v, ok] of [['99', '10'], ['-5', '0']]) {
  467 |       await campo.fill(v)
  468 |       await campo.blur()
  469 |       await expect(campo).toHaveValue(ok)
  470 |     }
  471 |     await campo.fill('2')
  472 |     await campo.blur()
  473 |     await confirmar(page).click()
  474 |     await expect(page.getByText('2 × Balón de baloncesto')).toBeVisible()
  475 |     await page.getByRole('button', { name: 'Ir a Mis reservas' }).click()
  476 |     await expect(page.getByText('2 × Balón de baloncesto')).toBeVisible()
  477 |   })
  478 | 
  479 |   test('[RES-32] voleibol no ofrece la malla inactiva', async ({ page, demo }) => {
  480 |     await demo()
  481 |     await abrirCancha(page)
  482 |     await page.getByRole('button', { name: 'Voleibol' }).click()
  483 |     await reservarPrimera(page)
  484 |     await expect(page.getByText('Balón de voleibol')).toBeVisible()
  485 |     await expect(page.getByText('Malla')).toHaveCount(0)
  486 |   })
  487 | })
  488 | 
  489 | test.describe('Mis reservas', () => {
  490 |   test('[MIS-01][MIS-02][MIS-03] orden, estados y botones @movil', async ({ page, demo }) => {
  491 |     await demo({
  492 |       state: estado({
  493 |         reservations: [
  494 |           reserva('b', { date: MANANA, hour: 9 }), reserva('a', { hour: 14 }),
  495 |           reserva('v', { date: '2026-11-16', hour: 9, status: 'NO_SHOW' }), reserva('c', { date: '2026-11-21', hour: 9, status: 'COMPLETED' }),
  496 |         ],
  497 |       }),
  498 |     })
  499 |     await page.goto('/app/mis-reservas')
  500 |     await expect(page.getByRole('tab', { name: 'Próximas (2)' })).toBeVisible()
  501 |     await expect(page.locator('main p.font-display + p').first()).toContainText('Hoy')
  502 |     await page.getByRole('tab', { name: 'Historial (2)' }).click()
  503 |     await expect(page.getByText('Completada')).toBeVisible()
  504 |     await expect(page.getByText('Inasistencia')).toBeVisible()
  505 |     await expect(page.getByRole('button', { name: 'Cancelar' })).toHaveCount(0)
  506 |   })
  507 | 
```