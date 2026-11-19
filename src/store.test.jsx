// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/data/domain'

const http = vi.hoisted(() => ({ token: 'session-a', listener: null, api: vi.fn() }))
vi.mock('@/lib/api', () => ({
  api: http.api,
  getToken: () => http.token,
  setToken: (token) => { http.token = token },
  onSessionProblem: (listener) => {
    http.listener = listener
    return () => { http.listener = null }
  },
}))
vi.mock('@/components/app/ReauthDialog', () => ({ default: () => null }))

import { AppProvider, useApp } from '@/store'

const user = { id: 'user-id', name: 'Persona', role: 'USER', needsName: false }
const rules = {
  reservation: { slotMinutes: 60, maxSlotsPerReservation: 2, maxAdvanceDays: 6 },
  quota: { weeklyHours: 4 }, cancellation: { lateThresholdMinutes: 60 },
  checkIn: {}, reminder: {}, sanctions: {},
}
const quota = { limitHours: 4, usedHours: 0, availableHours: 4, weekStart: '2026-11-16T00:00:00-05:00' }
const responses = {
  '/me': user, '/rules': rules, '/spaces': { spaces: [] },
  '/reservations/mine': { reservations: [] }, '/quota/me': quota,
}

beforeEach(() => {
  http.token = 'session-a'
  http.api.mockReset().mockImplementation(async (path) => {
    if (!(path in responses)) throw new Error(`Ruta inesperada: ${path}`)
    return responses[path]
  })
})
afterEach(cleanup)

it('conserva la sesión ante un fallo transitorio de /me y permite reintentar', async () => {
  const error = { status: 0, message: 'Sin conexión' }
  http.api.mockRejectedValueOnce(error)
  const { result } = renderHook(useApp, { wrapper: AppProvider })
  await waitFor(() => expect(result.current.sessionError).toBe(error))
  expect(result.current.token).toBe('session-a')
  expect(result.current.me).toBeNull()
  act(() => result.current.retrySession())
  await waitFor(() => expect(result.current.dataLoaded).toBe(true))
  expect(result.current.sessionError).toBeNull()
  expect(result.current.me).toEqual(user)
})

it('no presenta una carga parcial como éxito y permite repetirla', async () => {
  const error = { status: 503, message: 'Espacios no disponibles' }
  let offline = true
  http.api.mockImplementation(async (path) => {
    if (path === '/spaces' && offline) throw error
    return responses[path]
  })
  const { result } = renderHook(useApp, { wrapper: AppProvider })
  await waitFor(() => expect(result.current.dataError).toBe(error))
  expect(result.current.dataLoaded).toBe(false)
  expect(result.current.spacesLoaded).toBe(false)
  offline = false
  await act(() => result.current.refreshData())
  expect(result.current.dataError).toBeNull()
  expect(result.current.dataLoaded).toBe(true)
  expect(result.current.spacesLoaded).toBe(true)
})

it('descarta respuestas de datos anteriores al cambio de token', async () => {
  const { result } = renderHook(useApp, { wrapper: AppProvider })
  await waitFor(() => expect(result.current.dataLoaded).toBe(true))
  const pending = []
  http.api.mockImplementation((path) => new Promise((resolve) => pending.push({ path, resolve })))
  let refresh
  act(() => { refresh = result.current.refreshData() })
  http.token = 'session-b'
  const staleResponses = {
    '/spaces': { spaces: [{ id: 'old-space', name: 'Antiguo', disciplines: [] }] },
    '/rules': { ...rules, quota: { weeklyHours: 99 } },
    '/quota/me': { ...quota, availableHours: 99 },
    '/reservations/mine': { reservations: [{
      id: 'old-reservation', space: { id: 'old-space' }, status: 'CONFIRMED',
      startAt: '2026-11-18T14:00:00-05:00', endAt: '2026-11-18T15:00:00-05:00',
    }] },
  }
  await act(async () => {
    for (const { path, resolve } of pending) resolve(staleResponses[path])
    await refresh
  })
  expect(result.current.spaces).toEqual([])
  expect(result.current.reservations).toEqual([])
  expect(result.current.settings.cuotaSemanalHoras).toBe(4)
  expect(result.current.quota.left).toBe(4)
  expect(result.current.dataLoaded).toBe(false)
})

it('401 global limpia datos, reglas y errores de la sesión', async () => {
  const { result } = renderHook(useApp, { wrapper: AppProvider })
  await waitFor(() => expect(result.current.dataLoaded).toBe(true))
  act(() => http.listener({ status: 401 }))
  expect(http.token).toBeNull()
  expect(result.current.me).toBeNull()
  expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
  expect(result.current.dataLoaded).toBe(false)
  expect(result.current.dataError).toBeNull()
  expect(result.current.sessionError).toBeNull()
  expect(result.current.sessionNotice).toBe('expired')
})

it('no restaura /me después de desmontar el proveedor', async () => {
  let resolve
  http.api.mockImplementationOnce(() => new Promise((done) => { resolve = done }))
  const { unmount } = renderHook(useApp, { wrapper: AppProvider })
  unmount()
  await act(async () => resolve(user))
  expect(http.api).toHaveBeenCalledTimes(1)
})
