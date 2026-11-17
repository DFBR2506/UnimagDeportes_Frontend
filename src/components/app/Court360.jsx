import { useEffect, useReducer, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, Compass, Maximize, Minus, Pause, Play, Plus, RefreshCw, Rotate3d } from 'lucide-react'
import CourtArt from '@/components/app/CourtArt'
import Spinner from '@/components/smoothui/spinner'
import { cn } from '@/lib/utils'

const CONTROLS = [
  { action: 'left', label: 'Girar a la izquierda', icon: ChevronLeft },
  { action: 'auto', label: 'Reanudar giro', icon: Play },
  { action: 'right', label: 'Girar a la derecha', icon: ChevronRight },
  { action: 'out', label: 'Alejar', icon: Minus },
  { action: 'in', label: 'Acercar', icon: Plus },
  { action: 'fullscreen', label: 'Pantalla completa', icon: Maximize },
]

export default function Court360({ kind = 'multiple', name, imageUrl, status = 'idle', error, onRetry, className }) {
  const reduce = useReducedMotion()
  const boxRef = useRef(null)
  const viewerRef = useRef(null)
  const [attempt, retryViewer] = useReducer((value) => value + 1, 0)
  const [view, setView] = useState({ url: null, status: 'loading', message: '' })
  const [auto, setAuto] = useState(false)
  const [heading, setHeading] = useState(0)
  const [notice, setNotice] = useState('')
  const ready = status === 'ready' && view.url === imageUrl && view.status === 'ready'
  const viewerFailed = status === 'ready' && view.url === imageUrl && view.status === 'error'
  const loading = status === 'loading' || (status === 'ready' && !ready && !viewerFailed)

  useEffect(() => {
    if (!imageUrl || status !== 'ready') return
    let active = true
    let session = null

    ;(async () => {
      try {
        const { createPanoramaViewer } = await import('@/lib/panoramaViewer')
        if (!active) return
        setView({ url: imageUrl, status: 'loading', message: '' })
        setAuto(false)
        setHeading(0)
        setNotice('')

        session = createPanoramaViewer({
          container: boxRef.current,
          panorama: imageUrl,
          autoRotate: !reduce,
          onReady: () => {
            if (active) setView({ url: imageUrl, status: 'ready', message: '' })
          },
          onAutoRotate: (enabled) => { if (active) setAuto(enabled) },
          onPositionChange: (position) => {
            if (active) setHeading(Math.round(((position.yaw * 180 / Math.PI) % 360 + 360) % 360) % 360)
          },
          onError: (message) => {
            if (!active) return
            viewerRef.current = null
            setView({ url: imageUrl, status: 'error', message })
          },
        })
        viewerRef.current = session.viewer
      } catch {
        if (active) setView({ url: imageUrl, status: 'error', message: 'No se pudo iniciar la vista 360°. Comprueba que tu navegador permita WebGL y vuelve a intentar.' })
      }
    })()

    return () => {
      active = false
      viewerRef.current = null
      session?.destroy()
    }
  }, [imageUrl, status, reduce, attempt])

  const rotate = (yaw = 0, pitch = 0) => {
    const viewer = viewerRef.current
    if (!ready || !viewer) return
    viewer.getPlugin('autorotate').stop()
    const position = viewer.getPosition()
    viewer.rotate({ yaw: position.yaw + yaw * Math.PI / 180, pitch: position.pitch + pitch * Math.PI / 180 })
  }

  const retry = () => {
    retryViewer()
    onRetry?.()
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === boxRef.current) await document.exitFullscreen()
      else await boxRef.current.requestFullscreen()
      setNotice('')
    } catch {
      setNotice('Este navegador no permitió abrir pantalla completa. Puedes seguir usando el visor aquí.')
    }
  }

  const handleControl = (action) => {
    const viewer = viewerRef.current
    if (!ready || !viewer) return
    if (action === 'left') rotate(-30)
    if (action === 'right') rotate(30)
    if (action === 'auto') viewer.getPlugin('autorotate').toggle()
    if (action === 'out') viewer.zoomOut(10)
    if (action === 'in') viewer.zoomIn(10)
    if (action === 'fullscreen') void toggleFullscreen()
  }

  return (
    <div
      ref={boxRef}
      aria-label={`Panorama de ${name ?? 'la cancha'}`}
      aria-busy={loading}
      className={cn(
        'relative isolate overflow-hidden rounded-2xl bg-sidebar shadow-lg ring-1 ring-sidebar/20 select-none focus-ring',
        className
      )}
      onKeyDown={(event) => {
        if (!ready) return
        const moves = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, 15], ArrowDown: [0, -15] }
        if (moves[event.key]) {
          event.preventDefault()
          rotate(...moves[event.key])
        }
      }}
      role="region"
      tabIndex={0}
    >
      {!ready && (
        <div className="pointer-events-none absolute inset-0">
          <CourtArt className="opacity-30" kind={kind} />
          <div className="absolute inset-0 bg-sidebar/65" />
        </div>
      )}

      <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-sidebar/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
        <Rotate3d className="size-3.5 text-sidebar-primary" />
        {ready ? 'Vista 360°' : 'Panorama 360°'}
      </div>

      {ready ? (
        <>
          <div
            aria-label={`Orientación relativa: ${heading} grados`}
            className="pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-sidebar/80 px-2.5 py-1.5 text-xs font-semibold text-white tabular-nums backdrop-blur"
            title="Orientación relativa; no indica el norte geográfico"
          >
            <Compass className="size-3.5" style={{ transform: `rotate(${-heading}deg)` }} />
            {heading}°
          </div>
          <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap justify-center gap-2">
            {CONTROLS.map(({ action, label, icon }) => {
              const controlLabel = action === 'auto' && auto ? 'Pausar giro' : label
              const Icon = action === 'auto' && auto ? Pause : icon
              return (
                <button
                  key={action}
                  aria-label={controlLabel}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-sidebar/85 text-white backdrop-blur transition-colors hover:bg-sidebar focus-ring"
                  onClick={() => handleControl(action)}
                  title={controlLabel}
                  type="button"
                >
                  <Icon className="size-4" />
                </button>
              )
            })}
          </div>
          <p className="pointer-events-none absolute bottom-16 inset-x-3 z-10 text-center text-[11px] text-white drop-shadow" role={notice ? 'status' : undefined}>
            {notice || 'Arrastra para mirar · En móvil, usa dos dedos'}
          </p>
        </>
      ) : (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 pt-12 pb-5 text-center text-white" role="status">
          {loading ? (
            <>
              <Spinner aria-label="Cargando panorama" />
              <p className="text-sm">{status === 'loading' ? 'Cargando panorama…' : 'Preparando vista 360°…'}</p>
            </>
          ) : (
            <>
              <p className="font-medium">{viewerFailed || status === 'error' ? 'No se pudo mostrar el panorama' : 'Panorama no disponible'}</p>
              <p className="max-w-sm text-xs leading-relaxed text-white/80">
                {(viewerFailed ? view.message : error?.message) || 'Todavía no hay una imagen panorámica para esta cancha.'}
              </p>
              <p className="text-[11px] text-white/65">Ilustración 2D de referencia</p>
              {(onRetry || viewerFailed) && (
                <button className="flex cursor-pointer items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-medium hover:bg-white/25 focus-ring" onClick={retry} type="button">
                  <RefreshCw className="size-3.5" /> Volver a intentar
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
