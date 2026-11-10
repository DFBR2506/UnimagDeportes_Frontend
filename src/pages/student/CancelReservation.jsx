import { useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3 } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import PageHeader from '@/components/app/PageHeader'
import { toast } from '@/components/smoothui/toast'
import { EASE } from '@/lib/anim'
import { formatDate, formatRange, todayISO } from '@/data/mock'
import { useApp } from '@/store'

export default function CancelReservation() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { reservations, cancelReservation, isLateCancel, spaceById, settings } = useApp()
  const [canceling, setCanceling] = useState(false)

  const res = reservations.find((r) => r.id === id)
  if (!res || res.estado !== 'confirmada') return <Navigate to="/app/mis-reservas" replace />

  const space = spaceById(res.spaceId)
  const late = isLateCancel(res)

  const confirm = () => {
    setCanceling(true)
    setTimeout(() => {
      const estado = cancelReservation(id)
      toast.success(
        estado === 'cancelada-tardia' ? 'Reserva cancelada (tardía)' : 'Reserva cancelada',
        {
          description:
            estado === 'cancelada-tardia'
              ? 'Las horas siguen contando en tu cuota semanal.'
              : 'Las horas volvieron a tu cuota semanal.',
        }
      )
      navigate('/app/mis-reservas', { replace: true })
    }, 1400)
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Cancelar reserva" subtitle="Revisa el efecto antes de confirmar." />

      <motion.section
        className="space-y-5 rounded-2xl border border-border bg-card p-7 shadow-xs"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-card-foreground">
            {space?.name} · {res.date === todayISO() ? 'Hoy' : formatDate(res.date)} ·{' '}
            {formatRange(res.startHour, res.hours)}
          </h2>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            {late
              ? `Faltan menos de ${settings.cancelacionTardiaMin} minutos para el inicio.`
              : `Faltan ${settings.cancelacionTardiaMin} minutos o más para el inicio.`}
          </p>
        </div>

        {late ? (
          <Alert title="Cancelación tardía" variant="warning">
            El espacio queda libre para otras personas, pero {res.hours === 1 ? '1 hora seguirá contando' : `${res.hours} horas seguirán contando`} en tu
            cuota semanal. (RN-22)
          </Alert>
        ) : (
          <Alert title="Cancelación a tiempo" variant="success">
            El espacio se libera y {res.hours === 1 ? '1 hora vuelve' : `${res.hours} horas vuelven`} a tu cuota semanal. (RN-21)
          </Alert>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <SmoothButton
            color="destructive"
            loading={canceling}
            onClick={confirm}
            size="lg"
            variant="solid"
          >
            Confirmar cancelación
          </SmoothButton>
          <SmoothButton
            onClick={() => navigate('/app/mis-reservas')}
            prefix={<ArrowLeft />}
            size="lg"
            variant="outline"
          >
            Volver
          </SmoothButton>
        </div>
      </motion.section>

      <motion.p
        className="text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        Recibirás una notificación por correo con el resultado de la cancelación. (RN-26)
      </motion.p>
    </div>
  )
}
