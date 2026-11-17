// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ token: 'demo:student' }))
vi.mock('@/store', () => ({ useApp: () => session }))
vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/lib/validatePanorama', () => ({ normalizePanorama: vi.fn() }))

import { api } from '@/lib/api'
import { normalizePanorama } from '@/lib/validatePanorama'
import useSpacePanorama, { invalidateSpacePanorama } from './useSpacePanorama'

beforeEach(() => {
  session.token = 'demo:student'
  let sequence = 0
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => `blob:panorama-${++sequence}`),
    revokeObjectURL: vi.fn(),
  })
  api.mockReset().mockResolvedValue(new Blob(['validated-by-mock']))
  normalizePanorama.mockReset().mockImplementation(async (blob, { signal }) => {
    signal.throwIfAborted()
    return blob
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('ciclo de vida del panorama', () => {
  it('no carga imágenes sin cancha o sin sesión', () => {
    const { result, rerender } = renderHook(({ id }) => useSpacePanorama(id), { initialProps: { id: null } })
    expect(result.current.status).toBe('idle')
    session.token = null
    rerender({ id: 'court' })
    expect(result.current.status).toBe('idle')
    expect(api).not.toHaveBeenCalled()
  })

  it('descarga y normaliza antes de entregar una URL al visor', async () => {
    const { result } = renderHook(() => useSpacePanorama('court'))
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(api).toHaveBeenCalledWith('/spaces/court/images/PANORAMA', expect.objectContaining({ as: 'blob', signal: expect.any(AbortSignal) }))
    expect(normalizePanorama).toHaveBeenCalledOnce()
    expect(result.current.url).toBe('blob:panorama-1')
  })

  it('entrega al visor el binario adaptado, no el original de otra proporción', async () => {
    const normalized = new Blob(['normalized'], { type: 'image/png' })
    normalizePanorama.mockResolvedValueOnce(normalized)
    const { result } = renderHook(() => useSpacePanorama('court'))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(URL.createObjectURL).toHaveBeenCalledExactlyOnceWith(normalized)
  })

  it('distingue imagen ausente de error y permite reintentar', async () => {
    api.mockRejectedValueOnce({ status: 404, message: 'missing.jpg' })
    const { result } = renderHook(() => useSpacePanorama('court'))
    await waitFor(() => expect(result.current.status).toBe('unavailable'))
    expect(result.current.url).toBeNull()
    expect(normalizePanorama).not.toHaveBeenCalled()

    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
  })

  it('expone errores de formato sin entregar el archivo al visor', async () => {
    normalizePanorama.mockRejectedValueOnce(new Error('imagen dañada'))
    const { result } = renderHook(() => useSpacePanorama('court'))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error.message).toBe('imagen dañada')
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('no deja que una descarga antigua reemplace la cancha nueva', async () => {
    let finishOld
    api.mockImplementationOnce(() => new Promise((resolve) => { finishOld = resolve }))
    const { result, rerender } = renderHook(({ id }) => useSpacePanorama(id), { initialProps: { id: 'old' } })
    const oldSignal = api.mock.calls[0][1].signal
    rerender({ id: 'new' })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    const currentUrl = result.current.url

    await act(async () => finishOld(new Blob(['old'])))
    expect(oldSignal.aborted).toBe(true)
    expect(result.current.url).toBe(currentUrl)
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
  })

  it('libera la imagen anterior al cambiar de cancha y al desmontar', async () => {
    const { result, rerender, unmount } = renderHook(({ id }) => useSpacePanorama(id), { initialProps: { id: 'one' } })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    rerender({ id: 'two' })
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.url).toBe('blob:panorama-2'))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:panorama-1')
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:panorama-2')
    expect(api.mock.calls.every(([, options]) => options.signal.aborted)).toBe(true)
  })

  it('no reutiliza imágenes entre sesiones', async () => {
    const { result, rerender } = renderHook(() => useSpacePanorama('court'))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    session.token = 'real-token'
    rerender()
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.url).toBe('blob:panorama-2'))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:panorama-1')
  })

  it('actualiza solo el panorama invalidado al guardar otra imagen', async () => {
    const { result } = renderHook(() => useSpacePanorama('court'))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => invalidateSpacePanorama('other'))
    expect(api).toHaveBeenCalledTimes(1)
    act(() => invalidateSpacePanorama('court'))
    await waitFor(() => expect(result.current.url).toBe('blob:panorama-2'))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:panorama-1')
  })

  it('tolera el montaje doble de StrictMode sin dejar URLs o descargas vivas', async () => {
    const { result, unmount } = renderHook(() => useSpacePanorama('court'), {
      reactStrictMode: true,
    })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(api).toHaveBeenCalledTimes(2)
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce()
    expect(api.mock.calls.every(([, options]) => options.signal.aborted)).toBe(true)
  })
})
