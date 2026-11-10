import { motion } from 'motion/react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Check, FileText } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Badge from '@/components/smoothui/badge'
import PageHeader from '@/components/app/PageHeader'
import { EASE, springSlow, staggerChild, staggerParent } from '@/lib/anim'
import { formatDate, formatRange } from '@/data/mock'
import { useApp } from '@/store'

export default function ReservationConfirmed() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { reservations, session, spaceById, disciplineById } = useApp()

  const res = reservations.find((r) => r.id === id)
  if (!res) return <Navigate to="/app/mis-reservas" replace />

  const space = spaceById(res.spaceId)
  const discipline = disciplineById(res.disciplineId)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reserva confirmada"
        subtitle="Tu espacio quedó reservado de inmediato."
      />

      <motion.section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
      >
        <div className="h-1.5 bg-gradient-to-r from-accent via-sidebar-primary to-destructive" />
        <motion.div className="space-y-5 p-7 md:p-9" {...staggerParent}>
          <motion.div className="flex items-center gap-3" {...staggerChild}>
            <motion.span
              className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springSlow, delay: 0.6 }}
            >
              <Check className="size-6" />
            </motion.span>
            <Badge variant="success">Confirmada</Badge>
          </motion.div>

          <motion.div className="space-y-1.5" {...staggerChild}>
            <h2 className="font-display text-3xl font-bold text-card-foreground">{space?.name}</h2>
            <p className="text-muted-foreground">
              {discipline?.name} · {formatDate(res.date)} · {formatRange(res.startHour, res.hours)}
            </p>
            <p className="font-medium text-card-foreground">{session.name}</p>
          </motion.div>

          <motion.div
            className="space-y-2 border-t border-border pt-5 text-sm text-muted-foreground"
            {...staggerChild}
          >
            <p className="flex items-center gap-2">
              <FileText className="size-4 shrink-0 text-accent" />
              Se enviará un comprobante PDF a tu correo institucional.
            </p>
            <p>La reserva es nominal y no transferible.</p>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
      >
        <SmoothButton
          color="accent"
          onClick={() => navigate('/app/mis-reservas')}
          size="lg"
          variant="candy"
        >
          Ir a Mis reservas
        </SmoothButton>
        <SmoothButton
          onClick={() => navigate('/app/disponibilidad')}
          prefix={<CalendarDays />}
          size="lg"
          variant="outline"
        >
          Volver a disponibilidad
        </SmoothButton>
      </motion.div>
    </div>
  )
}
