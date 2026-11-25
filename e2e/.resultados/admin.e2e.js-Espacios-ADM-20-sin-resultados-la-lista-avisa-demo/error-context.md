# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/admin.e2e.js >> Espacios >> [ADM-20] sin resultados, la lista avisa
- Location: e2e/demo/admin.e2e.js:83:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main')
Expected pattern: /sin resultados|no (hay|encontramos)/i
Received string:  "EspaciosImplementosGenerar QREspaciosAdministra espacios, horarios de operación, estados e imágenes.Crear espacioBuscar espacioNombreDisciplina(s)AforoHorarioEstadoAcciones"
Timeout: 2000ms

Call log:
  - Expect "toContainText" locator('main') with timeout 2000ms
  - waiting for locator('main')
    18 × locator resolved to <main>…</main>
       - unexpected value "EspaciosImplementosGenerar QREspaciosAdministra espacios, horarios de operación, estados e imágenes.Crear espacioBuscar espacioNombreDisciplina(s)AforoHorarioEstadoAcciones"

```

```yaml
- main:
  - navigation "Primary":
    - list:
      - listitem:
        - button "Espacios"
      - listitem:
        - button "Implementos"
      - listitem:
        - button "Generar QR"
  - heading "Espacios" [level=1]
  - paragraph: Administra espacios, horarios de operación, estados e imágenes.
  - button "Crear espacio"
  - text: Buscar espacio
  - textbox "Buscar espacio":
    - /placeholder: Cancha…
    - text: zzz
  - table:
    - rowgroup:
      - row "Nombre Disciplina(s) Aforo Horario Estado Acciones":
        - columnheader "Nombre"
        - columnheader "Disciplina(s)"
        - columnheader "Aforo"
        - columnheader "Horario"
        - columnheader "Estado"
        - columnheader "Acciones"
    - rowgroup
```

# Test source

```ts
  1   | import { HOY, ID, MANANA, abrirCancha, celda, columna, dialogo, elegir, entrarComo, estado, expect, leerEstado, libres, reserva, test, titulo } from '../support/demo.js'
  2   | import { png } from '../stack/png.mjs'
  3   | 
  4   | const admin = (extra) => ({ role: 'admin', ...extra })
  5   | const archivo = (buffer = png(200, 100), name = 'a.png', mimeType = 'image/png') => ({ name, mimeType, buffer })
  6   | const fila = (page, name) => page.getByRole('row', { name })
  7   | 
  8   | test.describe('Panel', () => {
  9   |   test('[ADM-01][ADM-02] indicadores por semana y mes @movil', async ({ page, demo }) => {
  10  |     await demo(admin())
  11  |     await page.goto('/admin')
  12  |     for (const t of ['Reservas', 'Cancelaciones tardías', 'Inasistencias', 'Usuarios suspendidos']) await expect(page.getByText(t, { exact: true })).toBeVisible()
  13  |     await expect(page.getByText('· 23 nov – 29 nov', { exact: true })).toBeVisible()
  14  |     await page.getByRole('button', { name: 'Mes' }).click()
  15  |     await expect(page.getByText('· 1 nov – 30 nov', { exact: true })).toBeVisible()
  16  |   })
  17  | 
  18  |   test('[ADM-03][ADM-04] cambia de cancha y avisa mantenimiento', async ({ page, demo }) => {
  19  |     await demo(admin())
  20  |     await page.goto('/admin')
  21  |     await elegir(page, 'Cancha', 'Cancha fútbol 5 (mantenimiento)')
  22  |     await expect(page.getByRole('heading', { name: 'Cancha fútbol 5' })).toBeVisible()
  23  |     await expect(page.getByText('Esta cancha está en mantenimiento')).toBeVisible()
  24  |     await expect(page.getByText('7:00 a. m. – 9:00 p. m.')).toBeVisible()
  25  |   })
  26  | 
  27  |   test('[ADM-05] horas reservadas + bloqueadas + libres = total', async ({ page, demo }) => {
  28  |     await demo(admin())
  29  |     await page.goto('/admin')
  30  |     await expect(page.locator('[aria-busy="false"] [title]').first()).toBeVisible()
  31  |     await page.waitForTimeout(2500) // contadores animados
  32  |     const n = async (t) => parseInt(await page.getByText(t, { exact: true }).locator('xpath=following-sibling::p').innerText())
  33  |     const [r, b, l, o] = [await n('Horas reservadas'), await n('Horas bloqueadas'), await n('Horas libres'), await n('Ocupación')]
  34  |     expect(r + b + l).toBe(12 * 7) // la primera cancha, de 6 a 18
  35  |     expect(o).toBe(Math.round(((r + b) / (r + b + l)) * 100))
  36  |   })
  37  | 
  38  |   test('[ADM-06][ADM-07] solo lectura y límites de semanas', async ({ page, demo }) => {
  39  |     await demo(admin())
  40  |     await page.goto('/admin')
  41  |     await expect(page.locator('[aria-busy="false"]').first()).toBeAttached()
  42  |     expect(await page.locator('[aria-busy] button:not([disabled])').count()).toBe(0)
  43  |     const prev = page.getByRole('button', { name: 'Semana anterior' }), next = page.getByRole('button', { name: 'Semana siguiente' })
  44  |     for (let i = 0; i < 8; i++) await prev.click()
  45  |     await expect(prev).toBeDisabled()
  46  |     await page.getByRole('button', { name: 'Ir a la semana actual' }).click()
  47  |     for (let i = 0; i < 4; i++) await next.click()
  48  |     await expect(next).toBeDisabled()
  49  |   })
  50  | 
  51  |   test('[ADM-08] cambiar rápido no mezcla datos', async ({ page, demo }) => {
  52  |     await demo(admin({ state: estado({ blocks: [{ id: 'b', spaceId: ID.tenis1, date: MANANA, startHour: 6, endHour: 18, reason: 'x', type: 'EVENT' }] }) }))
  53  |     await page.goto('/admin')
  54  |     for (const c of ['Cancha de tenis 1', 'Cancha fútbol 11', 'Cancha de tenis 1']) await elegir(page, 'Cancha', c)
  55  |     await expect(page.locator('[aria-busy="false"]').first()).toBeAttached()
  56  |     await expect(columna(page, 2).locator('[title^="Bloqueo institucional · 6:00 a. m.–6:00 p. m."]')).toBeVisible()
  57  |   })
  58  | 
  59  |   test('[ADM-09] la reserva del estudiante aparece', async ({ page, demo }) => {
  60  |     await demo(admin({ state: estado({ reservations: [reserva('res-nueva', { space: ID.multiple1, date: MANANA, hour: 8, hours: 2 })] }) }))
  61  |     await page.goto('/admin')
  62  |     await elegir(page, 'Cancha', 'Cancha múltiple 1')
  63  |     await expect(columna(page, 2).locator('[title="Reserva · 2 h · 8:00 a. m.–10:00 a. m."]')).toBeVisible()
  64  |   })
  65  | })
  66  | 
  67  | test.describe('Espacios', () => {
  68  |   const abrir = async (page, demo, extra) => {
  69  |     await demo(admin(extra))
  70  |     await page.goto('/admin/espacios')
  71  |     await expect(fila(page, /múltiple 1/)).toBeVisible()
  72  |   }
  73  | 
  74  |   test('[ADM-20] buscar', async ({ page, demo }) => {
  75  |     await abrir(page, demo)
  76  |     const q = page.getByPlaceholder('Cancha…')
  77  |     await q.fill('TENIS')
  78  |     await expect(page.locator('tbody tr')).toHaveCount(1)
  79  |     await q.fill('zzz')
  80  |     await expect(page.locator('tbody tr')).toHaveCount(0)
  81  |   })
  82  | 
  83  |   test('[ADM-20] sin resultados, la lista avisa', async ({ page, demo }) => {
  84  |     test.fail(true, 'QA-32: la tabla queda vacía sin mensaje')
  85  |     await abrir(page, demo)
  86  |     await page.getByPlaceholder('Cancha…').fill('zzz')
  87  |     await expect(page.locator('tbody tr')).toHaveCount(0)
> 88  |     await expect(page.locator('main')).toContainText(/sin resultados|no (hay|encontramos)/i, { timeout: 2000 })
      |                                        ^ Error: expect(locator).toContainText(expected) failed
  89  |   })
  90  | 
  91  |   test('[ADM-21][ADM-22][ADM-23] crear', async ({ page, demo }) => {
  92  |     await abrir(page, demo)
  93  |     await page.getByRole('button', { name: 'Crear espacio' }).click()
  94  |     const d = dialogo(page), ok = d.getByRole('button', { name: 'Crear espacio' })
  95  |     await expect(ok).toBeDisabled()
  96  |     await d.getByPlaceholder('Cancha…').fill('Cancha QA')
  97  |     await d.getByText('Voleibol').click()
  98  |     await d.locator('input[type=file]').nth(0).setInputFiles(archivo())
  99  |     await expect(ok).toBeDisabled()
  100 |     await d.locator('input[type=file]').nth(1).setInputFiles(archivo())
  101 |     await expect(ok).toBeEnabled()
  102 |     await elegir(page, 'Hora de cierre', '6:00 a. m.')
  103 |     await expect(d.getByText('Debe ser posterior a la apertura.')).toBeVisible()
  104 |     await expect(ok).toBeDisabled()
  105 |     await elegir(page, 'Hora de cierre', '8:00 p. m.')
  106 |     await ok.click()
  107 |     await expect(page.getByText('Espacio creado')).toBeVisible()
  108 |     await expect(fila(page, /Cancha QA/)).toBeVisible()
  109 |     await entrarComo(page, 'student', '/app/disponibilidad')
  110 |     await expect(page.getByRole('button', { name: /Cancha QA/ })).toBeVisible()
  111 |   })
  112 | 
  113 |   test('[ADM-24][ADM-25] mantenimiento y vuelta', async ({ page, demo }) => {
  114 |     await abrir(page, demo)
  115 |     for (const [estadoNuevo, n] of [['Mantenimiento', 0], ['Activo', 1]]) {
  116 |       await entrarComo(page, 'admin', '/admin/espacios')
  117 |       await fila(page, /tenis 1/).getByRole('button', { name: 'Editar' }).click()
  118 |       await elegir(page, 'Estado', estadoNuevo)
  119 |       await dialogo(page).getByRole('button', { name: 'Guardar cambios' }).click()
  120 |       await expect(page.getByText('Espacio actualizado').first()).toBeVisible()
  121 |       await entrarComo(page, 'student', '/app/disponibilidad')
  122 |       await expect(page.getByText('múltiple 1').first()).toBeVisible()
  123 |       await expect(page.getByRole('button', { name: /tenis 1.*Ver horario/ })).toHaveCount(n)
  124 |     }
  125 |   })
  126 | 
  127 |   test('[ADM-26] el horario cambia el calendario', async ({ page, demo }) => {
  128 |     await abrir(page, demo)
  129 |     await fila(page, /múltiple 1/).getByRole('button', { name: 'Editar' }).click()
  130 |     await elegir(page, 'Hora de cierre', '10:00 a. m.')
  131 |     await dialogo(page).getByRole('button', { name: 'Guardar cambios' }).click()
  132 |     await expect(page.getByText('Espacio actualizado')).toBeVisible()
  133 |     await entrarComo(page, 'student', '/app/inicio')
  134 |     await abrirCancha(page)
  135 |     await expect(columna(page, 1).locator('button')).toHaveCount(2)
  136 |   })
  137 | 
  138 |   test('[ADM-28][ADM-29][ADM-30][ADM-31] aforo, nombres y cancelar', async ({ page, demo }) => {
  139 |     await abrir(page, demo)
  140 |     await fila(page, /tenis 1/).getByRole('button', { name: 'Editar' }).click()
  141 |     const d = dialogo(page), ok = d.getByRole('button', { name: 'Guardar cambios' })
  142 |     const aforo = d.getByLabel(/Aforo/)
  143 |     for (const [v, e] of [['0', '1'], ['999', '500'], ['-3', '1']]) {
  144 |       await aforo.fill(v)
  145 |       await aforo.blur()
  146 |       await expect(aforo).toHaveValue(e)
  147 |     }
  148 |     const nombre = d.getByPlaceholder('Cancha…')
  149 |     await nombre.fill('   ')
  150 |     await expect(ok).toBeDisabled()
  151 |     await nombre.fill('<b>x</b>')
  152 |     await d.getByText('Tenis de campo').click()
  153 |     await expect(ok).toBeDisabled()
  154 |     await page.keyboard.press('Escape')
  155 |     await expect(d).toBeHidden()
  156 |     expect((await leerEstado(page)).spaces.find((s) => s.id === ID.tenis1).name).toBe('Cancha de tenis 1')
  157 |   })
  158 | 
  159 |   test('[ADM-29][TRX-40] HTML y nombres largos no rompen la página', async ({ page, demo }) => {
  160 |     const state = estado()
  161 |     state.spaces[0].name = '<img src=x onerror=alert(1)>'
  162 |     state.spaces[1].name = 'Cancha '.repeat(40)
  163 |     page.on('dialog', () => { throw new Error('se ejecutó HTML') })
  164 |     await demo(admin({ state }))
  165 |     await page.goto('/admin/espacios')
  166 |     await expect(page.getByText('<img src=x').locator('visible=true')).toBeVisible()
  167 |     expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  168 |   })
  169 | 
  170 |   test('[PAN-22][PAN-23][PAN-24] panoramas inválidos', async ({ page, demo }) => {
  171 |     await abrir(page, demo)
  172 |     await fila(page, /tenis 1/).getByRole('button', { name: 'Editar' }).click()
  173 |     const input = dialogo(page).locator('input[type=file]').nth(1)
  174 |     for (const f of [archivo(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'a.svg', 'image/svg+xml'), archivo(Buffer.from('hola'), 'a.jpg', 'image/jpeg'), archivo(png(200, 100).subarray(0, 60))]) {
  175 |       await input.setInputFiles(f)
  176 |       await expect(page.getByText('Panorama no válido').last()).toBeVisible()
  177 |     }
  178 |     await input.setInputFiles(archivo(Buffer.alloc(31 * 1024 * 1024)))
  179 |     await expect(page.getByText('Imagen demasiado grande')).toBeVisible()
  180 |   })
  181 | 
  182 |   test('[PAN-21][PAN-26] acepta otra proporción; al recargar vuelve la de demo', async ({ page, demo }) => {
  183 |     await abrir(page, demo)
  184 |     await fila(page, /tenis 1/).getByRole('button', { name: 'Editar' }).click()
  185 |     await dialogo(page).locator('input[type=file]').nth(1).setInputFiles(archivo(png(90, 160)))
  186 |     await dialogo(page).getByRole('button', { name: 'Guardar cambios' }).click()
  187 |     await expect(page.getByText('Espacio actualizado')).toBeVisible()
  188 |     await page.reload()
```