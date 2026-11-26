// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const stream = vi.hoisted(() => ({ open: vi.fn(), close: vi.fn(), name: null, connect: null }))
const session = vi.hoisted(() => ({ token: 'token-a' }))
vi.mock('@/lib/api', () => ({ openEventStream: stream.open }))
vi.mock('@/store', () => ({ useApp: () => session }))
import useAvailabilityRevision from '@/lib/useAvailabilityRevision'
import { notifyAvailabilityChanged } from '@/lib/availabilityEvents'

beforeEach(() => {
  session.token = 'token-a'
  stream.close.mockReset()
  stream.open.mockReset().mockImplementation((_path, onEvent, { onConnect }) => {
    stream.name = onEvent
    stream.connect = onConnect
    return stream.close
  })
})
afterEach(cleanup)

it('invalida por mutaciones locales, SSE y reconexión, pero no por otro espacio', () => {
  const { result } = renderHook(() => useAvailabilityRevision('space-a'))
  act(() => notifyAvailabilityChanged('space-b'))
  expect(result.current).toBe(0)
  act(() => notifyAvailabilityChanged('space-a'))
  expect(result.current).toBe(1)
  act(() => stream.name('availability-changed'))
  expect(result.current).toBe(2)
  act(() => stream.connect())
  expect(result.current).toBe(3)
  act(() => stream.connect())
  expect(result.current).toBe(4)
})

it('renueva el stream al rotar token y limpia las suscripciones al desmontar', () => {
  const { rerender, unmount } = renderHook(() => useAvailabilityRevision('space-a'))
  session.token = 'token-b'
  rerender()
  expect(stream.close).toHaveBeenCalledTimes(1)
  expect(stream.open).toHaveBeenCalledTimes(2)
  unmount()
  expect(stream.close).toHaveBeenCalledTimes(2)
})
