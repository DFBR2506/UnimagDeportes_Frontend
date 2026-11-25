# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/admin.e2e.js >> Espacios >> [PAN-22][PAN-23][PAN-24] panoramas inválidos
- Location: e2e/demo/admin.e2e.js:170:3

# Error details

```
TimeoutError: locator.setInputFiles: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-slot="dialog-content"]').locator('input[type=file]').nth(1)
    - locator resolved to <input type="file" class="sr-only" accept="image/jpeg,image/png,image/webp"/>

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - button [ref=e6] [cursor=pointer]:
          - generic [ref=e8]:
            - generic [ref=e9]: UNIMAG
            - generic [ref=e10]: DEPORTES
        - generic [ref=e11]: Admin
        - navigation [ref=e13]:
          - button [ref=e14] [cursor=pointer]: Panel de ocupación
          - button [ref=e18] [cursor=pointer]: Espacios
          - button [ref=e24] [cursor=pointer]: Bloquear franjas
          - button [ref=e29] [cursor=pointer]: Reglas de uso
        - button [ref=e34] [cursor=pointer]:
          - generic [ref=e35]: ED
          - generic [ref=e37]: Equipo de Deportes
    - main [ref=e40]:
      - generic [ref=e42]:
        - navigation [ref=e43]:
          - list [ref=e44]:
            - listitem [ref=e45]:
              - button [ref=e46] [cursor=pointer]:
                - generic [ref=e47]: Espacios
            - listitem [ref=e50]:
              - button [ref=e51] [cursor=pointer]:
                - generic [ref=e52]: Implementos
            - listitem [ref=e54]:
              - button [ref=e55] [cursor=pointer]:
                - generic [ref=e56]: Generar QR
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]:
              - heading [level=1] [ref=e62]: Espacios
              - paragraph [ref=e63]: Administra espacios, horarios de operación, estados e imágenes.
            - button [ref=e65] [cursor=pointer]:
              - generic [ref=e66]: Crear espacio
          - generic [ref=e68]:
            - generic [ref=e69]: Buscar espacio
            - textbox [ref=e71]:
              - /placeholder: Cancha…
          - table [ref=e74]:
            - rowgroup [ref=e75]:
              - row [ref=e76]:
                - columnheader [ref=e77]: Nombre
                - columnheader [ref=e78]: Disciplina(s)
                - columnheader [ref=e79]: Aforo
                - columnheader [ref=e80]: Horario
                - columnheader [ref=e81]: Estado
                - columnheader [ref=e82]: Acciones
            - rowgroup [ref=e83]:
              - row [ref=e84]:
                - cell [ref=e85]:
                  - generic [ref=e86]: Cancha de tenis 1
                - cell [ref=e102]: Tenis de campo
                - cell [ref=e103]: "4"
                - cell [ref=e104]: 6:00 a. m.–6:00 p. m.
                - cell [ref=e105]:
                  - generic [ref=e106]: Activo
                - cell [ref=e107]:
                  - generic [ref=e108]:
                    - button [ref=e109] [cursor=pointer]:
                      - generic [ref=e110]: Ver 360°
                    - button [ref=e111] [cursor=pointer]:
                      - generic [ref=e112]: Editar
              - row [ref=e113]:
                - cell [ref=e114]:
                  - generic [ref=e115]: Cancha fútbol 11
                - cell [ref=e144]: Fútbol 11
                - cell [ref=e145]: "22"
                - cell [ref=e146]: 7:00 a. m.–9:00 p. m.
                - cell [ref=e147]:
                  - generic [ref=e148]: Activo
                - cell [ref=e149]:
                  - generic [ref=e150]:
                    - button [ref=e151] [cursor=pointer]:
                      - generic [ref=e152]: Ver 360°
                    - button [ref=e153] [cursor=pointer]:
                      - generic [ref=e154]: Editar
              - row [ref=e155]:
                - cell [ref=e156]:
                  - generic [ref=e157]: Cancha fútbol 5
                - cell [ref=e182]: Fútbol 5
                - cell [ref=e183]: "10"
                - cell [ref=e184]: 7:00 a. m.–9:00 p. m.
                - cell [ref=e185]:
                  - generic [ref=e186]: Mantenimiento
                - cell [ref=e187]:
                  - generic [ref=e188]:
                    - button [ref=e189] [cursor=pointer]:
                      - generic [ref=e190]: Ver 360°
                    - button [ref=e191] [cursor=pointer]:
                      - generic [ref=e192]: Editar
              - row [ref=e193]:
                - cell [ref=e194]:
                  - generic [ref=e195]: Cancha múltiple 1
                - cell [ref=e221]: Baloncesto, Voleibol
                - cell [ref=e222]: "20"
                - cell [ref=e223]: 8:00 a. m.–8:00 p. m.
                - cell [ref=e224]:
                  - generic [ref=e225]: Activo
                - cell [ref=e226]:
                  - generic [ref=e227]:
                    - button [ref=e228] [cursor=pointer]:
                      - generic [ref=e229]: Ver 360°
                    - button [ref=e230] [cursor=pointer]:
                      - generic [ref=e231]: Editar
              - row [ref=e232]:
                - cell [ref=e233]:
                  - generic [ref=e234]: Cancha múltiple 2
                - cell [ref=e260]: Baloncesto, Fútbol 5
                - cell [ref=e261]: "20"
                - cell [ref=e262]: 6:00 a. m.–6:00 p. m.
                - cell [ref=e263]:
                  - generic [ref=e264]: Activo
                - cell [ref=e265]:
                  - generic [ref=e266]:
                    - button [ref=e267] [cursor=pointer]:
                      - generic [ref=e268]: Ver 360°
                    - button [ref=e269] [cursor=pointer]:
                      - generic [ref=e270]: Editar
  - generic:
    - region "Notifications":
      - dialog "Imagen demasiado grande" [ref=e271]:
        - generic [ref=e272]:
          - generic [ref=e273]:
            - heading "Imagen demasiado grande" [level=2] [ref=e274]
            - paragraph [ref=e275]: El máximo es 30 MB por archivo.
          - button "Close notification" [ref=e276]
      - dialog "Panorama no válido" [ref=e279]:
        - generic [ref=e280]:
          - generic [ref=e281]:
            - heading "Panorama no válido" [level=2] [ref=e282]
            - paragraph [ref=e283]: Usa un panorama PNG, JPG/JPEG o WebP. No se admiten SVG ni documentos HTML.
          - button "Close notification" [ref=e284]
      - dialog "Panorama no válido" [ref=e287]:
        - generic [ref=e288]:
          - generic [ref=e289]:
            - heading "Panorama no válido" [level=2] [ref=e290]
            - paragraph [ref=e291]: Usa un panorama PNG, JPG/JPEG o WebP. No se admiten SVG ni documentos HTML.
          - button "Close notification" [ref=e292]
  - dialog "Editar espacio" [ref=e298]:
    - generic [ref=e300]:
      - heading "Editar espacio" [level=2] [ref=e301]
      - paragraph [ref=e302]: "RN-09: un espacio en mantenimiento no aparece como reservable. Los cambios rigen para reservas nuevas."
    - generic [ref=e304]:
      - generic [ref=e305]:
        - generic [ref=e306]: Nombre
        - textbox "Nombre" [active] [ref=e307]:
          - /placeholder: Cancha…
          - text: Cancha de tenis 1
      - generic [ref=e308]:
        - paragraph [ref=e309]: Disciplinas
        - generic [ref=e310]:
          - generic [ref=e311]:
            - checkbox "Baloncesto" [ref=e312] [cursor=pointer]
            - checkbox [aria-hidden] [ref=e313]
            - text: Baloncesto
          - generic [ref=e314]:
            - checkbox "Voleibol" [ref=e315] [cursor=pointer]
            - checkbox [aria-hidden] [ref=e316]
            - text: Voleibol
          - generic [ref=e317]:
            - checkbox "Fútbol 5" [ref=e318] [cursor=pointer]
            - checkbox [aria-hidden] [ref=e319]
            - text: Fútbol 5
          - generic [ref=e320]:
            - checkbox "Fútbol 11" [ref=e321] [cursor=pointer]
            - checkbox [aria-hidden] [ref=e322]
            - text: Fútbol 11
          - generic [ref=e323]:
            - checkbox "Tenis de campo" [checked] [ref=e324] [cursor=pointer]
            - checkbox [checked] [aria-hidden] [ref=e328]
            - text: Tenis de campo
      - generic [ref=e329]:
        - generic [ref=e330]:
          - generic [ref=e331]: Aforo máximo
          - group [ref=e333]:
            - button "Decrement" [ref=e334]
            - textbox "Aforo máximo" [ref=e336]: "4"
            - button "Increment" [ref=e337]
          - spinbutton [aria-hidden] [ref=e340]: "4"
        - generic [ref=e341]:
          - generic [ref=e342]: Estado
          - combobox "Estado" [ref=e344] [cursor=pointer]:
            - generic [ref=e345]: Activo
      - generic [ref=e349]:
        - generic [ref=e350]:
          - generic [ref=e351]: Abre
          - combobox "Hora de apertura" [ref=e353] [cursor=pointer]:
            - generic [ref=e354]: 6:00 a. m.
        - generic [ref=e358]:
          - generic [ref=e359]: Cierra
          - combobox "Hora de cierre" [ref=e361] [cursor=pointer]:
            - generic [ref=e362]: 6:00 p. m.
      - generic [ref=e366]:
        - generic [ref=e367]: Requisitos de uso (opcional)
        - textbox "Requisitos de uso (opcional)" [ref=e368]:
          - /placeholder: Calzado deportivo
          - text: Calzado deportivo
      - generic [ref=e369]:
        - generic [ref=e370]:
          - generic [ref=e371]: Vista previa
          - generic [ref=e372] [cursor=pointer]:
            - generic [ref=e373]: Foto de la cancha
            - button "Foto de la cancha" [ref=e378]
        - generic [ref=e380]:
          - generic [ref=e381]: Panorámica 360°
          - generic [ref=e382] [cursor=pointer]:
            - generic [ref=e383]: Cambiar imagen
            - button "Cambiar imagen" [ref=e384]
      - paragraph [ref=e385]: Máximo 30 MB por imagen. El servidor valida el formato por su contenido.
      - paragraph [ref=e386]: "Se admiten panoramas PNG, JPG/JPEG o WebP de cualquier proporción. El visor los estira o comprime a 2:1, sin recortar, hasta un máximo de 4096 × 2048 px. El archivo original no se modifica; las proporciones muy distintas pueden deformarse. En el Recorrido MVP, las imágenes subidas son temporales: al recargar vuelven los panoramas de public/panoramas/."
    - generic [ref=e389]:
      - button "Cancelar" [ref=e390] [cursor=pointer]
      - button "Guardar cambios" [ref=e392] [cursor=pointer]
    - button "Close dialog" [ref=e394] [cursor=pointer]:
      - generic [ref=e395]: Close
```

# Test source

```ts
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
  88  |     await expect(page.locator('main')).toContainText(/sin resultados|no (hay|encontramos)/i, { timeout: 2000 })
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
> 178 |     await input.setInputFiles(archivo(Buffer.alloc(31 * 1024 * 1024)))
      |     ^ TimeoutError: locator.setInputFiles: Timeout 10000ms exceeded.
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
  189 |     await fila(page, /tenis 1/).getByRole('button', { name: 'Ver 360°' }).click()
  190 |     await expect(page.getByText('Panorama no disponible')).toBeVisible()
  191 |   })
  192 | 
  193 |   test('[ADM-33][PAN-07] ver 360° sin archivo explica cuál falta', async ({ page, demo }) => {
  194 |     await abrir(page, demo)
  195 |     await fila(page, /fútbol 5/).filter({ hasText: 'Mantenimiento' }).getByRole('button', { name: 'Ver 360°' }).click()
  196 |     await expect(page.getByText('futbol-5.png')).toBeVisible()
  197 |   })
  198 | })
  199 | 
  200 | test.describe('Implementos', () => {
  201 |   const abrir = async (page, demo, extra) => {
  202 |     await demo(admin(extra))
  203 |     await page.goto('/admin/espacios/implementos')
  204 |     await expect(fila(page, /Petos/)).toBeVisible()
  205 |   }
  206 | 
  207 |   test('[ADM-40][ADM-41][ADM-45] crear, duplicado y vacío', async ({ page, demo }) => {
  208 |     await abrir(page, demo)
  209 |     for (const [nombre, texto] of [['Conos', 'Implemento creado'], ['PETOS', 'Ya existe otro implemento']]) {
  210 |       await page.getByRole('button', { name: 'Agregar implemento' }).click()
  211 |       await expect(dialogo(page).getByRole('button', { name: 'Agregar' })).toBeDisabled()
  212 |       await dialogo(page).getByPlaceholder('Balón de voleibol').fill(nombre)
  213 |       await dialogo(page).getByRole('button', { name: 'Agregar' }).click()
  214 |       await expect(page.getByText(texto)).toBeVisible()
  215 |       if (await dialogo(page).isVisible()) await page.keyboard.press('Escape')
  216 |       await expect(dialogo(page)).toBeHidden()
  217 |     }
  218 |   })
  219 | 
  220 |   test('[ADM-42][ADM-44] inactivo no se ofrece', async ({ page, demo }) => {
  221 |     await abrir(page, demo)
  222 |     await fila(page, /Petos/).getByRole('button', { name: 'Editar' }).click()
  223 |     await elegir(page, 'Estado', 'Inactivo')
  224 |     await dialogo(page).getByRole('button', { name: 'Guardar cambios' }).click()
  225 |     await expect(fila(page, /Petos/)).toContainText('Inactivo')
  226 |     await entrarComo(page, 'student', '/app/inicio')
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
```