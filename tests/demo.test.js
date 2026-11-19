import assert from 'node:assert/strict'
import test from 'node:test'
import { client } from './helpers.js'

test('demo activa: sesión e incompatibilidad sin mutaciones parciales', async (t) => {
  const { load, storage } = await client(t, 'true')
  const { api, setToken, openEventStream } = await load('lib/api.js')
  globalThis.fetch = () => { throw new Error('La demo no debe consultar la API') }
  setToken('demo:admin')
  assert.equal((await api('/me')).role, 'ADMIN')
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(api('/me', { signal: controller.signal }), { name: 'AbortError' })
  openEventStream('/stream', () => { throw new Error('Sin SSE en demo') })()
  const before = (await api('/admin/spaces')).spaces
  const saved = storage.get('ud-demo-state-v1')
  const input = {
    name: 'Incompatible', capacity: 22, openingTime: '06:00', closingTime: '22:00',
    disciplines: ['FOOTBALL_5', 'FOOTBALL_11'],
  }
  const form = new FormData()
  form.set('space', new Blob([JSON.stringify(input)], { type: 'application/json' }))
  form.set('preview', new Blob(['preview']))
  form.set('panorama', new Blob(['panorama']))
  const expected = { status: 400, code: 'VALIDATION_ERROR' }
  await assert.rejects(api('/admin/spaces', { method: 'POST', form }), expected)
  await assert.rejects(api(`/admin/spaces/${before[0].id}`, { method: 'PUT', body: input }), expected)
  assert.deepEqual((await api('/admin/spaces')).spaces, before)
  assert.equal(storage.get('ud-demo-state-v1'), saved)
  for (const disciplines of [
    ['FOOTBALL_5'], ['FOOTBALL_11'], ['BASKETBALL', 'VOLLEYBALL'], ['FOOTBALL_5', 'TENNIS'],
  ]) {
    const updated = await api(`/admin/spaces/${before[0].id}`, { method: 'PUT', body: { disciplines } })
    assert.deepEqual(updated.disciplines, disciplines)
  }
})

test('demo desactivada: elimina únicamente el token y rechaza restaurarlo', async (t) => {
  const { load, storage } = await client(t, 'false', {
    'ud-token': 'demo:student', 'ud-demo-state-v1': 'preservar', other: 'conservar',
  })
  const { getToken, setToken } = await load('lib/api.js')
  assert.equal(getToken(), null)
  assert.equal(storage.has('ud-token'), false)
  assert.equal(storage.get('ud-demo-state-v1'), 'preservar')
  assert.equal(storage.get('other'), 'conservar')
  assert.throws(() => setToken('demo:admin'), { status: 403, code: 'DEMO_DISABLED' })
  assert.equal(getToken(), null)
})
