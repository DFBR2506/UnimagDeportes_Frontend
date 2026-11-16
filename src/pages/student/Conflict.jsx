import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import PageHeader from '@/components/app/PageHeader'
import { EASE, springSlow } from '@/lib/anim'

const TITLES = {
  SLOT_TAKEN: 'Gana quien confirma primero',
  BLOCKED_SLOT: 'La franja se bloqueó',
  SPACE_IN_MAINTENANCE: 'El espacio entró en mantenimiento',
  OUTSIDE_BOOKING_WINDOW: 'La franja ya no se puede reservar',
}

export default function Conflict() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const code = state?.code ?? 'SLOT_TAKEN'

  return (
    <div className="space-y-8">
      <PageHeader
        title="La franja ya no está disponible"
        subtitle="Actualiza el calendario y elige otra franja para continuar."
      />

      <motion.section
        className="flex flex-col items-start gap-4 rounded-2xl border border-warning/40 bg-warning/10 p-7 md:flex-row md:items-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <motion.span
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning-foreground"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...springSlow, delay: 0.5 }}
        >
          <TriangleAlert className="size-6" />
        </motion.span>
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {TITLES[code] ?? TITLES.SLOT_TAKEN}
          </h2>
          <p className="text-sm text-muted-foreground">
            {state?.message ??
              'El bloqueo de la franja es transaccional: nunca hay dos reservas en el mismo horario.'}
          </p>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
      >
        <SmoothButton
          color="accent"
          onClick={() =>
            navigate(state?.spaceId ? `/app/disponibilidad/${state.spaceId}` : '/app/disponibilidad')
          }
          prefix={<RefreshCw />}
          size="lg"
          variant="candy"
        >
          Volver al calendario actualizado
        </SmoothButton>
      </motion.div>
    </div>
  )
}
