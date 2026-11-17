import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let api
let setToken
let onSessionProblem

beforeEach(async () => {
  vi.resetModules()
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() })
  vi.stubGlobal('fetch', vi.fn())
  ;({ api, setToken, onSessionProblem } = await import('./api'))
})

afterEach(() => vi.unstubAllGlobals())

describe('contrato de panoramas del backend', () => {
  it('descarga un binario autenticado sin incluir el token en la URL', async () => {
    const response = new Response(new Uint8Array([0xff, 0xd8, 0xff]), { headers: { 'Content-Type': 'image/jpeg' } })
    fetch.mockResolvedValue(response)
    setToken('real-session-token')
    const signal = new AbortController().signal

    const result = await api('/spaces/real-id/images/PANORAMA', { as: 'blob', signal })

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('image/jpeg')
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/spaces/real-id/images/PANORAMA', expect.objectContaining({
      headers: { Authorization: 'Bearer real-session-token' }, signal,
    }))
  })

  it('un 404 real no descarga fotos locales de respaldo', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({ code: 'IMAGE_NOT_AVAILABLE' }), { status: 404 }))
    setToken('real-session-token')

    await expect(api('/spaces/real-id/images/PANORAMA', { as: 'blob' })).rejects.toMatchObject({ status: 404 })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).not.toContain('/panoramas/')
  })

  it('conserva el manejo global de sesión al recibir 401', async () => {
    fetch.mockResolvedValue(new Response('{}', { status: 401 }))
    setToken('expired-token')
    const listener = vi.fn()
    const unsubscribe = onSessionProblem(listener)

    await expect(api('/spaces/real-id/images/PANORAMA', { as: 'blob' })).rejects.toMatchObject({ status: 401 })
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }))
    expect(fetch).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('no convierte la cancelación en un error de conexión', async () => {
    fetch.mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    setToken('real-token')
    await expect(api('/spaces/id/images/PANORAMA', { as: 'blob' })).rejects.toMatchObject({ name: 'AbortError' })
  })
})
