# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: demo/admin.e2e.js >> Espacios >> [ADM-24][ADM-25] mantenimiento y vuelta
- Location: e2e/demo/admin.e2e.js:113:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('option')
Expected: 0
Received: 2
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" getByRole('option') with timeout 10000ms
  - waiting for getByRole('option')
    23 × locator resolved to 2 elements
       - unexpected value "2"

```

# Page snapshot

```yaml
- generic [ref=f3e1]:
  - generic [ref=f3e3]:
    - banner [ref=f3e4]:
      - generic [ref=f3e5]:
        - button [ref=f3e6] [cursor=pointer]:
          - generic [ref=f3e8]:
            - generic [ref=f3e9]: UNIMAG
            - generic [ref=f3e10]: DEPORTES
        - generic [ref=f3e11]: Admin
        - navigation [ref=f3e13]:
          - button [ref=f3e14] [cursor=pointer]: Panel de ocupación
          - button [ref=f3e18] [cursor=pointer]: Espacios
          - button [ref=f3e24] [cursor=pointer]: Bloquear franjas
          - button [ref=f3e29] [cursor=pointer]: Reglas de uso
        - button [ref=f3e34] [cursor=pointer]:
          - generic [ref=f3e35]: ED
          - generic [ref=f3e37]: Equipo de Deportes
    - main [ref=f3e40]:
      - generic [ref=f3e42]:
        - navigation [ref=f3e43]:
          - list [ref=f3e44]:
            - listitem [ref=f3e45]:
              - button [ref=f3e46] [cursor=pointer]:
                - generic [ref=f3e47]: Espacios
            - listitem [ref=f3e50]:
              - button [ref=f3e51] [cursor=pointer]:
                - generic [ref=f3e52]: Implementos
            - listitem [ref=f3e54]:
              - button [ref=f3e55] [cursor=pointer]:
                - generic [ref=f3e56]: Generar QR
        - generic [ref=f3e59]:
          - generic [ref=f3e60]:
            - generic [ref=f3e61]:
              - heading [level=1] [ref=f3e62]: Espacios
              - paragraph [ref=f3e63]: Administra espacios, horarios de operación, estados e imágenes.
            - button [ref=f3e65] [cursor=pointer]:
              - generic [ref=f3e66]: Crear espacio
          - generic [ref=f3e68]:
            - generic [ref=f3e69]: Buscar espacio
            - textbox [ref=f3e71]:
              - /placeholder: Cancha…
          - table [ref=f3e74]:
            - rowgroup [ref=f3e75]:
              - row [ref=f3e76]:
                - columnheader [ref=f3e77]: Nombre
                - columnheader [ref=f3e78]: Disciplina(s)
                - columnheader [ref=f3e79]: Aforo
                - columnheader [ref=f3e80]: Horario
                - columnheader [ref=f3e81]: Estado
                - columnheader [ref=f3e82]: Acciones
            - rowgroup [ref=f3e83]:
              - row [ref=f3e84]:
                - cell [ref=f3e85]:
                  - generic [ref=f3e86]: Cancha de tenis 1
                - cell [ref=f3e102]: Tenis de campo
                - cell [ref=f3e103]: "4"
                - cell [ref=f3e104]: 6:00 a. m.–6:00 p. m.
                - cell [ref=f3e105]:
                  - generic [ref=f3e106]: Mantenimiento
                - cell [ref=f3e107]:
                  - generic [ref=f3e108]:
                    - button [ref=f3e109] [cursor=pointer]:
                      - generic [ref=f3e110]: Ver 360°
                    - button [ref=f3e111] [cursor=pointer]:
                      - generic [ref=f3e112]: Editar
              - row [ref=f3e113]:
                - cell [ref=f3e114]:
                  - generic [ref=f3e115]: Cancha fútbol 11
                - cell [ref=f3e144]: Fútbol 11
                - cell [ref=f3e145]: "22"
                - cell [ref=f3e146]: 7:00 a. m.–9:00 p. m.
                - cell [ref=f3e147]:
                  - generic [ref=f3e148]: Activo
                - cell [ref=f3e149]:
                  - generic [ref=f3e150]:
                    - button [ref=f3e151] [cursor=pointer]:
                      - generic [ref=f3e152]: Ver 360°
                    - button [ref=f3e153] [cursor=pointer]:
                      - generic [ref=f3e154]: Editar
              - row [ref=f3e155]:
                - cell [ref=f3e156]:
                  - generic [ref=f3e157]: Cancha fútbol 5
                - cell [ref=f3e182]: Fútbol 5
                - cell [ref=f3e183]: "10"
                - cell [ref=f3e184]: 7:00 a. m.–9:00 p. m.
                - cell [ref=f3e185]:
                  - generic [ref=f3e186]: Mantenimiento
                - cell [ref=f3e187]:
                  - generic [ref=f3e188]:
                    - button [ref=f3e189] [cursor=pointer]:
                      - generic [ref=f3e190]: Ver 360°
                    - button [ref=f3e191] [cursor=pointer]:
                      - generic [ref=f3e192]: Editar
              - row [ref=f3e193]:
                - cell [ref=f3e194]:
                  - generic [ref=f3e195]: Cancha múltiple 1
                - cell [ref=f3e221]: Baloncesto, Voleibol
                - cell [ref=f3e222]: "20"
                - cell [ref=f3e223]: 8:00 a. m.–8:00 p. m.
                - cell [ref=f3e224]:
                  - generic [ref=f3e225]: Activo
                - cell [ref=f3e226]:
                  - generic [ref=f3e227]:
                    - button [ref=f3e228] [cursor=pointer]:
                      - generic [ref=f3e229]: Ver 360°
                    - button [ref=f3e230] [cursor=pointer]:
                      - generic [ref=f3e231]: Editar
              - row [ref=f3e232]:
                - cell [ref=f3e233]:
                  - generic [ref=f3e234]: Cancha múltiple 2
                - cell [ref=f3e260]: Baloncesto, Fútbol 5
                - cell [ref=f3e261]: "20"
                - cell [ref=f3e262]: 6:00 a. m.–6:00 p. m.
                - cell [ref=f3e263]:
                  - generic [ref=f3e264]: Activo
                - cell [ref=f3e265]:
                  - generic [ref=f3e266]:
                    - button [ref=f3e267] [cursor=pointer]:
                      - generic [ref=f3e268]: Ver 360°
                    - button [ref=f3e269] [cursor=pointer]:
                      - generic [ref=f3e270]: Editar
  - generic:
    - region "Notifications"
  - dialog "Editar espacio" [ref=f3e274]:
    - generic [ref=f3e276]:
      - heading "Editar espacio" [level=2] [ref=f3e277]
      - paragraph [ref=f3e278]: "RN-09: un espacio en mantenimiento no aparece como reservable. Los cambios rigen para reservas nuevas."
    - generic [ref=f3e280]:
      - generic [ref=f3e281]:
        - generic [ref=f3e282]: Nombre
        - textbox "Nombre" [ref=f3e283]:
          - /placeholder: Cancha…
          - text: Cancha de tenis 1
      - generic [ref=f3e284]:
        - paragraph [ref=f3e285]: Disciplinas
        - generic [ref=f3e286]:
          - generic [ref=f3e287]:
            - checkbox "Baloncesto" [ref=f3e288] [cursor=pointer]
            - checkbox [aria-hidden] [ref=f3e289]
            - text: Baloncesto
          - generic [ref=f3e290]:
            - checkbox "Voleibol" [ref=f3e291] [cursor=pointer]
            - checkbox [aria-hidden] [ref=f3e292]
            - text: Voleibol
          - generic [ref=f3e293]:
            - checkbox "Fútbol 5" [ref=f3e294] [cursor=pointer]
            - checkbox [aria-hidden] [ref=f3e295]
            - text: Fútbol 5
          - generic [ref=f3e296]:
            - checkbox "Fútbol 11" [ref=f3e297] [cursor=pointer]
            - checkbox [aria-hidden] [ref=f3e298]
            - text: Fútbol 11
          - generic [ref=f3e299]:
            - checkbox "Tenis de campo" [checked] [ref=f3e300] [cursor=pointer]
            - checkbox [checked] [aria-hidden] [ref=f3e304]
            - text: Tenis de campo
      - generic [ref=f3e305]:
        - generic [ref=f3e306]:
          - generic [ref=f3e307]: Aforo máximo
          - group [ref=f3e309]:
            - button "Decrement" [ref=f3e310]
            - textbox "Aforo máximo" [ref=f3e312]: "4"
            - button "Increment" [ref=f3e313]
          - spinbutton [aria-hidden] [ref=f3e316]: "4"
        - generic [ref=f3e317]:
          - generic [ref=f3e318]: Estado
          - combobox "Estado" [active] [ref=f3e320] [cursor=pointer]:
            - generic [ref=f3e321]: Activo
      - generic [ref=f3e325]:
        - generic [ref=f3e326]:
          - generic [ref=f3e327]: Abre
          - combobox "Hora de apertura" [ref=f3e329] [cursor=pointer]:
            - generic [ref=f3e330]: 6:00 a. m.
        - generic [ref=f3e334]:
          - generic [ref=f3e335]: Cierra
          - combobox "Hora de cierre" [ref=f3e337] [cursor=pointer]:
            - generic [ref=f3e338]: 6:00 p. m.
      - generic [ref=f3e342]:
        - generic [ref=f3e343]: Requisitos de uso (opcional)
        - textbox "Requisitos de uso (opcional)" [ref=f3e344]:
          - /placeholder: Calzado deportivo
          - text: Calzado deportivo
      - generic [ref=f3e345]:
        - generic [ref=f3e346]:
          - generic [ref=f3e347]: Vista previa
          - generic [ref=f3e348] [cursor=pointer]:
            - generic [ref=f3e349]: Foto de la cancha
            - button "Foto de la cancha" [ref=f3e354]
        - generic [ref=f3e355]:
          - generic [ref=f3e356]:
            - generic [ref=f3e357]: Panorámica 360°
            - generic [ref=f3e358] [cursor=pointer]:
              - generic [ref=f3e359]: Panorámica 360° (equirectangular)
              - button "Panorámica 360° (equirectangular)" [ref=f3e364]
          - status [ref=f3e365]: Añade tenis-1.png (o el mismo nombre con .jpg, .jpeg o .webp) en public/panoramas/ y vuelve a intentar.
      - paragraph [ref=f3e366]: Máximo 30 MB por imagen. El servidor valida el formato por su contenido.
      - paragraph [ref=f3e367]: "Se admiten panoramas PNG, JPG/JPEG o WebP de cualquier proporción. El visor los estira o comprime a 2:1, sin recortar, hasta un máximo de 4096 × 2048 px. El archivo original no se modifica; las proporciones muy distintas pueden deformarse. En el Recorrido MVP, las imágenes subidas son temporales: al recargar vuelven los panoramas de public/panoramas/."
    - generic [ref=f3e370]:
      - button "Cancelar" [ref=f3e371] [cursor=pointer]
      - button "Guardar cambios" [ref=f3e373] [cursor=pointer]
    - button "Close dialog" [ref=f3e375] [cursor=pointer]:
      - generic [ref=f3e376]: Close
```

# Test source

```ts
  8   |   multiple2: 'a1b2c3d4-0003-4000-8000-000000000003',
  9   |   futbol5: 'a1b2c3d4-0004-4000-8000-000000000004',
  10  |   futbol11: 'a1b2c3d4-0005-4000-8000-000000000005',
  11  | }
  12  | export const HOY = '2026-11-24' // martes
  13  | export const MANANA = '2026-11-25'
  14  | export const LUNES_SIGUIENTE = '2026-11-30'
  15  | const AHORA = `${HOY}T10:30:00-05:00`
  16  | const STATE = 'ud-demo-state-v1'
  17  | 
  18  | const at = (date, hour, min = 0) => new Date(`${date}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00-05:00`)
  19  | 
  20  | /** Reserva del estudiante demo. `hour` admite fracciones (10.5 = 10:30). */
  21  | export const reserva = (id, { space = ID.multiple1, date = HOY, hour = 14, hours = 1, status = 'CONFIRMED', equipment = [] } = {}) => {
  22  |   const start = at(date, Math.floor(hour), Math.round((hour % 1) * 60))
  23  |   return {
  24  |     id, spaceId: space, userId: 'demo-student', status, equipment,
  25  |     startAt: start.toISOString(), endAt: new Date(start.getTime() + hours * 3_600_000).toISOString(),
  26  |     createdAt: at(date, 1).toISOString(), checkedInAt: status === 'IN_USE' ? start.toISOString() : null,
  27  |   }
  28  | }
  29  | 
  30  | const space = (id, name, openingTime, closingTime, disciplines, extra = {}) => ({
  31  |   id, name, capacity: 20, requirements: 'Calzado deportivo', openingTime, closingTime, status: 'ACTIVE', disciplines, ...extra,
  32  | })
  33  | export const estado = (extra = {}) => ({
  34  |   catalogVersion: 2,
  35  |   spaces: [
  36  |     space(ID.multiple1, 'Cancha múltiple 1', '08:00', '20:00', ['BASKETBALL', 'VOLLEYBALL']),
  37  |     space(ID.tenis1, 'Cancha de tenis 1', '06:00', '18:00', ['TENNIS'], { capacity: 4 }),
  38  |     space(ID.multiple2, 'Cancha múltiple 2', '06:00', '18:00', ['FOOTBALL_5', 'BASKETBALL']),
  39  |     space(ID.futbol5, 'Cancha fútbol 5', '07:00', '21:00', ['FOOTBALL_5'], { status: 'MAINTENANCE', capacity: 10 }),
  40  |     space(ID.futbol11, 'Cancha fútbol 11', '07:00', '21:00', ['FOOTBALL_11'], { capacity: 22 }),
  41  |   ],
  42  |   reservations: [],
  43  |   blocks: [],
  44  |   equipment: [
  45  |     { id: 'eq-balon', name: 'Balón de baloncesto', discipline: 'BASKETBALL', stock: 10, status: 'AVAILABLE' },
  46  |     { id: 'eq-voley', name: 'Balón de voleibol', discipline: 'VOLLEYBALL', stock: 8, status: 'AVAILABLE' },
  47  |     { id: 'eq-malla', name: 'Malla de voleibol', discipline: 'VOLLEYBALL', stock: 2, status: 'INACTIVE' },
  48  |     { id: 'eq-petos', name: 'Petos', discipline: null, stock: 20, status: 'AVAILABLE' },
  49  |   ],
  50  |   params: { weeklyHours: 4, noShows: 3 },
  51  |   ...extra,
  52  | })
  53  | 
  54  | /**
  55  |  * `demo({ role, state, time, random })`: prepara la página antes de navegar.
  56  |  * El estado solo se siembra una vez, para que sobreviva a las recargas.
  57  |  */
  58  | export const test = base.extend({
  59  |   errores: async ({ page }, use) => {
  60  |     const list = []
  61  |     page.on('pageerror', (e) => list.push(e.message))
  62  |     page.on('console', (m) => m.type() === 'error' && list.push(m.text()))
  63  |     await use(list)
  64  |   },
  65  |   demo: async ({ page }, use) => {
  66  |     await use(async ({ role = 'student', state = estado(), time = AHORA, random = 0.9 } = {}) => {
  67  |       // setFixedTime solo fija la fecha: clock.install también simula los temporizadores y congela las animaciones
  68  |       if (time) await page.clock.setFixedTime(new Date(time))
  69  |       await page.addInitScript(
  70  |         ({ role, state, random, key }) => {
  71  |           if (random != null) Math.random = () => random
  72  |           if (sessionStorage.getItem('qa')) return
  73  |           sessionStorage.setItem('qa', '1')
  74  |           if (role) localStorage.setItem('ud-token', `demo:${role}`)
  75  |           if (state) localStorage.setItem(key, JSON.stringify(state))
  76  |         },
  77  |         { role, state, random, key: STATE }
  78  |       )
  79  |     })
  80  |   },
  81  | })
  82  | 
  83  | export const leerEstado = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), STATE)
  84  | export const titulo = (page, name) => page.getByRole('heading', { level: 1, name })
  85  | 
  86  | /** Columna de un día del calendario (0 = hoy). Solo hay 7 columnas en pantalla grande. */
  87  | export const columna = (page, day) => page.locator('[aria-busy] > div.border-l').nth(day)
  88  | export const libres = (page, day) => columna(page, day).locator('button:not([disabled])')
  89  | /** Celda de una hora concreta: la fila sale de la hora de apertura. */
  90  | export const celda = (page, day, hour, open = 8) => columna(page, day).locator('button').nth(hour - open)
  91  | 
  92  | export const abrirCancha = async (page, id = ID.multiple1) => {
  93  |   await page.goto(`/app/disponibilidad/${id}`)
  94  |   await expect(page.getByText(/En vivo/)).toBeVisible()
  95  |   await expect(page.locator('[aria-busy="false"]').first()).toBeVisible()
  96  | }
  97  | export const continuar = (page) => page.getByRole('button', { name: /^Continuar/ }).locator('visible=true').click()
  98  | 
  99  | /** Cambia de sesión en la misma pestaña, conservando los datos de la demo. */
  100 | export const entrarComo = async (page, role, path) => {
  101 |   await page.evaluate((r) => localStorage.setItem('ud-token', `demo:${r}`), role)
  102 |   await page.goto(path)
  103 | }
  104 | /** Elige una opción de un Select de SmoothUI por su etiqueta accesible. */
  105 | export const elegir = async (page, label, option) => {
  106 |   await page.getByLabel(label, { exact: true }).locator('visible=true').first().click()
  107 |   await page.getByRole('option', { name: option, exact: true }).click()
> 108 |   await expect(page.getByRole('option')).toHaveCount(0) // la lista se cierra con animación
      |                                          ^ Error: expect(locator).toHaveCount(expected) failed
  109 | }
  110 | /** Diálogos de la app; los avisos (toast) también tienen rol de diálogo. */
  111 | export const dialogo = (page) => page.locator('[data-slot="dialog-content"]')
  112 | 
```