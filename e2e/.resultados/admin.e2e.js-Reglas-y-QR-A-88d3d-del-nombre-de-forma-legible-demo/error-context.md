# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/admin.e2e.js >> Reglas y QR >> [ADM-82] el archivo conserva las tildes del nombre de forma legible
- Location: e2e/demo/admin.e2e.js:382:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('a[download]')
Expected pattern: /m[uú]ltiple/
Received string:  "qr-cancha-m-ltiple-2.svg"
Timeout: 2000ms

Call log:
  - Expect "toHaveAttribute" locator('a[download]') with timeout 2000ms
  - waiting for locator('a[download]')
    20 × locator resolved to <a data-variant="ghost" download="qr-cancha-m-ltiple-2.svg" href="blob:http://localhost:5190/bdc96e40-9515-4f57-95c9-05c032aa0d0a" class="relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium outline-none ring-offset-background transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-solid focus-visible:outline-offset-2 active:scale-[0.97] disabled:po…>Descargar SVG</a>
       - unexpected value "qr-cancha-m-ltiple-2.svg"

```

```yaml
- link "Descargar SVG":
  - /url: blob:http://localhost:5190/bdc96e40-9515-4f57-95c9-05c032aa0d0a
```

# Test source

```ts
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
  327 |     await expect(page.getByText('Bloqueo confirmado')).toHaveCount(0, { timeout: 500 })
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
> 387 |     await expect(page.locator('a[download]')).toHaveAttribute('download', /m[uú]ltiple/, { timeout: 2000 })
      |                                               ^ Error: expect(locator).toHaveAttribute(expected) failed
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