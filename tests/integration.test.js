import assert from 'node:assert/strict'
import test from 'node:test'
import { client, json } from './helpers.js'

test('la incompatibilidad se limita a las dos modalidades de fútbol y el horizonte es seis', async (t) => {
  const { load } = await client(t)
  const { hasIncompatibleDisciplines, DEFAULT_SETTINGS, nextDays } = await load('data/domain.js')
  assert.equal(hasIncompatibleDisciplines(['FOOTBALL_5', 'FOOTBALL_11']), true)
  for (const disciplines of [[], ['FOOTBALL_5'], ['FOOTBALL_11'], ['FOOTBALL_5', 'TENNIS'], ['BASKETBALL', 'VOLLEYBALL']]) {
    assert.equal(hasIncompatibleDisciplines(disciplines), false)
  }
  assert.equal(DEFAULT_SETTINGS.anticipacionMaxDias, 6)
  assert.equal(nextDays(DEFAULT_SETTINGS.anticipacionMaxDias).length, 7)
})

test('HTTP: URL, fechas, Bearer, JSON, creación y respuesta 204', async (t) => {
  const { load } = await client(t)
  const { api, setToken } = await load('lib/api.js')
  setToken('real-token')
  const body = { spaceId: 'uuid', startAt: '2026-11-18T14:00:00-05:00', slots: 1 }
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/reservations?date=2026-11-18')
    assert.equal(options.headers.Authorization, 'Bearer real-token')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), body)
    return json({ id: 'created', ...body }, 201)
  }
  assert.equal((await api('/reservations', { method: 'POST', body, query: { date: '2026-11-18', absent: null } })).id, 'created')
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await api('/auth/logout', { method: 'POST' }), null)
})

test('OTP público sin Bearer y multipart sin Content-Type manual', async (t) => {
  const { load } = await client(t)
  const { api, setToken } = await load('lib/api.js')
  setToken('real-token')
  globalThis.fetch = async (_, options) => {
    assert.equal(options.headers.Authorization, undefined)
    return json({ sent: true })
  }
  await api('/auth/code', { method: 'POST', auth: false, body: { email: 'test@unimagdalena.edu.co' } })
  const form = new FormData()
  form.set('image', new Blob(['binary']))
  globalThis.fetch = async (_, options) => {
    assert.equal(options.headers.Authorization, 'Bearer real-token')
    assert.equal(options.headers['Content-Type'], undefined)
    assert.equal(options.body, form)
    return new Response('image', { headers: { 'Content-Type': 'image/png' } })
  }
  assert.equal((await api('/image', { method: 'PUT', form, as: 'blob' })).type, 'image/png')
})

test('errores reales notifican la sesión sin activar demo ni ocultar detalles', async (t) => {
  const { load } = await client(t, 'true')
  const { api, setToken, onSessionProblem } = await load('lib/api.js')
  setToken('real-token')
  const problems = []
  t.after(onSessionProblem((error) => problems.push(error)))
  globalThis.fetch = async () => { throw new TypeError('offline') }
  await assert.rejects(api('/me'), { status: 0, code: 'NETWORK_ERROR' })
  assert.equal(problems.length, 0)
  globalThis.fetch = async () => json({ code: 'TOKEN_EXPIRED', message: 'Venció', details: { field: 'token' } }, 401)
  await assert.rejects(api('/me'), { status: 401, message: 'Venció', details: { field: 'token' } })
  globalThis.fetch = async () => json({ code: 'PROFILE_INCOMPLETE' }, 403)
  await assert.rejects(api('/spaces'), { code: 'PROFILE_INCOMPLETE' })
  assert.equal(problems.length, 2)
})

test('SSE usa Bearer, interpreta availability-changed y no reconecta tras abortar', async (t) => {
  const { load } = await client(t)
  const { openEventStream, setToken } = await load('lib/api.js')
  setToken('stream-token')
  let calls = 0
  let signal
  let finish
  const received = new Promise((resolve) => { finish = resolve })
  globalThis.fetch = async (url, options) => {
    calls++
    assert.equal(url, '/api/spaces/uuid/availability/stream')
    assert.equal(options.headers.Authorization, 'Bearer stream-token')
    signal = options.signal
    return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('event: availability-changed\r\ndata: {"spaceId":"uuid"}\r\n\r\n'))
        signal.addEventListener('abort', () => controller.close(), { once: true })
      },
    }))
  }
  const stop = openEventStream('/spaces/uuid/availability/stream', (name, data) => {
    assert.equal(name, 'availability-changed')
    assert.deepEqual(data, { spaceId: 'uuid' })
    stop()
    finish()
  })
  t.after(stop)
  await received
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(signal.aborted, true)
  assert.equal(calls, 1)
})

test('respuestas tardías de otra sesión no invalidan la actual', async (t) => {
  const { load } = await client(t)
  const { api, getToken, setToken, onSessionProblem, openEventStream } = await load('lib/api.js')
  const problems = []
  t.after(onSessionProblem((error) => problems.push(error)))
  for (const [status, code] of [[401, 'TOKEN_EXPIRED'], [403, 'PROFILE_INCOMPLETE']]) {
    let finish
    globalThis.fetch = () => new Promise((resolve) => { finish = resolve })
    setToken('old-session')
    const pending = api('/me')
    setToken('new-session')
    finish(json({ code }, status))
    await assert.rejects(pending, { status, code })
    assert.equal(getToken(), 'new-session')
  }
  let finishStream
  globalThis.fetch = () => new Promise((resolve) => { finishStream = resolve })
  setToken('old-stream-session')
  const stop = openEventStream('/spaces/uuid/availability/stream', () => {})
  t.after(stop)
  setToken('new-session')
  finishStream(json({ code: 'TOKEN_EXPIRED' }, 401))
  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(problems, [])
})
