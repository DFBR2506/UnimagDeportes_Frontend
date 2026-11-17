// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ instances: [], pendingDecode: false, finishDecode: null, failConstructor: false, failImage: false }))

vi.mock('@photo-sphere-viewer/core', async (importOriginal) => {
  const actual = await importOriginal()
  actual.SYSTEM.maxTextureWidth = 4096
  actual.SYSTEM.load = vi.fn()

  return {
    ...actual,
    SYSTEM: actual.SYSTEM,
    Viewer: class {
      constructor(config) {
        // Usa los métodos reales de PSV; solo simula DOM/renderer/decodificación.
        const viewer = new EventTarget()
        Object.setPrototypeOf(viewer, actual.Viewer.prototype)
        const element = document.createElement('div')
        element.className = 'psv-container'
        element.appendChild(config.rendererParameters.canvas)
        config.container.appendChild(element)
        config.container[actual.CONSTANTS.VIEWER_DATA] = viewer

        const autorotate = new EventTarget()
        autorotate.start = vi.fn()
        autorotate.stop = vi.fn()
        autorotate.destroy = vi.fn()
        Object.assign(viewer, {
          config,
          state: { ready: false, animation: null, transitionAnimation: null },
          parent: config.container,
          container: element,
          plugins: { autorotate },
          children: [],
          overlay: { hide: vi.fn(), show: vi.fn() },
          navbar: { setCaption: vi.fn() },
          loader: { show: vi.fn(), hide: vi.fn() },
          dataHelper: { getTransitionOptions: () => null, cleanPanoramaOptions: () => ({}), destroy: vi.fn() },
          eventsHandler: { init: vi.fn(), destroy: vi.fn() },
          renderer: {
            show: vi.fn(), setTexture: vi.fn(), setPanoramaPose: vi.fn(), setSphereCorrection: vi.fn(),
            init: vi.fn(), destroy: vi.fn(),
          },
          textureLoader: {
            abortLoading: vi.fn(), destroy: vi.fn(),
            loadFile: vi.fn(async () => {
              if (mocks.failImage) throw new Error('decode failed')
              return new Blob(['<x:xmpmeta GPano:FullPanoWidthPixels="8192" GPano:FullPanoHeightPixels="4096" GPano:CroppedAreaImageWidthPixels="4096" GPano:CroppedAreaImageHeightPixels="2048"></x:xmpmeta>'])
            }),
            blobToImage: vi.fn(() => mocks.pendingDecode
              ? new Promise((resolve) => { mocks.finishDecode = () => resolve({ width: 4096, height: 2048 }) })
              : Promise.resolve({ width: 4096, height: 2048 })),
          },
        })
        viewer.adapter = new config.adapter(viewer)
        const setPanorama = actual.Viewer.prototype.setPanorama
        viewer.setPanorama = vi.fn((...args) => {
          viewer.loading = setPanorama.apply(viewer, args)
          return viewer.loading
        })
        viewer.destroy = vi.fn(actual.Viewer.prototype.destroy.bind(viewer))
        mocks.instances.push(viewer)

        if (mocks.failConstructor) {
          viewer.children.push({ destroy: vi.fn() })
          viewer.destroy.mockImplementation(() => { throw new Error('incomplete constructor') })
          throw new Error('renderer initialization failed')
        }
        return viewer
      }
    },
  }
})

import { EquirectangularAdapter, SYSTEM, CONSTANTS } from '@photo-sphere-viewer/core'
import { createPanoramaViewer } from './panoramaViewer'

let container
let contexts
let callbacks
let sessions

function openViewer(overrides = {}) {
  const session = createPanoramaViewer({ container, panorama: 'blob:panorama', autoRotate: true, ...callbacks, ...overrides })
  sessions.push(session)
  return session
}

beforeEach(() => {
  mocks.instances.length = 0
  mocks.pendingDecode = false
  mocks.finishDecode = null
  mocks.failConstructor = false
  mocks.failImage = false
  contexts = []
  sessions = []
  container = document.createElement('div')
  document.body.appendChild(container)
  callbacks = { onReady: vi.fn(), onError: vi.fn(), onPositionChange: vi.fn(), onAutoRotate: vi.fn() }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    const loseContext = vi.fn()
    const context = { getExtension: vi.fn(() => ({ loseContext })) }
    contexts.push({ context, loseContext })
    return context
  })
})

afterEach(() => {
  sessions.forEach((session) => session.destroy())
  container.remove()
})

describe('ciclo de vida con los métodos reales de Photo Sphere Viewer', () => {
  it('carga una esfera completa sin leer XMP y arranca el giro solo cuando está lista', async () => {
    const loadXmp = vi.spyOn(EquirectangularAdapter.prototype, 'loadXMP')
    const { viewer } = openViewer()
    await vi.waitFor(() => expect(viewer.loading).toBeDefined())
    await viewer.loading

    expect(loadXmp).not.toHaveBeenCalled()
    expect(viewer.renderer.setTexture.mock.calls[0][0].panoData).toMatchObject({
      fullWidth: 4096, fullHeight: 2048, croppedWidth: 4096, croppedHeight: 2048, croppedX: 0, croppedY: 0,
    })
    expect(callbacks.onReady).toHaveBeenCalledOnce()
    expect(viewer.getPlugin('autorotate').start).toHaveBeenCalledOnce()
    expect(viewer.config.mousewheelCtrlKey).toBe(true)
    expect(viewer.config.touchmoveTwoFingers).toBe(true)
    expect(viewer.parent).not.toBe(container)
    expect(viewer.parent.style.visibility).toBe('visible')
  })

  it('no inicia giro automático si se pidió movimiento reducido', async () => {
    const { viewer } = openViewer({ autoRotate: false })
    await vi.waitFor(() => expect(callbacks.onReady).toHaveBeenCalledOnce())
    expect(viewer.getPlugin('autorotate').start).not.toHaveBeenCalled()
  })

  it('cierra de forma idempotente una instancia lista y libera su contexto', async () => {
    const session = openViewer()
    await vi.waitFor(() => expect(callbacks.onReady).toHaveBeenCalledOnce())
    session.destroy()
    session.destroy()

    expect(session.viewer.destroy).toHaveBeenCalledOnce()
    expect(contexts[0].loseContext).toHaveBeenCalledOnce()
    expect(container.children).toHaveLength(0)
    expect(session.viewer.parent[CONSTANTS.VIEWER_DATA]).toBeUndefined()
  })

  it('descarta y libera una textura que termina de decodificarse tras cerrar el visor', async () => {
    mocks.pendingDecode = true
    const session = openViewer()
    await vi.waitFor(() => expect(mocks.finishDecode).toBeTypeOf('function'))
    const disposeTexture = vi.spyOn(session.viewer.adapter, 'disposeTexture')

    session.destroy()
    session.destroy()
    expect(container.children).toHaveLength(0)
    expect(session.viewer.textureLoader.abortLoading).toHaveBeenCalled()
    expect(session.viewer.destroy).not.toHaveBeenCalled()

    mocks.finishDecode()
    expect(await session.viewer.loading).toBe(false)
    await vi.waitFor(() => expect(session.viewer.destroy).toHaveBeenCalledOnce())
    expect(disposeTexture).toHaveBeenCalledOnce()
    expect(session.viewer.renderer.setTexture).not.toHaveBeenCalled()
    expect(session.viewer.renderer.init).not.toHaveBeenCalled()
    expect(session.viewer.eventsHandler.init).not.toHaveBeenCalled()
    expect(callbacks.onReady).not.toHaveBeenCalled()
    expect(callbacks.onError).not.toHaveBeenCalled()
    expect(contexts[0].loseContext).toHaveBeenCalledOnce()
  })

  it('termina de limpiar la instancia anterior sin tocar el contenedor de una nueva', async () => {
    mocks.pendingDecode = true
    const previous = openViewer()
    await vi.waitFor(() => expect(mocks.finishDecode).toBeTypeOf('function'))
    const finishPrevious = mocks.finishDecode
    previous.destroy()
    mocks.pendingDecode = false
    const current = openViewer({ panorama: 'blob:new' })
    await vi.waitFor(() => expect(current.viewer.state.ready).toBe(true))

    finishPrevious()
    await previous.viewer.loading
    expect(container.children).toHaveLength(1)
    expect(current.viewer.parent[CONSTANTS.VIEWER_DATA]).toBe(current.viewer)
    expect(current.viewer.destroy).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(previous.viewer.destroy).toHaveBeenCalledOnce())
  })

  it('no comienza la carga si se cierra inmediatamente tras construir la instancia', async () => {
    const session = openViewer()
    session.destroy()
    await Promise.resolve()
    expect(session.viewer.setPanorama).not.toHaveBeenCalled()
    expect(session.viewer.destroy).toHaveBeenCalledOnce()
    expect(container.children).toHaveLength(0)
  })

  it('limpia servicios, DOM, referencias y contexto aunque el constructor quede incompleto', () => {
    mocks.failConstructor = true
    expect(() => openViewer()).toThrow('renderer initialization failed')
    const partial = mocks.instances[0]
    expect(partial.eventsHandler.destroy).toHaveBeenCalledOnce()
    expect(partial.renderer.destroy).toHaveBeenCalledOnce()
    expect(partial.textureLoader.destroy).toHaveBeenCalledOnce()
    expect(partial.adapter.cancelled).toBe(true)
    expect(partial.children[0].destroy).toHaveBeenCalledOnce()
    expect(partial.getPlugin('autorotate').destroy).toHaveBeenCalledOnce()
    expect(partial.parent[CONSTANTS.VIEWER_DATA]).toBeUndefined()
    expect(container.children).toHaveLength(0)
    expect(contexts[0].loseContext).toHaveBeenCalledOnce()
  })

  it('falla sin construir PSV cuando no se puede obtener el contexto WebGL real', () => {
    HTMLCanvasElement.prototype.getContext.mockReturnValue(null)
    expect(() => openViewer()).toThrow(/WebGL/)
    expect(mocks.instances).toHaveLength(0)
    expect(container.children).toHaveLength(0)
  })

  it('limpia los recursos si falla la carga de imagen, sin dejar errores de promesas sin manejar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.failImage = true
    const session = openViewer()
    await vi.waitFor(() => expect(callbacks.onError).toHaveBeenCalledOnce())
    expect(session.viewer.destroy).toHaveBeenCalledOnce()
    expect(container.children).toHaveLength(0)
    expect(contexts[0].loseContext).toHaveBeenCalledOnce()
  })

  it('pasa a error y libera el visor cuando se pierde WebGL después de estar listo', async () => {
    const session = openViewer()
    await vi.waitFor(() => expect(callbacks.onReady).toHaveBeenCalledOnce())
    const canvas = session.viewer.config.rendererParameters.canvas
    const event = new Event('webglcontextlost', { cancelable: true })
    canvas.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(callbacks.onError).toHaveBeenCalledWith(expect.stringContaining('WebGL'))
    expect(session.viewer.destroy).toHaveBeenCalledOnce()
    expect(container.children).toHaveLength(0)

    canvas.dispatchEvent(new Event('webglcontextrestored'))
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    expect(callbacks.onReady).toHaveBeenCalledOnce()
    expect(callbacks.onError).toHaveBeenCalledOnce()
  })

  it('cancela también una pérdida de contexto durante la decodificación', async () => {
    mocks.pendingDecode = true
    const session = openViewer()
    await vi.waitFor(() => expect(mocks.finishDecode).toBeTypeOf('function'))
    session.viewer.config.rendererParameters.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    mocks.finishDecode()
    await session.viewer.loading

    expect(callbacks.onError).toHaveBeenCalledOnce()
    expect(callbacks.onReady).not.toHaveBeenCalled()
    expect(session.viewer.renderer.init).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(session.viewer.destroy).toHaveBeenCalledOnce())
  })

  it('permite crear un visor sano para reintentar tras la pérdida de WebGL', async () => {
    const previous = openViewer()
    await vi.waitFor(() => expect(callbacks.onReady).toHaveBeenCalledOnce())
    previous.viewer.config.rendererParameters.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    const current = openViewer()
    await vi.waitFor(() => expect(callbacks.onReady).toHaveBeenCalledTimes(2))
    expect(container.children).toHaveLength(1)
    expect(current.viewer.state.ready).toBe(true)
    expect(current.viewer.destroy).not.toHaveBeenCalled()
  })

  it('no añade DOM si falla el precheck de WebGL', () => {
    SYSTEM.load.mockImplementationOnce(() => { throw new Error('WebGL unsupported') })
    expect(() => openViewer()).toThrow('WebGL unsupported')
    expect(container.children).toHaveLength(0)
  })
})
