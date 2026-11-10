import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ExternalLink, Printer } from 'lucide-react'
import Select from '@/components/smoothui/select'
import Field, { FieldLabel } from '@/components/smoothui/field'
import SmoothButton from '@/components/smoothui/smooth-button'
import PageHeader from '@/components/app/PageHeader'
import { EASE } from '@/lib/anim'
import { useApp } from '@/store'

/** Patrón QR decorativo y determinista por espacio (el prototipo no codifica datos reales). */
const qrCells = (spaceId, size = 21) => {
  let h = 0
  for (let i = 0; i < spaceId.length; i++) h = (h * 31 + spaceId.charCodeAt(i)) >>> 0
  const cells = []
  const inFinder = (x, y) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
  let seed = h || 7
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0
    return seed / 2 ** 32
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inFinder(x, y)) continue
      if (rand() < 0.45) cells.push([x, y])
    }
  }
  return cells
}

const Finder = ({ x, y }) => (
  <g>
    <rect x={x} y={y} width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
    <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
  </g>
)

function QRPreview({ spaceId }) {
  const size = 21
  return (
    <motion.svg
      key={spaceId}
      aria-label={`Código QR del espacio ${spaceId}`}
      className="size-full text-foreground"
      role="img"
      viewBox="-1 -1 23 23"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {qrCells(spaceId, size).map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={size - 7} y={0} />
      <Finder x={0} y={size - 7} />
    </motion.svg>
  )
}

export default function AdminQR() {
  const { spaces } = useApp()
  const [spaceId, setSpaceId] = useState(spaces[0]?.id ?? '')
  const space = spaces.find((s) => s.id === spaceId)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Generar QR del espacio"
        subtitle="El QR contiene únicamente el enlace fijo del espacio."
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <motion.section
          className="rounded-2xl border border-border bg-card p-7 shadow-xs lg:col-span-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          <div className="max-w-xs">
            <Field>
              <FieldLabel>Espacio</FieldLabel>
              <Select
                aria-label="Espacio"
                onValueChange={setSpaceId}
                options={spaces.map((s) => ({ label: s.name, value: s.id }))}
                value={spaceId}
              />
            </Field>
          </div>

          <h2 className="mt-6 font-display text-2xl font-bold text-card-foreground">
            {space?.name}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            Enlace:{' '}
            <Link className="inline-flex items-center gap-1 font-medium text-accent hover:underline" to={`/checkin/${spaceId}`}>
              /checkin/{spaceId}
              <ExternalLink className="size-3.5" />
            </Link>
          </p>

          <div className="mt-6 w-fit rounded-2xl border border-border bg-background p-6 shadow-xs">
            <div className="size-52 md:size-60">
              <QRPreview spaceId={spaceId} />
            </div>
          </div>
        </motion.section>

        <motion.section
          className="h-fit rounded-2xl bg-sidebar p-7 text-sidebar-foreground shadow-lg lg:col-span-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
        >
          <h2 className="font-display text-lg font-semibold">Uso del QR</h2>
          <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/80">
            Identifica el espacio, no al usuario. La sesión vigente identifica a la persona que
            hace el check-in. Imprime el código y fíjalo en la entrada del espacio.
          </p>
          <SmoothButton
            className="mt-6"
            color="amber"
            onClick={() => window.print()}
            prefix={<Printer />}
            variant="solid"
          >
            Imprimir QR
          </SmoothButton>
        </motion.section>
      </div>
    </div>
  )
}
