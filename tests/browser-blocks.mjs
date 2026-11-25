// Chrome headless + API controlada, sin dependencias nuevas ni datos reales.
// Ejecutar: npm run test:browser:blocks (CHROME_PATH permite elegir el binario).
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { createServer } from 'vite'

const chromePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chromePath), 'Configura CHROME_PATH con un Chrome instalado.')
const tempRoot = process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, 'Temp', 'opencode')
  : process.env.TMPDIR
assert.ok(tempRoot, 'Configura TMPDIR para los recursos temporales de prueba.')
const profile = await mkdtemp(path.join(tempRoot, 'unimag-blocks-browser-'))
const spaceId = '11111111-1111-4111-8111-111111111111'
const adminId = '22222222-2222-4222-8222-222222222222'
const day = new Date(Date.now() - 5 * 3600000 + 86400000).toISOString().slice(0, 10)
const instant = (hour) => `${day}T${String(hour).padStart(2, '0')}:00:00-05:00`
const space = { id: spaceId, name: 'Cancha de prueba', capacity: 20, openingTime: '08:00', closingTime: '20:00', status: 'ACTIVE', disciplines: ['BASKETBALL'] }
const rules = {
  reservation: { slotMinutes: 60, maxSlotsPerReservation: 2, maxAdvanceDays: 6, bookingToleranceMinutes: 10 },
  quota: { weeklyHours: 4, dailyHours: 2 }, cancellation: { lateThresholdMinutes: 60 },
  checkIn: {}, reminder: {}, sanctions: {},
}
let blocks, fault, requests, transitions, streams = new Set()
const reset = () => {
  requests = []
  transitions = 0
  fault = 'lost-response'
  blocks = [8, 9].map((hour, index) => ({
    id: `33333333-3333-4333-8333-33333333333${index}`, spaceId, type: 'CLASS', reason: 'Clase recurrente',
    startAt: instant(hour), endAt: instant(hour + 1), recurrenceGroup: '44444444-4444-4444-8444-444444444444',
    status: 'ACTIVE', cancelledAt: null, cancelledBy: null, cancellationReason: null,
  }))
}
reset()
const backend = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const token = req.headers.authorization
  const send = (body, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(body))
  }
  requests.push({ path: url.pathname, query: Object.fromEntries(url.searchParams), token })
  if (url.pathname.endsWith('/availability/stream')) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
    res.write(': connected\n\n')
    streams.add(res)
    req.on('close', () => streams.delete(res))
    return
  }
  if (url.pathname === '/me') return send({ id: adminId, role: token === 'Bearer student-test' ? 'USER' : 'ADMIN', name: 'Administrador de prueba', email: 'admin@unimagdalena.edu.co', needsName: false })
  if (url.pathname === '/rules') return send(rules)
  if (url.pathname === '/spaces' || url.pathname === '/admin/spaces') return send({ spaces: [space] })
  if (url.pathname === '/reservations/mine') return send({ reservations: [] })
  if (url.pathname === '/quota/me') return send({ weekStart: instant(0), limitHours: 4, usedHours: 0, availableHours: 4 })
  if (url.pathname === '/auth/reauth/code') return send({ message: 'Código de prueba enviado' })
  if (url.pathname === '/auth/reauth/verify') {
    let body = ''
    for await (const chunk of req) body += chunk
    return JSON.parse(body).code === '123456'
      ? send({ token: 'fresh-admin-test' })
      : send({ code: 'CODE_INVALID', message: 'Código inválido', details: { attemptsRemaining: 4 } }, 400)
  }
  if (url.pathname === '/admin/blocks' && req.method === 'GET') {
    const status = url.searchParams.get('status')
    const items = blocks.filter((block) => !status || block.status === status)
    return send({ items, page: 0, size: 20, totalElements: items.length })
  }
  if (url.pathname.endsWith('/cancellation')) {
    if (token !== 'Bearer fresh-admin-test') return send({ code: 'REAUTH_REQUIRED', message: 'Reautentícate' }, 403)
    let body = ''
    for await (const chunk of req) body += chunk
    const { reason } = JSON.parse(body)
    const block = blocks.find((item) => url.pathname.includes(item.id))
    if (fault === 'ended') return send({ code: 'BLOCK_NOT_CANCELLABLE', message: 'La franja terminó durante la confirmación' }, 409)
    if (block.status !== 'CANCELLED') {
      transitions++
      Object.assign(block, { status: 'CANCELLED', cancelledAt: new Date().toISOString(), cancelledBy: adminId, cancellationReason: reason })
      for (const stream of streams) stream.write(`event: availability-changed\ndata: ${JSON.stringify({ spaceId })}\n\n`)
    }
    if (fault === 'lost-response') {
      fault = null
      return send({ code: 'TEMPORARY_ERROR', message: 'Respuesta interrumpida tras el registro' }, 503)
    }
    return send(block)
  }
  if (url.pathname === '/admin/occupancy') {
    return send({ spaces: [{ spaceId, slots: Array.from({ length: 12 }, (_, index) => ({
      startAt: instant(index + 8), endAt: instant(index + 9),
      // Otra restricción sigue presente aun tras cancelar el primer bloqueo.
      status: index <= 1 ? 'BLOCKED' : 'FREE',
    })) }] })
  }
  if (url.pathname.endsWith('/availability')) return send({ slots: [{ startAt: instant(8), endAt: instant(9), status: 'BLOCKED', bookable: false, reason: 'Otra restricción vigente' }] })
  if (url.pathname === '/admin/indicators') return send({ from: instant(0), to: instant(23), reservations: 0, lateCancellations: 0, noShows: 0, suspendedUsers: 0 })
  return send({ code: 'NOT_FOUND', message: 'Sin imagen de prueba' }, 404)
})
let vite, chrome, socket
const commands = new Map()
let sequence = 0
const exceptions = []
const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  const timeout = setTimeout(() => { commands.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
  commands.set(id, { resolve: (value) => { clearTimeout(timeout); resolve(value) }, reject })
  socket.send(JSON.stringify({ id, method, params }))
})
const evaluate = async (expression) => {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const waitFor = async (expression) => {
  for (let index = 0; index < 150; index++) {
    if (await evaluate(expression)) return
    await delay(100)
  }
  throw new Error(`No se cumplió: ${expression}\n${await evaluate('document.body.innerText')}`)
}
const click = (text, selector = 'button') => evaluate(`(() => {
  const element = [...document.querySelectorAll(${JSON.stringify(selector)})].find(node => node.textContent.trim() === ${JSON.stringify(text)});
  if (!element || element.disabled) throw new Error('Control no disponible: ' + ${JSON.stringify(text)});
  element.scrollIntoView({ block: 'center' }); element.click();
})()`)
const fill = (selector, value) => evaluate(`(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  if (!element) throw new Error('Campo ausente: ' + ${JSON.stringify(selector)});
  const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)});
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
})()`)
const screenshot = async (name) => {
  const { data } = await cdp('Page.captureScreenshot', { format: 'png' })
  const output = path.join(tempRoot, `unimag-blocks-${name}.png`)
  await writeFile(output, Buffer.from(data, 'base64'))
  console.log(`Captura: ${output}`)
}

try {
  await new Promise((resolve) => backend.listen(0, '127.0.0.1', resolve))
  vite = await createServer({
    logLevel: 'error',
    server: {
      host: '127.0.0.1', port: 0,
      proxy: { '/api': { target: `http://127.0.0.1:${backend.address().port}`, rewrite: (url) => url.replace(/^\/api/, '') } },
    },
  })
  await vite.listen()
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`
  chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' })
  const { readFile } = await import('node:fs/promises')
  let port
  for (let index = 0; index < 100; index++) {
    try { port = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break } catch { await delay(100) }
  }
  assert.ok(port, 'Chrome no habilitó DevTools.')
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const command = commands.get(message.id)
      if (command) {
        commands.delete(message.id)
        if (message.error) command.reject(new Error(JSON.stringify(message.error)))
        else command.resolve(message.result)
      }
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails)
  })
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('ud-token', 'admin-test')" })

  for (const [name, width, height, mobile] of [['desktop', 1440, 1000, false], ['mobile', 390, 844, true]]) {
    reset()
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    await cdp('Page.navigate', { url: `${origin}/admin/bloqueos` })
    await waitFor("document.body.innerText.includes('2 bloqueo(s) encontrados')")
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${name}: desbordamiento horizontal`)
    await click('Cancelar bloqueo')
    await waitFor("!!document.querySelector('#block-cancellation-reason')")
    assert.equal(await evaluate("document.querySelector('button[type=submit][disabled]') !== null"), true)
    assert.ok(await evaluate("document.body.innerText.includes('Las reservas canceladas anteriormente no se reactivarán.')"))
    await fill('#block-cancellation-reason', `Motivo ${name}`)
    await screenshot(`${name}-confirmation`)
    // El foco debe permanecer dentro del diálogo al navegar con teclado.
    await evaluate("document.querySelector('#block-cancellation-reason').focus()")
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    assert.equal(await evaluate("!!document.activeElement.closest('[role=dialog]')"), true)
    await click('Confirmar cancelación')
    await waitFor("!!document.querySelector('input[aria-label=\"Código de reautenticación\"]')")
    await fill('input[aria-label="Código de reautenticación"]', '111111')
    await waitFor("document.body.innerText.includes('Código inválido')")
    await fill('input[aria-label="Código de reautenticación"]', '123456')
    await waitFor("document.body.innerText.includes('Respuesta interrumpida tras el registro')")
    assert.equal(await evaluate("document.querySelector('#block-cancellation-reason').value"), `Motivo ${name}`)
    assert.equal(await evaluate("document.querySelector('#block-cancellation-reason').readOnly"), true)
    await click('Confirmar cancelación')
    await waitFor("document.body.innerText.includes('Bloqueo cancelado.') && document.body.innerText.includes('Administrador que canceló (UUID)')")
    assert.equal(transitions, 1)
    assert.equal(blocks[1].status, 'ACTIVE')
    await waitFor("document.body.innerText.includes('22222222-2222-4222-8222-222222222222') && !document.querySelector('[aria-busy=true]')")
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true)
    assert.equal(await evaluate("document.activeElement.id === 'block-history-heading'"), true, 'El foco no volvió al historial')
    await evaluate("[...document.querySelectorAll('li')].find(node => node.textContent.includes('Administrador que canceló (UUID)')).scrollIntoView({ block: 'center' })")
    await screenshot(`${name}-history`)
    await evaluate("document.querySelector('[aria-label=\"Estado del bloqueo\"]').click()")
    await click('Cancelado', '[role=option]')
    await waitFor("document.body.innerText.includes('1 bloqueo(s) encontrados')")
    assert.equal(await evaluate("[...document.querySelectorAll('button')].some(node => node.textContent.trim() === 'Cancelar bloqueo')"), false)
    await evaluate("document.querySelector('[aria-label=\"Estado del bloqueo\"]').click()")
    await click('Todos', '[role=option]')
    await waitFor("document.body.innerText.includes('2 bloqueo(s) encontrados')")
    await click('Cancelar bloqueo')
    await fill('#block-cancellation-reason', 'La franja termina mientras confirmo')
    fault = 'ended'
    await click('Confirmar cancelación')
    await waitFor("document.body.innerText.includes('La franja terminó durante la confirmación')")
    assert.equal(await evaluate("[...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Confirmar cancelación').disabled"), true)
    await click('Volver')
    await waitFor("!document.querySelector('#block-cancellation-reason')")
    // Consulta autoritativa de ocupación tras volver al panel.
    await cdp('Page.navigate', { url: `${origin}/admin` })
    await waitFor("document.body.innerText.includes('Panel de ocupación') && document.body.innerText.includes('Horas bloqueadas')")
    for (let index = 0; index < 50 && !requests.some((request) => request.path === '/admin/occupancy'); index++) await delay(100)
    await waitFor("!document.querySelector('[aria-label=\"Cargando ocupación\"]')")
    assert.ok(requests.some((request) => request.path === '/admin/occupancy'))
    const before = requests.filter((request) => request.path === '/admin/occupancy').length
    for (const stream of streams) stream.write(`event: availability-changed\ndata: ${JSON.stringify({ spaceId })}\n\n`)
    for (let index = 0; index < 50 && requests.filter((request) => request.path === '/admin/occupancy').length <= before; index++) await delay(100)
    assert.ok(requests.filter((request) => request.path === '/admin/occupancy').length > before, 'Ocupación no se refrescó por SSE')
    await cdp('Page.navigate', { url: `${origin}/app/disponibilidad/${spaceId}` })
    await waitFor("document.body.innerText.includes('Otra restricción vigente')")
    console.log(`${name}: cancelación, OTP inválido/válido, reintento idempotente, historial, 409, teclado, SSE y disponibilidad efectiva OK`)
  }
  assert.deepEqual(exceptions, [], 'Excepciones JavaScript en el navegador')
  console.log('API controlada: no acredita conexión con Spring Boot ni aceptación completa de accesibilidad.')
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await cdp('Browser.close').catch(() => {})
    socket.close()
  }
  chrome?.kill()
  for (const stream of streams) stream.end()
  await vite?.close()
  backend.closeAllConnections()
  await new Promise((resolve) => backend.close(resolve))
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
