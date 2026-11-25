# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: backend/api-acceso.e2e.js >> Reautenticación >> [QA-19] reautenticarse justo después de iniciar sesión con código debería ser posible
- Location: e2e/backend/api-acceso.e2e.js:208:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 202
Received: 429
```

# Test source

```ts
  113 |   test('[ACC-31][ACC-32] sin nombre solo se puede completar el perfil', async () => {
  114 |     const c = await ingresar()
  115 |     expect((await c('GET', '/me')).body.needsName).toBe(true)
  116 |     for (const path of ['/spaces', '/quota/me', '/reservations/mine', '/rules']) expect((await c('GET', path)).code, path).toBe('PROFILE_INCOMPLETE')
  117 |     for (const name of ['', '   ']) expect((await c('PUT', '/me/profile', { name })).status).toBe(400)
  118 |     expect((await c('PUT', '/me/profile', { name: 'Ñandú O’Connor' })).status).toBe(200)
  119 |     expect((await c('GET', '/spaces')).status).toBe(200)
  120 |   })
  121 | 
  122 |   test('[ACC-34] un nombre de más de 200 caracteres se rechaza con un error controlado', async () => {
  123 |     const c = await ingresar()
  124 |     expect((await c('PUT', '/me/profile', { name: 'x'.repeat(201) })).status).toBe(400)
  125 |     expect((await c('PUT', '/me/profile', { name: 'x'.repeat(200) })).status).toBe(200)
  126 |   })
  127 | 
  128 |   test('[ACC-50] dos sesiones a la vez; cerrar una no cierra la otra', async () => {
  129 |     const a = cliente(await login(ANA)), b = cliente(await login(ANA))
  130 |     expect((await a('POST', '/auth/logout')).status).toBe(204)
  131 |     expect((await b('GET', '/me')).status).toBe(200)
  132 |   })
  133 | 
  134 |   test('[ACC-51] el rol vigente sale de la base, no del token', async ({ admin }) => {
  135 |     expect((await admin('GET', '/admin/spaces')).status).toBe(200)
  136 |     sql(`UPDATE app_user SET role='USER' WHERE email='${ADMIN}'`)
  137 |     expect((await admin('GET', '/admin/spaces')).status).toBe(403)
  138 |   })
  139 | 
  140 |   test('[INT-16] un token vencido responde TOKEN_EXPIRED', async () => {
  141 |     await login(ANA)
  142 |     const past = Math.floor(Date.now() / 1000) - 10
  143 |     expect((await cliente(tokenDe(ANA, { iat: past - 100, exp: past }))('GET', '/me')).code).toBe('TOKEN_EXPIRED')
  144 |   })
  145 | 
  146 |   test('[TRX-43] rechaza firmas ajenas, alg none, tokens alterados y usuarios inexistentes', async () => {
  147 |     const good = await login(ANA)
  148 |     const now = Math.floor(Date.now() / 1000)
  149 |     const bad = {
  150 |       alterado: good.slice(0, -3) + (good.endsWith('AAA') ? 'BBB' : 'AAA'),
  151 |       'otra firma': tokenDe(ANA, {}, { secret: 'otra-clave-de-mas-de-treinta-y-dos-bytes!!' }),
  152 |       'alg none': tokenDe(ANA, {}, { header: { alg: 'none', typ: 'JWT' } }),
  153 |       'sin exp': tokenDe(ANA, { exp: undefined }),
  154 |       inexistente: jwt({ sub: '00000000-0000-4000-8000-00000000dead', iat: now, exp: now + 100 }),
  155 |       'sub no uuid': jwt({ sub: 'admin', iat: now, exp: now + 100 }),
  156 |       basura: 'no-es-un-jwt',
  157 |     }
  158 |     for (const [name, token] of Object.entries(bad)) {
  159 |       const res = await cliente(token)('GET', '/me')
  160 |       expect(res.status, name).toBe(401)
  161 |       expect(res.code, name).toBe('TOKEN_INVALID')
  162 |     }
  163 |     expect((await anon('GET', '/me')).status).toBe(401)
  164 |   })
  165 | 
  166 |   test('[ACC-41] el estudiante no puede usar ninguna ruta de administrador', async ({ ana }) => {
  167 |     for (const [m, p, b] of [
  168 |       ['GET', '/admin/spaces'], ['GET', '/admin/parameters'], ['PUT', '/admin/parameters', { quota: { weeklyHours: 100 } }],
  169 |       ['POST', '/admin/blocks', {}], ['GET', `/admin/occupancy?date=2026-11-24`], ['GET', '/admin/indicators?period=WEEKLY'],
  170 |       ['POST', '/admin/equipment', {}], ['GET', `/admin/spaces/${CANCHA}/qr`], ['POST', '/auth/reauth/code'],
  171 |     ]) {
  172 |       const res = await ana(m, p, b)
  173 |       expect(res.status, `[TRX-41] ${m} ${p}`).toBe(403)
  174 |     }
  175 |     expect(sql('SELECT count(*) FROM usage_parameters')).toBe('1')
  176 |   })
  177 | 
  178 |   test('[TRX-41] un rol ADMIN escrito en el token de un estudiante no concede nada', async () => {
  179 |     await login(ANA)
  180 |     expect((await cliente(tokenDe(ANA, { role: 'ADMIN' }))('GET', '/admin/spaces')).status).toBe(403)
  181 |   })
  182 | })
  183 | 
  184 | test.describe('Reautenticación', () => {
  185 |   test('[ADM-62][ADM-74] bloqueos y reglas la exigen', async () => {
  186 |     const c = cliente(await login(ADMIN, 'Admin QA'))
  187 |     expect((await c('PUT', '/admin/parameters', { quota: { weeklyHours: 5 } })).code).toBe('REAUTH_REQUIRED')
  188 |     expect((await c('POST', '/admin/blocks', {})).code).toBe('REAUTH_REQUIRED')
  189 |   })
  190 | 
  191 |   test('[ADM-64] vale 10 minutos', async () => {
  192 |     await login(ADMIN, 'Admin QA')
  193 |     const now = Math.floor(Date.now() / 1000)
  194 |     const put = (ago) => cliente(tokenDe(ADMIN, { reauth_at: now - ago }))('PUT', '/admin/parameters', { quota: { weeklyHours: 4 } })
  195 |     expect((await put(590)).status).toBe(200)
  196 |     expect((await put(605)).code).toBe('REAUTH_REQUIRED')
  197 |     expect((await put(-3600)).code).toBe('REAUTH_REQUIRED')
  198 |   })
  199 | 
  200 |   test('el flujo completo entrega un token reautenticado que conserva el vencimiento', async () => {
  201 |     const c = cliente(await login(ADMIN, 'Admin QA'))
  202 |     expect((await c('POST', '/auth/reauth/code')).status).toBe(202)
  203 |     const res = await c('POST', '/auth/reauth/verify', { code: await codigo(ADMIN) })
  204 |     expect(res.status).toBe(200)
  205 |     expect((await cliente(res.body.token)('PUT', '/admin/parameters', { quota: { weeklyHours: 5 } })).status).toBe(200)
  206 |   })
  207 | 
  208 |   test('[QA-19] reautenticarse justo después de iniciar sesión con código debería ser posible', async () => {
  209 |     test.fail(true, 'QA-19: el código de acceso ya usado bloquea el de reautenticación durante 60 s')
  210 |     await pedir(ADMIN)
  211 |     const { token } = (await validar(ADMIN, await codigo(ADMIN))).body
  212 |     await cliente(token)('PUT', '/me/profile', { name: 'Admin QA' })
> 213 |     expect((await cliente(token)('POST', '/auth/reauth/code')).status).toBe(202)
      |                                                                        ^ Error: expect(received).toBe(expected) // Object.is equality
  214 |   })
  215 | })
  216 | 
  217 | test('[TRX-40] auditoría de ingresos y salidas', async () => {
  218 |   await pedir(NUEVA)
  219 |   const code = await codigo(NUEVA)
  220 |   await validar(NUEVA, otro(code))
  221 |   const { token } = (await validar(NUEVA, code)).body
  222 |   await cliente(token)('POST', '/auth/logout')
  223 |   const actions = sql('SELECT string_agg(DISTINCT action, \',\') FROM audit_log').split(',')
  224 |   expect(actions).toEqual(expect.arrayContaining(['LOGIN', 'LOGOUT']))
  225 |   expect(actions.length).toBeGreaterThanOrEqual(4) // solicitud y fallo también quedan (RN-61)
  226 | })
  227 | 
```