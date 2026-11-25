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

test('demo: listado por solape, historial e idempotencia sin reactivar reservas ni cancelar la serie', async (t) => {
  const { load } = await client(t, 'true')
  const { api, setToken } = await load('lib/api.js')
  const { todayISO, addDays, toInstant, bogotaParts } = await load('data/domain.js')
  setToken('demo:admin')
  const space = (await api('/admin/spaces')).spaces[0]
  const day = addDays(todayISO(), 1)
  const weekday = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date(`${day}T12:00:00`).getDay()]
  const created = await api('/admin/blocks', { method: 'POST', body: {
    spaceId: space.id, type: 'CLASS', reason: 'Motivo original',
    startAt: toInstant(day, 8), endAt: toInstant(day, 10),
    recurrence: { daysOfWeek: [weekday], until: addDays(day, 7) },
  } })
  assert.equal(created.createdBlocks, 4)
  const query = { spaceId: space.id, from: toInstant(day, 0), to: toInstant(addDays(day, 8), 0) }
  const original = await api('/admin/blocks', { query })
  assert.equal(original.totalElements, 4)
  assert.ok(original.items.every((block) => block.recurrenceGroup === created.recurrenceGroup))
  assert.equal((await api('/admin/blocks', { query: { ...query, size: 1, page: 1 } })).items[0].id, original.items[1].id)
  const overlap = await api('/admin/blocks', { query: { ...query, from: toInstant(day, 8), to: toInstant(day, 9) } })
  assert.equal(overlap.totalElements, 1)
  const block = overlap.items[0]
  const path = `/admin/blocks/${block.id}/cancellation`
  const cancelled = await api(path, { method: 'POST', body: { reason: '  Cancelación original  ' } })
  assert.equal(cancelled.status, 'CANCELLED')
  assert.equal(cancelled.cancelledBy, 'demo-admin')
  assert.equal(cancelled.cancellationReason, 'Cancelación original')
  for (const key of ['id', 'spaceId', 'type', 'reason', 'startAt', 'endAt', 'recurrenceGroup']) {
    assert.equal(cancelled[key], block[key])
  }
  const repeated = await api(path, { method: 'POST', body: { reason: 'No debe reemplazar el primero' } })
  assert.deepEqual(repeated, cancelled)
  await assert.rejects(api(path, { method: 'POST', body: { reason: '  ' } }), { code: 'VALIDATION_ERROR' })
  const active = await api('/admin/blocks', { query: { ...query, status: 'ACTIVE' } })
  assert.equal(active.totalElements, 3)
  const history = await api('/admin/blocks', { query: { ...query, status: 'CANCELLED' } })
  assert.deepEqual(history.items, [cancelled])
  const occupancy = await api('/admin/occupancy', { query: { date: day, spaceId: space.id } })
  // La hora hermana sigue bloqueada; no se elimina el grupo recurrente.
  assert.equal(occupancy.spaces[0].slots.find((slot) => bogotaParts(slot.startAt).hour === 9).status, 'BLOCKED')
  for (const bad of [{}, { ...query, status: 'BAD' }, { ...query, page: -1 }, { ...query, size: 101 }, { ...query, to: query.from }]) {
    await assert.rejects(api('/admin/blocks', { query: bad }), { code: 'VALIDATION_ERROR' })
  }
  setToken('demo:student')
  await assert.rejects(api('/admin/blocks', { query }), { code: 'FORBIDDEN' })
  await assert.rejects(api(path, { method: 'POST', body: { reason: 'Motivo' } }), { code: 'FORBIDDEN' })
})

test('demo: cancelar conserva reservas canceladas y el mantenimiento del espacio', async (t) => {
  const { load } = await client(t, 'true')
  const { api, setToken } = await load('lib/api.js')
  const { todayISO, addDays, toInstant } = await load('data/domain.js')
  setToken('demo:admin')
  const spaces = (await api('/admin/spaces')).spaces
  const space = spaces[0]
  const today = todayISO()
  const body = { spaceId: space.id, type: 'EVENT', reason: 'Evento', startAt: toInstant(today, 14), endAt: toInstant(today, 15) }
  await api('/admin/blocks', { method: 'POST', body })
  setToken('demo:student')
  const reservations = await api('/reservations/mine')
  assert.equal(reservations.reservations.find((reservation) => reservation.id === 'res-seed-1').status, 'CANCELLED_BY_ADMIN')
  setToken('demo:admin')
  // Día futuro para que el caso sea independiente de la hora de ejecución.
  const day = addDays(today, 1)
  const maintenanceSpace = spaces.find((item) => item.status === 'MAINTENANCE')
  await api('/admin/blocks', { method: 'POST', body: { ...body, spaceId: maintenanceSpace.id, startAt: toInstant(day, 14), endAt: toInstant(day, 15) } })
  const query = { spaceId: maintenanceSpace.id, from: toInstant(day, 0), to: toInstant(addDays(day, 1), 0) }
  const block = (await api('/admin/blocks', { query })).items[0]
  await api(`/admin/blocks/${block.id}/cancellation`, { method: 'POST', body: { reason: 'Ya no se necesita' } })
  setToken('demo:student')
  assert.deepEqual(await api('/reservations/mine'), reservations)
  setToken('demo:admin')
  assert.equal((await api('/admin/spaces')).spaces.find((item) => item.id === maintenanceSpace.id).status, 'MAINTENANCE')
  await api('/admin/blocks', { method: 'POST', body: { ...body, startAt: toInstant('2000-01-01', 14), endAt: toInstant('2000-01-01', 15) } })
  const past = (await api('/admin/blocks', { query: { spaceId: space.id, from: toInstant('2000-01-01', 0), to: toInstant('2000-01-02', 0), status: 'ACTIVE' } })).items[0]
  await assert.rejects(api(`/admin/blocks/${past.id}/cancellation`, { method: 'POST', body: { reason: 'Tarde' } }), { code: 'BLOCK_NOT_CANCELLABLE' })
})
