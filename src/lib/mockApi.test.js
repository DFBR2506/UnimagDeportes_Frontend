import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_PANORAMAS, DEMO_SPACE_IDS } from '@/data/demoSpaces'

let mockRequest
let storage

async function request(path, options, token = 'demo:student') {
  const pending = mockRequest(token, path, options)
  pending.catch(() => {})
  await vi.runAllTimersAsync()
  return pending
}

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  storage = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  })
  vi.stubGlobal('fetch', vi.fn())
  ;({ mockRequest } = await import('./mockApi'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('panoramas locales sin backend', () => {
  it('respeta la ruta base de Vite sin cambiar el manifiesto', async () => {
    vi.stubEnv('BASE_URL', '/deportes/')
    fetch.mockResolvedValue(new Response('image', { headers: { 'Content-Type': 'image/png' } }))
    await request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/PANORAMA`)
    expect(fetch).toHaveBeenCalledWith('/deportes/panoramas/multiple-1.png', expect.any(Object))
  })

  it.each(Object.entries(DEMO_PANORAMAS))('descarga el archivo correspondiente a %s', async (id, filename) => {
    fetch.mockResolvedValue(new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), { headers: { 'Content-Type': 'image/png' } }))
    const signal = new AbortController().signal

    const image = await request(`/spaces/${id}/images/PANORAMA`, { as: 'blob', signal })

    expect(image).toBeInstanceOf(Blob)
    expect(image.type).toBe('image/png')
    expect(fetch).toHaveBeenCalledExactlyOnceWith(`${import.meta.env.BASE_URL}panoramas/${filename}`, { signal, cache: 'no-cache' })
  })

  it.each(['jpg', 'jpeg', 'webp'])('encuentra un archivo .%s sin cambiar el manifiesto PNG', async (extension) => {
    const type = extension === 'webp' ? 'image/webp' : 'image/jpeg'
    fetch.mockImplementation(async (url) => url.endsWith(`multiple-1.${extension}`)
      ? new Response('image', { headers: { 'Content-Type': type } })
      : new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } }))
    const signal = new AbortController().signal

    const image = await request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/PANORAMA`, { as: 'blob', signal })

    expect(image.type).toBe(type)
    const extensions = ['png', 'jpg', 'jpeg', 'webp']
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(
      extensions.slice(0, extensions.indexOf(extension) + 1).map((ext) => `${import.meta.env.BASE_URL}panoramas/multiple-1.${ext}`)
    )
    expect(fetch.mock.calls.every(([, options]) => options.signal === signal)).toBe(true)
  })

  it.each([404, 200])('trata archivos ausentes y el HTML de respaldo (%s) como no disponibles', async (status) => {
    fetch.mockResolvedValue(new Response('<!doctype html>', { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
    await expect(request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/PANORAMA`)).rejects.toMatchObject({
      status: 404,
      code: 'IMAGE_NOT_AVAILABLE',
      message: expect.stringContaining(DEMO_PANORAMAS[DEMO_SPACE_IDS.multiple1]),
    })
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('no intenta cargar previews desde la carpeta de panoramas', async () => {
    await expect(request(`/spaces/${DEMO_SPACE_IDS.tennis1}/images/PREVIEW`)).rejects.toMatchObject({ status: 404 })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('no asigna un panorama de otra cancha a un espacio personalizado', async () => {
    await expect(request('/spaces/custom/images/PANORAMA')).rejects.toMatchObject({ status: 404 })
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each(['PANORAMA', 'PREVIEW'])('conserva la prioridad de la imagen %s subida por administrador', async (kind) => {
    const form = new FormData()
    form.append('image', new Blob(['uploaded'], { type: 'image/jpeg' }), 'uploaded.jpg')
    await request(`/admin/spaces/${DEMO_SPACE_IDS.multiple1}/images/${kind}`, { method: 'PUT', form }, 'demo:admin')

    const image = await request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/${kind}`, { as: 'blob' })
    expect(await image.text()).toBe('uploaded')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('no oculta un error de red como imagen inexistente', async () => {
    fetch.mockRejectedValue(new TypeError('offline'))
    await expect(request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/PANORAMA`)).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('no confunde un fallo HTTP del servidor con un archivo ausente', async () => {
    fetch.mockResolvedValue(new Response('<html>server error</html>', { status: 500, headers: { 'Content-Type': 'text/html' } }))
    await expect(request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/PANORAMA`)).rejects.toMatchObject({ status: 500, code: 'PANORAMA_LOAD_FAILED' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('deja de buscar otras extensiones cuando se cancela la descarga', async () => {
    const controller = new AbortController()
    fetch.mockImplementationOnce(async () => {
      controller.abort()
      return new Response('', { status: 404 })
    })
    await expect(request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/PANORAMA`, { signal: controller.signal }))
      .rejects.toMatchObject({ name: 'AbortError' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('cancela antes de descargar si se abandona el recorrido', async () => {
    const controller = new AbortController()
    const pending = request(`/spaces/${DEMO_SPACE_IDS.multiple1}/images/PANORAMA`, { signal: controller.signal })
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('canchas de los recorridos MVP', () => {
  it('ofrece las cuatro activas y ambas disciplinas de múltiple 2', async () => {
    const { spaces } = await request('/spaces')
    expect(spaces.map((space) => space.name).sort()).toEqual([
      'Cancha de tenis 1', 'Cancha fútbol 11', 'Cancha múltiple 1', 'Cancha múltiple 2',
    ])
    const { spaces: football } = await request('/spaces', { query: { discipline: 'FOOTBALL_5' } })
    expect(football.map((space) => space.id)).toEqual([DEMO_SPACE_IDS.multiple2])
    const { spaces: basketball } = await request('/spaces', { query: { discipline: 'BASKETBALL' } })
    expect(basketball.map((space) => space.id)).toEqual([DEMO_SPACE_IDS.multiple1, DEMO_SPACE_IDS.multiple2])
  })

  it('permite al administrador consultar fútbol 5 sin volverlo reservable', async () => {
    const { spaces } = await request('/admin/spaces', {}, 'demo:admin')
    expect(spaces).toHaveLength(5)
    expect(spaces.find((space) => space.id === DEMO_SPACE_IDS.football5).status).toBe('MAINTENANCE')
  })

  it('persiste la migración de sesiones guardadas sin borrar el resto del estado', async () => {
    storage.set('ud-demo-state-v1', JSON.stringify({
      spaces: [{ id: DEMO_SPACE_IDS.multiple2, name: 'Cancha de tenis 2', capacity: 4, status: 'ACTIVE', disciplines: ['TENNIS'] }],
      reservations: [{ id: 'keep-reservation', spaceId: DEMO_SPACE_IDS.multiple2 }],
      blocks: [{ id: 'keep-block' }],
    }))
    const { spaces } = await request('/spaces')
    expect(spaces[0].name).toBe('Cancha múltiple 2')
    const saved = JSON.parse(storage.get('ud-demo-state-v1'))
    expect(saved.catalogVersion).toBe(2)
    expect(saved.reservations[0].id).toBe('keep-reservation')
    expect(saved.blocks[0].id).toBe('keep-block')
  })
})

describe('check-in por identificador (UC05)', () => {
  const SPACE = DEMO_SPACE_IDS.multiple1
  // Nota: el estado simulado se carga en memoria en la primera petición del test;
  // cada prueba define su semilla y su reloj al inicio (resetModules entre pruebas).
  const demoRes = (id, startHour, endHour, extra = {}) => ({
    id,
    spaceId: SPACE,
    startAt: `2026-11-24T${String(startHour).padStart(2, '0')}:00:00-05:00`,
    endAt: `2026-11-24T${String(endHour).padStart(2, '0')}:00:00-05:00`,
    status: 'CONFIRMED',
    createdAt: '2026-11-23T18:00:00-05:00',
    checkedInAt: null,
    equipment: [],
    userId: 'demo-student',
    ...extra,
  })
  const seedReservations = (reservations) => {
    storage.set('ud-demo-state-v1', JSON.stringify({
      catalogVersion: 2,
      spaces: [{ id: SPACE, name: 'Cancha múltiple 1', capacity: 20, status: 'ACTIVE', disciplines: ['BASKETBALL'], openingTime: '08:00', closingTime: '20:00' }],
      reservations,
      blocks: [],
      equipment: [],
      params: { weeklyHours: 4, noShows: 3 },
    }))
  }

  it('aplica el máximo diario fijo de 2 horas en la creación y lo declara en /rules', async () => {
    // random fijo: sleep determinista y sin el conflicto aleatorio del 12 % (RN-10).
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    seedReservations([demoRes('res-hoy', 8, 9)])
    vi.setSystemTime(new Date('2026-11-24T13:00:00-05:00'))

    const rules = await request('/rules')
    expect(rules.quota.dailyHours).toBe(2)
    expect(rules.checkIn).toEqual({ opensMinutesBefore: 10, closesAtReservationEnd: false, closesMinutesAfterEnd: 60 })

    // Busca una pareja de franjas libres y reservables que no cruce la reserva de las 8.
    const { slots } = await request(`/spaces/${SPACE}/availability`, { query: { date: '2026-11-24' } })
    const index = slots.findIndex(
      (slot, i) => slot.status === 'FREE' && slot.bookable && slots[i + 1]?.status === 'FREE'
    )
    expect(index).toBeGreaterThanOrEqual(0)
    const hour = String(index + 8).padStart(2, '0')

    const twoHours = request('/reservations', {
      method: 'POST',
      body: { spaceId: SPACE, startAt: `2026-11-24T${hour}:00:00-05:00`, slots: 2 },
    })
    await expect(twoHours).rejects.toMatchObject({
      status: 409,
      code: 'DAILY_QUOTA_EXCEEDED',
      details: { date: '2026-11-24', dailyLimitHours: 2, usedHours: 1, requestedHours: 2, availableHours: 1 },
    })

    const one = await request('/reservations', {
      method: 'POST',
      body: { spaceId: SPACE, startAt: `2026-11-24T${hour}:00:00-05:00`, slots: 1 },
    })
    expect(one.status).toBe('CONFIRMED')
  })
})
