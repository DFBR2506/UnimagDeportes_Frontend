import { useId } from 'react'
import { cn } from '@/lib/utils'

/** Tipo visual de cancha según sus disciplinas: ilustración de respaldo mientras carga la imagen real. */
export const courtKind = (space) => {
  const d = space?.disciplines ?? []
  if (d.includes('BASKETBALL') || d.includes('VOLLEYBALL')) return 'multiple'
  if (d.includes('TENNIS')) return 'tenis'
  if (d.includes('FOOTBALL_5')) return 'futbol5'
  if (d.includes('FOOTBALL_11')) return 'futbol11'
  return 'multiple'
}

export const COURT_PALETTE = {
  multiple: { surround: '#0b3a66', floor: '#1769ab', accent: '#03294f', sky: '#8cc4ea' },
  tenis: { surround: '#9c4a2c', floor: '#c4643f', accent: '#b2573a', sky: '#9fd0ee' },
  futbol5: { surround: '#2a3a48', floor: '#4f9a2a', accent: '#5aa832', sky: '#a6d4f0' },
  futbol11: { surround: '#b85c38', floor: '#4f9a2a', accent: '#5aa832', sky: '#a6d4f0' },
}

const LINE = { fill: 'none', stroke: '#fff', strokeWidth: 2.2, strokeOpacity: 0.92 }

function Multiple({ p }) {
  return (
    <>
      <rect fill={p.floor} height="170" rx="4" width="320" x="40" y="40" />
      {/* zonas pintadas */}
      <rect fill={p.accent} height="60" width="60" x="40" y="95" />
      <rect fill={p.accent} height="60" width="60" x="300" y="95" />
      <circle cx="200" cy="125" fill={p.accent} r="24" />
      <g {...LINE}>
        <rect height="170" width="320" x="40" y="40" />
        <line x1="200" x2="200" y1="40" y2="210" />
        <circle cx="200" cy="125" r="24" />
        <rect height="60" width="60" x="40" y="95" />
        <rect height="60" width="60" x="300" y="95" />
        <path d="M40 52 H70 A78 78 0 0 1 70 198 H40" />
        <path d="M360 52 H330 A78 78 0 0 0 330 198 H360" />
      </g>
      {/* líneas de voleibol */}
      <g fill="none" stroke="#65b82e" strokeOpacity="0.9" strokeWidth="2">
        <rect height="130" width="240" x="80" y="60" />
        <line x1="160" x2="160" y1="60" y2="190" />
        <line x1="240" x2="240" y1="60" y2="190" />
      </g>
      {/* aros */}
      <circle cx="52" cy="125" fill="none" r="5" stroke="#f08a3a" strokeWidth="2.5" />
      <circle cx="348" cy="125" fill="none" r="5" stroke="#f08a3a" strokeWidth="2.5" />
    </>
  )
}

function Tenis({ p }) {
  return (
    <>
      <rect fill={p.floor} height="150" rx="3" width="300" x="50" y="50" />
      <g {...LINE}>
        <rect height="130" width="260" x="70" y="60" />
        <line x1="70" x2="330" y1="76" y2="76" />
        <line x1="70" x2="330" y1="174" y2="174" />
        <line x1="130" x2="130" y1="76" y2="174" />
        <line x1="270" x2="270" y1="76" y2="174" />
        <line x1="130" x2="270" y1="125" y2="125" />
        <line x1="70" x2="78" y1="125" y2="125" />
        <line x1="322" x2="330" y1="125" y2="125" />
      </g>
      {/* red */}
      <line stroke="#fff" strokeDasharray="3 2" strokeWidth="3.5" x1="200" x2="200" y1="52" y2="198" />
      <circle cx="200" cy="52" fill="#03294f" r="3" />
      <circle cx="200" cy="198" fill="#03294f" r="3" />
    </>
  )
}

function Stripes({ x, y, w, h, n, color }) {
  const sw = w / n
  return Array.from({ length: n }, (_, i) =>
    i % 2 ? <rect key={i} fill={color} height={h} width={sw} x={x + i * sw} y={y} /> : null
  )
}

function Futbol5({ p }) {
  return (
    <>
      <rect fill={p.floor} height="170" rx="6" width="320" x="40" y="40" />
      <Stripes color={p.accent} h={170} n={10} w={320} x={40} y={40} />
      <g {...LINE}>
        <rect height="154" rx="4" width="304" x="48" y="48" />
        <line x1="200" x2="200" y1="48" y2="202" />
        <circle cx="200" cy="125" r="22" />
        <path d="M48 85 H80 A40 40 0 0 1 80 165 H48" />
        <path d="M352 85 H320 A40 40 0 0 0 320 165 H352" />
      </g>
      <rect fill="#fff" height="30" width="6" x="42" y="110" />
      <rect fill="#fff" height="30" width="6" x="352" y="110" />
      {/* malla perimetral */}
      <rect fill="none" height="190" rx="8" stroke="#9ba8b7" strokeDasharray="2 3" strokeWidth="2" width="340" x="30" y="30" />
    </>
  )
}

function Futbol11({ p }) {
  return (
    <>
      {/* pista atlética */}
      <rect fill="none" height="210" rx="100" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" width="390" x="5" y="20" />
      <rect fill="#2f7a1f" height="174" rx="80" width="350" x="25" y="38" />
      <rect fill={p.floor} height="140" width="270" x="65" y="55" />
      <Stripes color={p.accent} h={140} n={12} w={270} x={65} y={55} />
      <g {...LINE}>
        <rect height="140" width="270" x="65" y="55" />
        <line x1="200" x2="200" y1="55" y2="195" />
        <circle cx="200" cy="125" r="20" />
        <rect height="70" width="38" x="65" y="90" />
        <rect height="34" width="14" x="65" y="108" />
        <rect height="70" width="38" x="297" y="90" />
        <rect height="34" width="14" x="321" y="108" />
        <path d="M103 112 A16 16 0 0 1 103 138" />
        <path d="M297 112 A16 16 0 0 0 297 138" />
      </g>
    </>
  )
}

const DRAW = { multiple: Multiple, tenis: Tenis, futbol5: Futbol5, futbol11: Futbol11 }

/** Ilustración cenital de una cancha, con iluminación suave de reflectores. */
export default function CourtArt({ kind = 'multiple', className }) {
  const id = useId().replace(/:/g, '')
  const p = COURT_PALETTE[kind]
  const Draw = DRAW[kind]
  return (
    <svg
      aria-hidden="true"
      className={cn('block h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 400 250"
    >
      <defs>
        <radialGradient cx="50%" cy="45%" id={`light-${id}`} r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#021a33" stopOpacity="0.45" />
        </radialGradient>
        <pattern height="8" id={`grain-${id}`} patternUnits="userSpaceOnUse" width="8">
          <circle cx="2" cy="2" fill="#fff" opacity="0.05" r="0.8" />
          <circle cx="6" cy="5" fill="#000" opacity="0.06" r="0.8" />
        </pattern>
      </defs>
      <rect fill={p.surround} height="250" width="400" />
      <rect fill={`url(#grain-${id})`} height="250" width="400" />
      <Draw p={p} />
      {/* reflectores */}
      {[
        [12, 12],
        [388, 12],
        [12, 238],
        [388, 238],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} fill="#fff" opacity="0.85" r="3.5" />
      ))}
      <rect fill={`url(#light-${id})`} height="250" width="400" />
    </svg>
  )
}
