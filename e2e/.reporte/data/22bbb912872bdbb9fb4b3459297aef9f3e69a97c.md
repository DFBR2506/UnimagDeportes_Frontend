# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/estudiante.e2e.js >> Mis reservas >> [MIS-04] una terminada no ofrece Cancelar
- Location: e2e/demo/estudiante.e2e.js:508:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('button', { name: 'Cancelar' })
Expected: 0
Received: 1
Timeout:  2000ms

Call log:
  - Expect "toHaveCount" getByRole('button', { name: 'Cancelar' }) with timeout 2000ms
  - waiting for getByRole('button', { name: 'Cancelar' })
    19 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - banner [ref=e4]:
        - generic [ref=e5]:
          - button "UNIMAG DEPORTES" [ref=e6] [cursor=pointer]:
            - generic [ref=e8]:
              - generic [ref=e9]: UNIMAG
              - generic [ref=e10]: DEPORTES
          - navigation "Principal" [ref=e12]:
            - button "Inicio" [ref=e13] [cursor=pointer]
            - button "Disponibilidad" [ref=e17] [cursor=pointer]
            - button "Mis reservas" [ref=e20] [cursor=pointer]
          - button "MP María Pérez" [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: MP
            - generic [ref=e29]: María Pérez
      - main [ref=e32]:
        - generic [ref=e34]:
          - navigation "Primary" [ref=e35]:
            - list [ref=e36]:
              - listitem [ref=e37]:
                - button "Reservas" [ref=e38] [cursor=pointer]
              - listitem [ref=e42]:
                - button "Mi cuota" [ref=e43] [cursor=pointer]
              - listitem [ref=e46]:
                - button "Reglas de uso" [ref=e47] [cursor=pointer]
          - generic [ref=e51]:
            - generic [ref=e53]:
              - heading "Mis reservas" [level=1] [ref=e54]
              - paragraph [ref=e55]: Solo ves reservas creadas por ti.
            - generic [ref=e57]:
              - tablist [ref=e58]:
                - tab "Próximas (0)" [ref=e59] [cursor=pointer]
                - tab "Historial (1)" [active] [selected] [ref=e60] [cursor=pointer]
              - tabpanel "Historial (1)" [ref=e61]:
                - generic [ref=e64]:
                  - generic [ref=e65]:
                    - paragraph [ref=e66]: Cancha múltiple 1
                    - paragraph [ref=e67]: Hoy · 8:00 a. m.–9:00 a. m.
                  - generic [ref=e68]:
                    - generic [ref=e69]: Confirmada
                    - button "Cancelar" [ref=e70] [cursor=pointer]
    - button "Contactar al administrador" [ref=e72] [cursor=pointer]
  - generic:
    - region "Notifications"
```

# Test source

```ts
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
  508 |   test('[MIS-04] una terminada no ofrece Cancelar', async ({ page, demo }) => {
  509 |     test.fail(true, 'QA-06')
  510 |     await demo({ state: estado({ reservations: [reserva('a', { hour: 8 })] }) })
  511 |     await page.goto('/app/mis-reservas')
  512 |     await page.getByRole('tab', { name: 'Historial (1)' }).click()
  513 |     await expect(page.getByText('Confirmada')).toBeVisible()
> 514 |     await expect(page.getByRole('button', { name: 'Cancelar' })).toHaveCount(0, { timeout: 2000 })
      |                                                                  ^ Error: expect(locator).toHaveCount(expected) failed
  515 |   })
  516 | 
  517 |   test('[MIS-05][MIS-06] en uso sin Cancelar; acceso al check-in solo hoy', async ({ page, demo }) => {
  518 |     await demo({ state: estado({ reservations: [reserva('a', { hour: 10, status: 'IN_USE' })] }) })
  519 |     await page.goto('/app/mis-reservas')
  520 |     await expect(page.getByText('En uso')).toBeVisible()
  521 |     await expect(page.getByRole('button', { name: 'Cancelar' })).toHaveCount(0)
  522 |     await page.getByRole('button', { name: 'Ver check-in' }).click()
  523 |     await expect(page).toHaveURL(/checkin/)
  524 |   })
  525 | 
  526 |   for (const [id, hour, tipo, horas, estadoFinal] of [['MIS-20][MIS-21', 11.52, 'a tiempo', '0', 'Cancelada a tiempo'], ['MIS-22][MIS-23', 11.48, 'tardía', '1', 'Cancelada tardía'], ['MIS-24', 10.4, 'tardía', '1', 'Cancelada tardía']]) {
  527 |     test(`[${id}] inicio ${hour}: ${tipo} @movil`, async ({ page, demo }) => {
  528 |       await demo({ state: estado({ reservations: [reserva('a', { hour })] }) })
  529 |       await page.goto('/app/mis-reservas')
  530 |       await page.getByRole('button', { name: 'Cancelar' }).click()
  531 |       await expect(page.getByText(`Cancelación ${tipo}`, { exact: true })).toBeVisible()
  532 |       await page.getByRole('button', { name: 'Confirmar cancelación' }).click()
  533 |       await expect(page.getByRole('tab', { name: 'Historial (1)' })).toBeVisible()
  534 |       await page.getByRole('tab', { name: 'Historial (1)' }).click()
  535 |       await expect(page.getByText(estadoFinal)).toBeVisible()
  536 |       await page.goto('/app/inicio')
  537 |       await expect(page.getByText(`${4 - Number(horas)} h disponibles`)).toBeVisible()
  538 |     })
  539 |   }
  540 | 
  541 |   test('[MIS-25] decide el momento de confirmar', async ({ page, demo }) => {
  542 |     await demo({ state: estado({ reservations: [reserva('a', { hour: 11.52 })] }) })
  543 |     await page.goto('/app/mis-reservas/cancelar/a')
  544 |     await expect(page.getByText('Cancelación a tiempo')).toBeVisible()
  545 |     await page.clock.setFixedTime(new Date(`${HOY}T10:33:00-05:00`))
  546 |     await page.getByRole('button', { name: 'Confirmar cancelación' }).click()
  547 |     await expect(page.getByText('Reserva cancelada (tardía)')).toBeVisible()
  548 |   })
  549 | 
  550 |   test('[MIS-26][MIS-27][MIS-29] volver, en uso e inexistente', async ({ page, demo }) => {
  551 |     await demo({ state: estado({ reservations: [reserva('a', { hour: 14 }), reserva('u', { hour: 10, status: 'IN_USE' })] }) })
  552 |     for (const id of ['u', 'no-existe']) {
  553 |       await page.goto(`/app/mis-reservas/cancelar/${id}`)
  554 |       await expect(page.getByText('Esta reserva no se puede cancelar')).toBeVisible()
  555 |     }
  556 |     await page.goto('/reservations/a/cancel') // [MIS-30]
  557 |     await expect(page).toHaveURL(/mis-reservas\/cancelar\/a/)
  558 |     await page.getByRole('button', { name: 'Volver' }).click()
  559 |     await expect(page).toHaveURL(/mis-reservas$/)
  560 |     expect((await leerEstado(page)).reservations[0].status).toBe('CONFIRMED')
  561 |   })
  562 | 
  563 |   test('[MIS-41][MIS-42] movimientos y semana', async ({ page, demo }) => {
  564 |     await demo({ state: estado({ reservations: [reserva('a', { hour: 6, hours: 2, space: ID.tenis1, status: 'COMPLETED' }), reserva('b', { date: MANANA, hour: 9, status: 'CANCELLED_ON_TIME' }), reserva('c', { date: MANANA, hour: 12, status: 'CANCELLED_LATE' })] }) })
  565 |     await page.goto('/app/mis-reservas/cuota')
  566 |     await expect(page.getByText('23 de noviembre al 29 de noviembre', { exact: false })).toBeVisible()
  567 |     await expect(page.getByText('Lunes, 30 de noviembre')).toBeVisible()
  568 |     const horas = await page.locator('main li span.tabular-nums').allTextContents()
  569 |     expect(horas.map((h) => parseInt(h)).reduce((a, b) => a + b, 0)).toBe(3)
  570 |     await expect(page.getByText('3 h').or(page.locator('p', { hasText: /^3 h$/ })).first()).toBeVisible()
  571 |   })
  572 | 
  573 |   test('[MIS-43] cuota menor que lo usado', async ({ page, demo }) => {
  574 |     await demo({ state: estado({ params: { weeklyHours: 1, noShows: 3 }, reservations: [reserva('a', { hour: 6, hours: 2, space: ID.tenis1, status: 'COMPLETED' })] }) })
  575 |     await page.goto('/app/inicio')
  576 |     await expect(page.getByText('0 h disponibles')).toBeVisible()
  577 |   })
  578 | 
  579 |   test('[MIS-50][MIS-52][MIS-53] reglas, preguntas y rutas antiguas', async ({ page, demo }) => {
  580 |     await demo()
  581 |     await page.goto('/app/reglas')
  582 |     await expect(page).toHaveURL(/mis-reservas\/reglas/)
  583 |     await expect(page.getByText('4 horas', { exact: true })).toBeVisible()
  584 |     const q = page.getByRole('button', { name: '¿Qué pasa si no asisto?' })
  585 |     await q.focus()
  586 |     await page.keyboard.press('Enter')
  587 |     await expect(page.getByText(/Con 3 inasistencias/)).toBeVisible()
  588 |     await page.goto('/app/mi-cuota')
  589 |     await expect(page).toHaveURL(/mis-reservas\/cuota/)
  590 |   })
  591 | })
  592 | 
  593 | test.describe('Check-in', () => {
  594 |   const entrar = (page) => page.getByRole('button', { name: 'Confirmar asistencia' })
  595 |   const ir = (page, id = ID.multiple1) => page.goto(`/checkin/${id}`)
  596 | 
  597 |   for (const [id, hour, texto] of [['CHK-01', 10.7, 'Aún es temprano'], ['CHK-02', 10.65, 'Asistencia confirmada'], ['CHK-03', 10, 'Asistencia confirmada'], ['CHK-04', 9.48, 'No tienes una reserva activa aquí']]) {
  598 |     test(`[${id}] inicio ${hour}: ${texto} @movil`, async ({ page, demo }) => {
  599 |       await demo({ state: estado({ reservations: [reserva('a', { hour })] }) })
  600 |       await ir(page)
  601 |       await entrar(page).click()
  602 |       await expect(page.getByText(texto, { exact: true })).toBeVisible()
  603 |     })
  604 |   }
  605 | 
  606 |   test('[CHK-05][CHK-11] otra cancha e inexistente', async ({ page, demo }) => {
  607 |     await demo({ state: estado({ reservations: [reserva('a', { hour: 10.6 })] }) })
  608 |     for (const id of [ID.tenis1, 'no-existe']) {
  609 |       await ir(page, id)
  610 |       await entrar(page).click()
  611 |       await expect(page.getByText('No tienes una reserva activa aquí')).toBeVisible()
  612 |     }
  613 |   })
  614 | 
```