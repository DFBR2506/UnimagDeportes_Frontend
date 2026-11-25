// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { openEventStream, setToken } from '@/lib/api'

afterEach(() => {
  setToken(null)
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('reintenta un SSE con HTTP 503 y avisa para resincronizar tras reconectar', async () => {
  vi.useFakeTimers()
  setToken('stream-token')
  const connect = vi.fn()
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Temporal' }), { status: 503 }))
    .mockImplementationOnce(async (_url, { signal }) => new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener('abort', () => controller.close(), { once: true })
      },
    })))
  vi.stubGlobal('fetch', fetch)
  const stop = openEventStream('/stream', vi.fn(), { onConnect: connect })
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(connect).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(5000)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(connect).toHaveBeenCalledTimes(1)
  } finally {
    stop()
    await vi.advanceTimersByTimeAsync(0)
  }
})

it('no notifica una conexión que terminó de abrir después de abortar', async () => {
  setToken('stream-token')
  let finish
  vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { finish = resolve })))
  const connect = vi.fn()
  const stop = openEventStream('/stream', vi.fn(), { onConnect: connect })
  stop()
  finish(new Response(': connected\n\n'))
  await Promise.resolve()
  await Promise.resolve()
  expect(connect).not.toHaveBeenCalled()
})
