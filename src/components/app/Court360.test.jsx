// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ instances: [], reduce: false, noWebgl: false, imageError: false }))
vi.mock('motion/react', () => ({ useReducedMotion: () => mocks.reduce }))
vi.mock('@/components/app/CourtArt', () => ({ default: () => <svg data-testid="court-art" /> }))
vi.mock('@/components/smoothui/spinner', () => ({ default: () => <span>Cargando panorama</span> }))
vi.mock('@/lib/panoramaViewer', () => ({
  createPanoramaViewer: vi.fn((callbacks) => {
    if (mocks.noWebgl) throw new Error('WebGL unsupported')
    let closed = false
    let enabled = false
    let position = { yaw: 0, pitch: 0 }
    const autorotate = {
      start: vi.fn(() => { enabled = true; callbacks.onAutoRotate(enabled) }),
      stop: vi.fn(() => { enabled = false; callbacks.onAutoRotate(enabled) }),
      toggle: vi.fn(() => { enabled = !enabled; callbacks.onAutoRotate(enabled) }),
    }
    const viewer = {
      callbacks,
      autorotate,
      destroy: vi.fn(() => { closed = true }),
      getPlugin: () => autorotate,
      getPosition: () => position,
      rotate: vi.fn((next) => { position = next; callbacks.onPositionChange(position) }),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
    }
    mocks.instances.push(viewer)
    queueMicrotask(() => {
      if (closed) return
      if (mocks.imageError) callbacks.onError('La imagen no se pudo mostrar en el visor.')
      else {
        callbacks.onReady()
        if (callbacks.autoRotate) autorotate.start()
      }
    })
    return { viewer, destroy: viewer.destroy }
  }),
}))

import Court360 from './Court360'
import { createPanoramaViewer } from '@/lib/panoramaViewer'

beforeEach(() => {
  mocks.instances.length = 0
  mocks.reduce = false
  mocks.noWebgl = false
  mocks.imageError = false
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null })
  Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: vi.fn().mockResolvedValue(undefined) })
})
afterEach(() => {
  cleanup()
  delete document.fullscreenElement
  delete document.exitFullscreen
})

describe('visor esférico', () => {
  it('muestra carga sin crear un visor antes de disponer de una imagen', () => {
    render(<Court360 name="Cancha" status="loading" />)
    expect(screen.getByText('Cargando panorama…')).toBeTruthy()
    expect(mocks.instances).toHaveLength(0)
  })

  it('explica el archivo ausente y permite reintentar sin simular un recorrido', () => {
    const retry = vi.fn()
    render(<Court360 status="unavailable" error={{ message: 'Añade multiple-1.png' }} onRetry={retry} />)
    expect(screen.getByText('Panorama no disponible')).toBeTruthy()
    expect(screen.getByText('Añade multiple-1.png')).toBeTruthy()
    expect(screen.getByText('Ilustración 2D de referencia')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }))
    expect(retry).toHaveBeenCalledOnce()
    expect(mocks.instances).toHaveLength(0)
  })

  it('conecta giros, teclado, zoom y pantalla completa a la instancia', async () => {
    render(<Court360 name="Cancha" imageUrl="blob:one" status="ready" />)
    await screen.findByRole('button', { name: 'Pausar giro' })
    const viewer = mocks.instances[0]
    expect(createPanoramaViewer).toHaveBeenCalledWith(expect.objectContaining({ panorama: 'blob:one', autoRotate: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Girar a la derecha' }))
    expect(viewer.rotate).toHaveBeenCalledWith({ yaw: Math.PI / 6, pitch: 0 })
    expect(screen.getByLabelText('Orientación relativa: 30 grados')).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowUp' })
    expect(viewer.rotate).toHaveBeenLastCalledWith({ yaw: Math.PI / 6, pitch: Math.PI / 12 })
    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Alejar' }))
    const region = screen.getByRole('region')
    region.requestFullscreen = vi.fn().mockResolvedValue(undefined)
    fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }))
    expect(viewer.zoomIn).toHaveBeenCalledWith(10)
    expect(viewer.zoomOut).toHaveBeenCalledWith(10)
    expect(region.requestFullscreen).toHaveBeenCalledOnce()
  })

  it('maneja una denegación de pantalla completa sin perder el visor', async () => {
    render(<Court360 imageUrl="blob:one" status="ready" />)
    await screen.findByRole('button', { name: 'Pausar giro' })
    screen.getByRole('region').requestFullscreen = vi.fn().mockRejectedValue(new Error('not granted'))
    fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }))
    await screen.findByText(/Este navegador no permitió abrir pantalla completa/)
    expect(screen.getByRole('button', { name: 'Pausar giro' })).toBeTruthy()
    expect(screen.getByRole('region').getAttribute('aria-busy')).toBe('false')
  })

  it('permite salir de pantalla completa desde el mismo control', async () => {
    render(<Court360 imageUrl="blob:one" status="ready" />)
    await screen.findByRole('button', { name: 'Pausar giro' })
    vi.spyOn(document, 'fullscreenElement', 'get').mockReturnValue(screen.getByRole('region'))
    fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }))
    expect(document.exitFullscreen).toHaveBeenCalledOnce()
  })

  it('respeta movimiento reducido sin impedir un giro manual solicitado', async () => {
    mocks.reduce = true
    render(<Court360 imageUrl="blob:one" status="ready" />)
    await screen.findByRole('button', { name: 'Reanudar giro' })
    expect(mocks.instances[0].autorotate.start).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar giro' }))
    expect(mocks.instances[0].autorotate.toggle).toHaveBeenCalledOnce()
  })

  it('destruye cada instancia al cambiar imagen y al desmontarse con StrictMode', async () => {
    const { rerender, unmount } = render(<Court360 imageUrl="blob:one" status="ready" />, { reactStrictMode: true })
    await screen.findByRole('button', { name: 'Pausar giro' })
    const first = mocks.instances[0]
    rerender(<Court360 imageUrl="blob:two" status="ready" />)
    await waitFor(() => expect(mocks.instances).toHaveLength(2))
    expect(first.destroy).toHaveBeenCalledOnce()
    unmount()
    expect(mocks.instances[1].destroy).toHaveBeenCalledOnce()
  })

  it('muestra una alternativa 2D cuando no hay WebGL, sin crear instancias incompletas', async () => {
    mocks.noWebgl = true
    render(<Court360 imageUrl="blob:one" status="ready" />)
    await screen.findByText('No se pudo mostrar el panorama')
    expect(screen.getByText(/Comprueba que tu navegador permita WebGL/)).toBeTruthy()
    expect(screen.getByTestId('court-art')).toBeTruthy()
    expect(mocks.instances).toHaveLength(0)
  })

  it('no deja la pantalla cargando si falla el renderizado de la imagen', async () => {
    mocks.imageError = true
    render(<Court360 imageUrl="blob:one" status="ready" />)
    await screen.findByText('No se pudo mostrar el panorama')
    expect(screen.getByRole('region').getAttribute('aria-busy')).toBe('false')
    expect(screen.getByRole('button', { name: 'Volver a intentar' })).toBeTruthy()
  })

  it('muestra alternativa 2D y permite reintentar tras un fallo de WebGL durante el uso', async () => {
    const retry = vi.fn()
    render(<Court360 imageUrl="blob:one" status="ready" onRetry={retry} />)
    await screen.findByRole('button', { name: 'Pausar giro' })
    const previous = mocks.instances[0]
    act(() => previous.callbacks.onError('Se perdió el contexto WebGL.'))
    expect(screen.getByText('Se perdió el contexto WebGL.')).toBeTruthy()
    expect(screen.getByTestId('court-art')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }))
    await screen.findByRole('button', { name: 'Pausar giro' })
    expect(retry).toHaveBeenCalledOnce()
    expect(previous.destroy).toHaveBeenCalledOnce()
    expect(mocks.instances).toHaveLength(2)
  })

  it('ignora los callbacks de un visor anterior después de cambiar de imagen', async () => {
    const { rerender } = render(<Court360 imageUrl="blob:one" status="ready" />)
    await screen.findByRole('button', { name: 'Pausar giro' })
    const previous = mocks.instances[0]
    rerender(<Court360 imageUrl="blob:two" status="ready" />)
    await screen.findByRole('button', { name: 'Pausar giro' })
    act(() => previous.callbacks.onError('Error de la carga antigua'))
    expect(screen.queryByText('Error de la carga antigua')).toBeNull()
    expect(screen.getByRole('button', { name: 'Pausar giro' })).toBeTruthy()
  })

  it('no mezcla los controles de dos visores montados', async () => {
    render(<><Court360 name="Uno" imageUrl="blob:one" status="ready" /><Court360 name="Dos" imageUrl="blob:two" status="ready" /></>)
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Pausar giro' })).toHaveLength(2))
    fireEvent.click(within(screen.getByRole('region', { name: 'Panorama de Uno' })).getByRole('button', { name: 'Girar a la izquierda' }))
    expect(mocks.instances[0].rotate).toHaveBeenCalledOnce()
    expect(mocks.instances[1].rotate).not.toHaveBeenCalled()
  })
})
