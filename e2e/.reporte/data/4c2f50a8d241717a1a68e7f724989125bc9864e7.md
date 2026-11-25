# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: backend/api-operacion.e2e.js >> Bloqueos >> [QA-22] no debería aceptar un bloqueo fuera del horario
- Location: e2e/backend/api-operacion.e2e.js:200:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 201
```

# Test source

```ts
  102 |     await espera(dentro, 'CANCELLED_BY_SUSPENSION')
  103 |     expect(estadoDe(fuera)).toBe('CONFIRMED')
  104 |     const me = (await ana('GET', '/me')).body
  105 |     expect((new Date(me.suspendedUntil) - Date.now()) / 86_400_000).toBeCloseTo(7, 1)
  106 |     const res = await ana('POST', '/reservations', { spaceId: CANCHA, startAt: instante(M, 10), slots: 1 })
  107 |     expect(res.code).toBe('SUSPENDED')
  108 |     expect((await ana('GET', '/reservations/mine')).status).toBe(200) // RN-05: puede consultar
  109 |     expect((await ana('GET', `/spaces/${CANCHA}/availability?date=${M}`)).status).toBe(200)
  110 |     await correo(ANA, /suspen/i)
  111 |     expect(sql('SELECT count(*) FROM monthly_suspension')).toBe('1')
  112 |   })
  113 | 
  114 |   test('[INT-09] al terminar la suspensión vuelve a reservar', async ({ ana }) => {
  115 |     sql(`UPDATE app_user SET suspended_until=now()-interval '1 second' WHERE email='${ANA}'`)
  116 |     expect((await ana('POST', '/reservations', { spaceId: CANCHA, startAt: instante(M, 10), slots: 1 })).status).toBe(201)
  117 |   })
  118 | 
  119 |   test('dos faltas no suspenden', async ({ ana }) => {
  120 |     test.skip(inicioDeMes, 'las faltas podrían caer en dos meses')
  121 |     const ids = [falta(1), falta(3)]
  122 |     for (const id of ids) await espera(id, 'NO_SHOW')
  123 |     expect((await ana('GET', '/me')).body.suspendedUntil).toBeNull()
  124 |   })
  125 | })
  126 | 
  127 | test.describe('Recordatorios', () => {
  128 |   test('[INT-11] llega con enlace de cancelación cuando faltan menos de 2 h', async ({ ana }) => {
  129 |     void ana
  130 |     const id = reserva(ANA, { minutes: 115 })
  131 |     const mail = await correo(ANA, /comienza/)
  132 |     expect(mail.Text).toContain(`${APP}/reservations/${id}/cancel`)
  133 |     await new Promise((r) => setTimeout(r, 5000))
  134 |     expect((await correos(ANA)).length).toBe(1) // no se repite
  135 |   })
  136 | 
  137 |   test('[INT-12] no se envía si se reservó con menos de 2 h', async ({ ana }) => {
  138 |     void ana
  139 |     reserva(ANA, { minutes: 60, created: 'now()' })
  140 |     await new Promise((r) => setTimeout(r, 6000))
  141 |     expect(await correos(ANA)).toHaveLength(0)
  142 |   })
  143 | })
  144 | 
  145 | test.describe('Bloqueos', () => {
  146 |   const bloquear = (c, extra = {}) => c('POST', '/admin/blocks', { spaceId: CANCHA, type: 'CLASS', reason: 'Clase QA', startAt: instante(M, 10), endAt: instante(M, 12), ...extra })
  147 |   const franja = async (c, h) => (await c('GET', `/spaces/${CANCHA}/availability?date=${M}`)).body.slots[h]
  148 | 
  149 |   test('[ADM-50][DIS-15] bloquea y muestra el motivo', async ({ ana, admin }) => {
  150 |     expect((await bloquear(admin)).body).toEqual({ recurrenceGroup: null, createdBlocks: 2, cancelledReservations: 0 })
  151 |     expect(await franja(ana, 10)).toMatchObject({ status: 'BLOCKED', bookable: false, reason: 'Clase QA' })
  152 |     expect((await franja(ana, 12)).status).toBe('FREE')
  153 |   })
  154 | 
  155 |   test('[ADM-52][INT-10] cancela lo futuro, libera la cuota y avisa con el motivo', async ({ ana, admin }) => {
  156 |     const { body } = await ana('POST', '/reservations', { spaceId: CANCHA, startAt: instante(M, 11), slots: 2 })
  157 |     expect((await bloquear(admin)).body.cancelledReservations).toBe(1)
  158 |     expect(estadoDe(body.id)).toBe('CANCELLED_BY_ADMIN')
  159 |     expect((await ana('GET', '/quota/me')).body.usedHours).toBe(0)
  160 |     const mail = await correo(ANA, /cancel/i)
  161 |     expect(mail.Text).toContain('Clase QA')
  162 |   })
  163 | 
  164 |   test('[ADM-53] con una reserva en curso no crea nada, aunque no tenga check-in', async ({ ana, admin }) => {
  165 |     void ana
  166 |     const id = reserva(ANA, { minutes: -10, hours: 2 })
  167 |     const inicio = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000)
  168 |     const res = await bloquear(admin, { startAt: inicio.toISOString(), endAt: new Date(+inicio + 3 * 3_600_000).toISOString() })
  169 |     expect(res.code).toBe('RESERVATION_IN_USE')
  170 |     expect(estadoDe(id)).toBe('CONFIRMED')
  171 |     expect(sql('SELECT count(*) FROM institutional_block')).toBe('0')
  172 |   })
  173 | 
  174 |   test('[ADM-54] recurrente: días por horas', async ({ admin }) => {
  175 |     const res = await bloquear(admin, { recurrence: { daysOfWeek: ['MONDAY', 'WEDNESDAY'], until: dia(14) } })
  176 |     expect(res.body.recurrenceGroup).toBeTruthy()
  177 |     let n = 0
  178 |     for (let i = 1; i <= 14; i++) if ([1, 3].includes(new Date(`${dia(i)}T12:00:00Z`).getUTCDay())) n++
  179 |     expect(res.body.createdBlocks).toBe(n * 2)
  180 |   })
  181 | 
  182 |   test('[ADM-51][ADM-55][ADM-56] rechaza motivo vacío, fechas al revés y recurrencias sin fechas', async ({ admin }) => {
  183 |     const manana = new Date(`${M}T12:00:00Z`).getUTCDay()
  184 |     const otroDia = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][(manana + 3) % 7]
  185 |     for (const extra of [
  186 |       { reason: '  ' }, { type: 'X' }, { endAt: instante(M, 10) }, { endAt: instante(M, 9) }, { spaceId: null },
  187 |       { recurrence: { daysOfWeek: [], until: dia(9) } }, { recurrence: { daysOfWeek: ['MONDAY'], until: dia(-1) } },
  188 |       { recurrence: { daysOfWeek: [otroDia], until: M } },
  189 |     ]) expect((await bloquear(admin, extra)).status, JSON.stringify(extra)).toBe(400)
  190 |     expect((await bloquear(admin, { spaceId: '00000000-0000-4000-8000-000000000000' })).code).toBe('SPACE_NOT_FOUND')
  191 |     expect(sql('SELECT count(*) FROM institutional_block')).toBe('0')
  192 |   })
  193 | 
  194 |   for (const [id, caso, extra] of [
  195 |     ['ADM-57', 'en el pasado', { startAt: instante(dia(-30), 10), endAt: instante(dia(-30), 11) }],
  196 |     ['QA-22', 'a media hora', { startAt: `${M}T10:30:00-05:00`, endAt: `${M}T11:30:00-05:00` }],
  197 |     ['QA-22', 'fuera del horario', { spaceId: TENIS, startAt: instante(M, 20), endAt: instante(M, 21) }],
  198 |     ['QA-22', 'de 20 años', { recurrence: { daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], until: '2046-01-01' } }],
  199 |   ]) {
  200 |     test(`[${id}] no debería aceptar un bloqueo ${caso}`, async ({ admin }) => {
  201 |       test.fail(true, 'QA-22: los bloqueos no se validan contra el presente, el horario, la hora exacta ni un máximo')
> 202 |       expect((await bloquear(admin, extra)).status).toBe(400)
      |                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  203 |     })
  204 |   }
  205 | 
  206 |   test('[ADM-60] no debería duplicar un bloqueo idéntico', async ({ admin }) => {
  207 |     test.fail(true, 'QA-22: se crean filas repetidas')
  208 |     await bloquear(admin)
  209 |     expect((await bloquear(admin)).status).not.toBe(201)
  210 |   })
  211 | })
  212 | 
  213 | test.describe('Espacios e imágenes', () => {
  214 |   const datos = (extra = {}) => ({ name: 'Nueva QA', capacity: 12, requirements: null, openingTime: '06:00', closingTime: '22:00', status: 'ACTIVE', disciplines: ['VOLLEYBALL'], ...extra })
  215 |   const formulario = (extra, { preview = PNG, panorama = PNG } = {}) => {
  216 |     const f = new FormData()
  217 |     f.append('space', new Blob([JSON.stringify(datos(extra))], { type: 'application/json' }))
  218 |     if (preview) f.append('preview', new Blob([preview]), 'a.png')
  219 |     if (panorama) f.append('panorama', new Blob([panorama]), 'b.png')
  220 |     return f
  221 |   }
  222 | 
  223 |   test('[ADM-22][INT-18][PAN-27] crear, listar y recuperar los mismos bytes', async ({ ana, admin }) => {
  224 |     const res = await admin('POST', '/admin/spaces', formulario())
  225 |     expect(res.status).toBe(201)
  226 |     expect((await ana('GET', '/spaces')).body.spaces.map((s) => s.name)).toContain('Nueva QA')
  227 |     const img = await fetch(`${API}/spaces/${res.body.id}/images/PANORAMA`, { headers: { Authorization: `Bearer ${await login(ANA)}` } })
  228 |     expect(img.headers.get('content-type')).toBe('image/png')
  229 |     expect(Buffer.from(await img.arrayBuffer()).equals(PNG)).toBe(true)
  230 |   })
  231 | 
  232 |   test('[ADM-21][ADM-23][ADM-28][ADM-29][ADM-31] datos inválidos', async ({ admin }) => {
  233 |     for (const extra of [{ name: '  ' }, { name: 'x'.repeat(201) }, { capacity: 0 }, { capacity: -1 }, { openingTime: '22:00', closingTime: '06:00' }, { openingTime: '06:00', closingTime: '06:00' }, { openingTime: '25:00' }, { disciplines: [] }, { disciplines: ['GOLF'] }, { status: 'X' }]) {
  234 |       const { status } = await admin('POST', '/admin/spaces', formulario(extra))
  235 |       expect(status, JSON.stringify(extra).slice(0, 60)).toBe(400)
  236 |     }
  237 |     for (const images of [{ preview: null }, { panorama: null }, { preview: Buffer.alloc(0) }]) expect((await admin('POST', '/admin/spaces', formulario({}, images))).status).toBe(400)
  238 |     expect(sql('SELECT count(*) FROM space')).toBe('3')
  239 |   })
  240 | 
  241 |   test('fútbol 5 y fútbol 11 no pueden compartir cancha', async ({ admin }) => {
  242 |     const res = await admin('POST', '/admin/spaces', formulario({ disciplines: ['FOOTBALL_5', 'FOOTBALL_11'] }))
  243 |     expect(res.status).toBe(400)
  244 |     expect(res.body.details.fields.disciplines).toBeTruthy()
  245 |   })
  246 | 
  247 |   test('[ADM-32][PAN-22][PAN-24] rechaza SVG, HTML, texto y PNG cortado, aunque digan ser PNG', async ({ admin }) => {
  248 |     for (const bad of ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', '<html></html>', 'hola', PNG.subarray(0, 40)]) {
  249 |       expect((await admin('POST', '/admin/spaces', formulario({}, { preview: Buffer.from(bad) }))).status).toBe(400)
  250 |     }
  251 |   })
  252 | 
  253 |   test('[PAN-23] más de 30 MiB', async ({ admin }) => {
  254 |     const { status } = await admin('POST', '/admin/spaces', formulario({}, { panorama: Buffer.concat([PNG, Buffer.alloc(31 * 1024 * 1024)]) }))
  255 |     expect([400, 413]).toContain(status)
  256 |   })
  257 | 
  258 |   test('[PAN-20] acepta WebP, como anuncia el formulario', async ({ admin, page }) => {
  259 |     test.fail(true, 'QA-23: el backend no tiene lector de WebP')
  260 |     const base64 = await page.evaluate(() => {
  261 |       const c = Object.assign(document.createElement('canvas'), { width: 64, height: 32 })
  262 |       c.getContext('2d').fillRect(0, 0, 64, 32)
  263 |       return c.toDataURL('image/webp').split(',')[1]
  264 |     })
  265 |     const webp = Buffer.from(base64, 'base64')
  266 |     expect(webp.subarray(8, 12).toString()).toBe('WEBP')
  267 |     expect((await admin('POST', '/admin/spaces', formulario({}, { panorama: webp }))).status).toBe(201)
  268 |   })
  269 | 
  270 |   test('[ADM-24][ADM-25][ADM-26] mantenimiento y horario se reflejan', async ({ ana, admin }) => {
  271 |     const visible = async () => (await ana('GET', '/spaces')).body.spaces.some((s) => s.id === CANCHA)
  272 |     const editar = (extra) => admin('PUT', `/admin/spaces/${CANCHA}`, datos({ name: 'Cancha QA', ...extra }))
  273 |     expect((await editar({ status: 'MAINTENANCE' })).status).toBe(200)
  274 |     expect(await visible()).toBe(false)
  275 |     await editar({ status: 'ACTIVE', openingTime: '08:00', closingTime: '10:00' })
  276 |     expect(await visible()).toBe(true)
  277 |     expect((await ana('GET', `/spaces/${CANCHA}/availability?date=${M}`)).body.slots).toHaveLength(2)
  278 |   })
  279 | 
  280 |   test('[ADM-27] reducir el horario conserva las reservas', async ({ ana, admin }) => {
  281 |     const { body } = await ana('POST', '/reservations', { spaceId: CANCHA, startAt: instante(M, 20), slots: 1 })
  282 |     await admin('PUT', `/admin/spaces/${CANCHA}`, datos({ closingTime: '12:00' }))
  283 |     expect(estadoDe(body.id)).toBe('CONFIRMED')
  284 |   })
  285 | 
  286 |   test('[ADM-33][ADM-83][CHK-13] el QR es SVG y existe también en mantenimiento', async ({ admin }) => {
  287 |     const res = await admin('GET', `/admin/spaces/${CERRADA}/qr`)
  288 |     expect(res.status).toBe(200)
  289 |     expect(res.headers.get('content-type')).toContain('image/svg+xml')
  290 |   })
  291 | 
  292 |   test('horas en formato HH:mm, como dice el contrato', async ({ ana }) => {
  293 |     test.fail(true, 'QA-24: responde HH:mm:ss')
  294 |     expect((await ana('GET', '/spaces')).body.spaces[0].openingTime).toMatch(/^\d\d:\d\d$/)
  295 |   })
  296 | })
  297 | 
  298 | test.describe('Implementos', () => {
  299 |   test('[ADM-40][ADM-42][ADM-44][ADM-45] crear, inactivar y validar', async ({ ana, admin }) => {
  300 |     const res = await admin('POST', '/admin/equipment', { name: 'Conos', stock: 0 })
  301 |     expect(res.body).toMatchObject({ name: 'Conos', stock: 0, status: 'AVAILABLE', discipline: null })
  302 |     expect((await admin('PUT', `/admin/equipment/${BALON}`, { status: 'INACTIVE' })).status).toBe(200)
```