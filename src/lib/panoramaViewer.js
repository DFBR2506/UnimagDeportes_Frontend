import { Cache, CONSTANTS, SYSTEM, Viewer } from '@photo-sphere-viewer/core'
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin'
import '@photo-sphere-viewer/core/index.css'
import PanoramaAdapter from '@/lib/PanoramaAdapter'

function destroyViewer(viewer) {
  if (!viewer) return
  try {
    viewer.destroy()
    return
  } catch {
    // PSV puede fallar en el constructor y no aceptar destroy() sobre su estado parcial.
    // Aun así, cada servicio ya creado debe tener la oportunidad de liberar recursos.
    const resources = [
      ...Object.values(viewer.plugins ?? {}),
      ...(viewer.children ?? []).slice(),
      viewer.eventsHandler, viewer.renderer, viewer.textureLoader,
      viewer.dataHelper, viewer.adapter, viewer.dynamics,
    ]
    for (const resource of resources) {
      try { resource?.destroy() } catch { /* Un servicio incompleto no debe impedir limpiar los restantes. */ }
    }
  }
}

/** Una instancia posee su DOM, contexto y carga; no comparte recursos con otros visores. */
export function createPanoramaViewer({ container, panorama, autoRotate, onReady, onError, onPositionChange, onAutoRotate }) {
  SYSTEM.load()
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true })
  if (!context) throw new Error('No se pudo crear el contexto WebGL del panorama.')

  const host = document.createElement('div')
  host.className = 'absolute inset-0 h-full w-full'
  host.style.visibility = 'hidden'
  host.setAttribute('aria-hidden', 'true')
  container.appendChild(host)
  const listeners = new AbortController()
  let viewer = null
  let closed = false
  let finalized = false
  let loading = false

  const finalize = () => {
    if (finalized) return
    finalized = true
    try {
      destroyViewer(viewer ?? host[CONSTANTS.VIEWER_DATA])
    } finally {
      delete host[CONSTANTS.VIEWER_DATA]
      host.replaceChildren()
      host.remove()
      try { context.getExtension('WEBGL_lose_context')?.loseContext() } catch { /* El contexto puede haberse perdido previamente. */ }
    }
  }

  const destroy = () => {
    if (closed) return
    closed = true
    listeners.abort()
    host.remove()
    viewer?.adapter.cancel()
    viewer?.textureLoader.abortLoading()
    // destroy() de PSV no cancela todas las etapas de decodificación. Esperar su
    // finalización evita que una continuación use o reactive servicios ya destruidos.
    if (!loading) finalize()
  }

  const fail = (message) => {
    if (closed) return
    destroy()
    onError?.(message)
  }

  try {
    Cache.enabled = false
    viewer = new Viewer({
      container: host,
      adapter: PanoramaAdapter,
      rendererParameters: { canvas, context, alpha: true, antialias: true },
      navbar: false,
      keyboard: false,
      mousewheelCtrlKey: true,
      touchmoveTwoFingers: true,
      loadingTxt: 'Preparando vista 360°…',
      lang: {
        loading: 'Cargando…',
        loadError: 'No se pudo mostrar el panorama.',
        twoFingers: 'Usa dos dedos para mirar alrededor',
        ctrlZoom: 'Usa Ctrl + rueda para acercar o alejar',
      },
      plugins: [[AutorotatePlugin, {
        autostartDelay: null,
        autostartOnIdle: false,
        autorotateSpeed: '1rpm',
      }]],
    })

    const autorotate = viewer.getPlugin(AutorotatePlugin)
    const options = { signal: listeners.signal }
    autorotate.addEventListener('autorotate', (event) => onAutoRotate?.(event.autorotateEnabled), options)
    viewer.addEventListener('position-updated', (event) => onPositionChange?.(event.position), options)
    viewer.addEventListener('ready', () => {
      if (closed) return
      host.style.visibility = 'visible'
      onReady?.()
      if (autoRotate && !closed) autorotate.start()
    }, { ...options, once: true })
    viewer.addEventListener('panorama-error', () => fail('La imagen no se pudo mostrar en el visor. Vuelve a intentar.'), options)
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      fail('Se perdió el contexto WebGL. Vuelve a intentar para crear un visor nuevo.')
    }, options)

    Promise.resolve().then(() => {
      if (closed) return false
      loading = true
      return viewer.setPanorama(panorama)
    }).then(
      () => {
        loading = false
        if (closed) finalize()
      },
      (error) => {
        loading = false
        if (closed) finalize()
        else fail(error.name === 'AbortError'
          ? 'Se interrumpió la carga del panorama. Vuelve a intentar.'
          : 'La imagen no se pudo mostrar en el visor. Vuelve a intentar.')
      }
    )
    return { viewer, destroy }
  } catch (error) {
    destroy()
    throw error
  }
}
