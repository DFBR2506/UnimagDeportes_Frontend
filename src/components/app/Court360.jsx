import { useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { ChevronLeft, ChevronRight, Compass, Pause, Play, Rotate3d } from 'lucide-react'
import { COURT_PALETTE } from '@/components/app/CourtArt'
import { cn } from '@/lib/utils'

/*
 * Visor 360°: muestra la imagen PANORAMA del espacio (GET /spaces/{id}/images/PANORAMA).
 * Mientras carga, o si falla, usa un panorama equirectangular dibujado en SVG.
 * La cancha se proyecta desde un observador de pie en el centro (1,6 m),
 * así que sus bordes se curvan como en una foto 360 real.
 */

const W = 1600 // ancho del panorama (unidades del viewBox) = 360°
const H = 400 // alto = 180°
const HORIZON = H / 2
const EYE = 1.6

// medias dimensiones (m) de las líneas principales por tipo de cancha
const COURT_DIMS = {
  multiple: { outer: [14, 7.5], inner: [[9, 4.5]], circle: 1.8 },
  tenis: { outer: [11.9, 5.5], inner: [[6.4, 4.1]], circle: null },
  futbol5: { outer: [20, 12.5], inner: [[17, 3]], circle: 3 },
  futbol11: { outer: [52, 34], inner: [[36, 20]], circle: 9.15 },
}

const toY = (dist) => HORIZON + (Math.atan(EYE / dist) / (Math.PI / 2)) * (H - HORIZON)
const thetaAt = (x) => (x / W) * Math.PI * 2

/** Distancia horizontal al borde de un rectángulo centrado en el observador. */
const rectDist = ([a, b], t) => Math.min(a / Math.abs(Math.cos(t) || 1e-6), b / Math.abs(Math.sin(t) || 1e-6))

const rectCurve = (dims) => {
  const pts = []
  for (let x = 0; x <= W; x += 8) pts.push(`${x},${toY(rectDist(dims, thetaAt(x))).toFixed(1)}`)
  return pts
}

// silueta de la Sierra Nevada, periódica para que el panorama empalme sin costuras
const ridge = (seed, base, amp) => {
  const pts = []
  for (let x = 0; x <= W; x += 20) {
    const t = thetaAt(x)
    const y =
      base -
      amp * (0.55 * Math.sin(t * 2 + seed) + 0.3 * Math.sin(t * 5 + seed * 2) + 0.15 * Math.sin(t * 11 + seed * 3))
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return `M0,${HORIZON} L${pts.join(' L')} L${W},${HORIZON} Z`
}

function Palm({ x, s = 1 }) {
  return (
    <g transform={`translate(${x} ${HORIZON - 4}) scale(${s})`}>
      <path d="M0 0 C 2 -30 -3 -55 4 -80" fill="none" stroke="#3a2a1c" strokeWidth="4" />
      {[-60, -25, 15, 50, 85, 130].map((r) => (
        <path
          key={r}
          d="M4 -80 C 20 -88 34 -84 42 -72"
          fill="none"
          stroke="#2f6b1f"
          strokeLinecap="round"
          strokeWidth="5"
          transform={`rotate(${r} 4 -80)`}
        />
      ))}
    </g>
  )
}

function Floodlight({ x }) {
  return (
    <g>
      <rect fill="#5d768e" height="120" width="4" x={x - 2} y={HORIZON - 120} />
      <rect fill="#d5dbe2" height="10" rx="2" width="26" x={x - 13} y={HORIZON - 128} />
      <circle cx={x} cy={HORIZON - 123} fill="#fff8d6" opacity="0.25" r="28" />
    </g>
  )
}

function Panorama({ kind }) {
  const p = COURT_PALETTE[kind]
  const dims = COURT_DIMS[kind]
  const outer = rectCurve(dims.outer)
  const floorPoly = `0,${H} ${outer.join(' ')} ${W},${H}`
  const isField = kind === 'futbol5' || kind === 'futbol11'

  return (
    <svg
      aria-hidden="true"
      className="block h-full w-auto shrink-0"
      preserveAspectRatio="none"
      style={{ aspectRatio: `${W} / ${H}` }}
      viewBox={`0 0 ${W} ${H}`}
    >
      <defs>
        <clipPath id={`floor-${kind}`}>
          <polygon points={floorPoly} />
        </clipPath>
        <linearGradient id={`sky-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1769ab" />
          <stop offset="1" stopColor={p.sky} />
        </linearGradient>
        <linearGradient id={`shade-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#021a33" stopOpacity="0.25" />
          <stop offset="1" stopColor="#021a33" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect fill={`url(#sky-${kind})`} height={HORIZON} width={W} />
      <path d={ridge(1.3, 150, 38)} fill="#5d7f9c" opacity="0.75" />
      <path d={ridge(4.1, 172, 22)} fill="#3f5c79" />

      {[180, 520, 1010, 1380].map((x, i) => (
        <Palm key={x} s={0.8 + (i % 2) * 0.25} x={x} />
      ))}
      {[200, 600, 1000, 1400].map((x) => (
        <Floodlight key={x} x={x} />
      ))}

      {/* entorno inmediato: malla o graderías */}
      <rect fill={p.surround} height={H - HORIZON} width={W} y={HORIZON} />
      {kind === 'futbol11' ? (
        <g>
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} fill={r % 2 ? '#13365a' : '#234465'} height="7" width={W} y={HORIZON - 30 + r * 7} />
          ))}
        </g>
      ) : (
        <g stroke="#b7c2cd" strokeOpacity="0.55" strokeWidth="1">
          <line x1="0" x2={W} y1={HORIZON - 36} y2={HORIZON - 36} />
          {Array.from({ length: W / 16 }, (_, i) => (
            <line key={i} x1={i * 16} x2={i * 16 + 16} y1={HORIZON - 36} y2={HORIZON} />
          ))}
        </g>
      )}

      {/* piso de la cancha proyectado */}
      <polygon fill={p.floor} points={floorPoly} />
      {isField && (
        <g clipPath={`url(#floor-${kind})`}>
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} fill={p.accent} height={H - HORIZON} opacity="0.55" width={W / 32} x={(i * 2 * W) / 32} y={HORIZON} />
          ))}
        </g>
      )}
      <polyline fill="none" points={outer.join(' ')} stroke="#fff" strokeWidth="3" />
      {dims.inner.map((d) => (
        <polyline key={d.join('x')} fill="none" points={rectCurve(d).join(' ')} stroke="#fff" strokeOpacity="0.85" strokeWidth="2.5" />
      ))}
      {dims.circle && <line stroke="#fff" strokeWidth="2.5" x1="0" x2={W} y1={toY(dims.circle)} y2={toY(dims.circle)} />}
      {/* línea central / red: pasa bajo el observador → vertical a 90° y 270° */}
      {[W / 4, (3 * W) / 4].map((x) => (
        <line
          key={x}
          stroke="#fff"
          strokeDasharray={kind === 'tenis' ? '6 4' : undefined}
          strokeWidth={kind === 'tenis' ? 5 : 3}
          x1={x}
          x2={x}
          y1={toY(rectDist(dims.outer, thetaAt(x)))}
          y2={H}
        />
      ))}
      {kind === 'multiple' &&
        [0, W / 2, W].map((x) => (
          <g key={x}>
            <rect fill="#d5dbe2" height="44" width="34" x={x - 17} y={toY(14) - 70} />
            <circle cx={x} cy={toY(13) - 22} fill="none" r="7" stroke="#f08a3a" strokeWidth="3" />
          </g>
        ))}
      {isField &&
        [0, W / 2, W].map((x) => (
          <rect
            key={x}
            fill="none"
            height={kind === 'futbol11' ? 22 : 18}
            stroke="#fff"
            strokeWidth="3"
            width={kind === 'futbol11' ? 60 : 44}
            x={x - (kind === 'futbol11' ? 30 : 22)}
            y={toY(dims.outer[0]) - (kind === 'futbol11' ? 22 : 18)}
          />
        ))}
      <rect fill={`url(#shade-${kind})`} height="60" width={W} y={HORIZON} />

    </svg>
  )
}

const HEADINGS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

export default function Court360({ kind = 'multiple', name, imageUrl, className }) {
  const reduce = useReducedMotion()
  const boxRef = useRef(null)
  const deg = useMotionValue(0)
  const [auto, setAuto] = useState(!reduce)
  const [dragging, setDragging] = useState(false)
  const [heading, setHeading] = useState('N')
  const last = useRef(0)
  const [aspect, setAspect] = useState(W / H) // ancho/alto de una vuelta completa

  const x = useTransform(deg, (d) => `${-((((d % 360) + 360) % 360) / 360) * 50}%`)
  const needle = useTransform(deg, (d) => -d)

  useAnimationFrame((_, delta) => {
    if (auto && !dragging) deg.set(deg.get() + delta * 0.006)
    const h = HEADINGS[Math.round((((deg.get() % 360) + 360) % 360) / 45) % 8]
    if (h !== heading) setHeading(h)
  })

  const degPerPx = () => 360 / ((boxRef.current?.clientHeight ?? 400) * (imageUrl ? aspect : W / H))

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    last.current = e.clientX
    setDragging(true)
  }
  const onPointerMove = (e) => {
    if (!dragging) return
    deg.set(deg.get() - (e.clientX - last.current) * degPerPx())
    last.current = e.clientX
  }
  const stopDrag = () => setDragging(false)

  const nudge = (d) => deg.set(deg.get() + d)

  return (
    <div
      ref={boxRef}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-sidebar shadow-lg ring-1 ring-sidebar/20 select-none',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') nudge(-15)
        if (e.key === 'ArrowRight') nudge(15)
      }}
      onPointerCancel={stopDrag}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      role="img"
      aria-label={`Vista 360° de ${name ?? 'la cancha'}. Arrastra o usa las flechas para girar.`}
      tabIndex={0}
    >
      <motion.div className="absolute inset-y-0 left-0 flex h-full w-max" style={{ x }}>
        {imageUrl ? (
          [0, 1].map((i) => (
            <img
              key={i}
              alt=""
              className="block h-full w-auto max-w-none shrink-0"
              draggable={false}
              onLoad={(e) => setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight || W / H)}
              src={imageUrl}
            />
          ))
        ) : (
          <>
            <Panorama kind={kind} />
            <Panorama kind={kind} />
          </>
        )}
      </motion.div>

      {/* viñeta tipo lente */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(2_26_51/0.45))]" />

      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-full bg-sidebar/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
        <Rotate3d className="size-3.5 text-sidebar-primary" />
        {imageUrl ? 'Vista 360°' : 'Vista 360° · cargando'}
      </div>

      <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-sidebar/80 px-2.5 py-1.5 text-xs font-semibold text-white tabular-nums backdrop-blur">
        <motion.span className="flex" style={{ rotate: needle }}>
          <Compass className="size-3.5" />
        </motion.span>
        {heading}
      </div>

      <div
        className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {[
          { label: 'Girar a la izquierda', icon: ChevronLeft, onClick: () => nudge(-30) },
          { label: auto ? 'Pausar giro' : 'Reanudar giro', icon: auto ? Pause : Play, onClick: () => setAuto((a) => !a) },
          { label: 'Girar a la derecha', icon: ChevronRight, onClick: () => nudge(30) },
        ].map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            aria-label={label}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-sidebar/80 text-white backdrop-blur transition-colors hover:bg-sidebar focus-ring"
            onClick={onClick}
            type="button"
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>

      <p className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-[11px] text-white/90 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        Arrastra para mirar alrededor
      </p>
    </div>
  )
}
