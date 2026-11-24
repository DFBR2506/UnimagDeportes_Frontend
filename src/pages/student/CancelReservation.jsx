import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3 } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import { toast } from '@/components/smoothui/toast'
import { EASE } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { formatDate, formatRange, todayISO } from '@/data/domain'
import { useApp } from '@/store'

export default function CancelReservation() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { reservations, refreshReservations, refreshQuota, settings } = useApp()
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [canceling, setCanceling] = useState(false)

  const res = reservations.find((r) => r.id === id)

  // GET /reservations/{id}/cancellation-preview: el servidor decide si es tardía (RN-21, RN-22).
  useEffect(() => {
    const controller = new AbortController()
    api(`/reservations/${id}/cancellation-preview`, { signal: controller.signal })
      .then(setPreview)
      .catch((err) => err?.name !== 'AbortError' && setError(err))
    // El enlace puede llegar desde el correo antes de cargar la lista.
    if (!res) refreshReservations().catch(() => {})
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const confirm = async () => {
    setCanceling(true)
    try {
      const result = await api(`/reservations/${id}/cancellation`, { method: 'POST' })
      const late = result.status === 'CANCELLED_LATE'
      toast.success(late ? 'Reserva cancelada (tardía)' : 'Reserva cancelada', {
        description: late
          ? `${result.hoursCounted} h siguen contando en tu cuota semanal.`
          : 'Las horas volvieron a tu cuota semanal.',
      })
      await Promise.allSettled([refreshReservations(), refreshQuota()])
      navigate('/app/mis-reservas', { replace: true })
    } catch (err) {
      toast.error('No se pudo cancelar', { description: errorMessage(err) })
      setCanceling(false)
    }
  }

  const back = (
    <SmoothButton
      onClick={() => navigate('/app/mis-reservas')}
      prefix={<ArrowLeft />}
      size="lg"
      variant="outline"
    >
      Volver
    </SmoothButton>
  )

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Cancelar reserva" subtitle="Revisa el efecto antes de confirmar." />

      <motion.section
        className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        {res && (
          <h2 className="font-display text-lg font-semibold sm:text-xl text-card-foreground">
            {res.spaceName} · {res.date === todayISO() ? 'Hoy' : formatDate(res.date)} ·{' '}
            {formatRange(res.startHour, res.hours)}
          </h2>
        )}

        {error ? (
          <>
            <Alert title="Esta reserva no se puede cancelar" variant="warning">
              {errorMessage(error)}
            </Alert>
            <div className="pt-1 max-sm:*:w-full">{back}</div>
          </>
        ) : !preview ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-64 max-w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4 shrink-0" />
              {preview.late
                ? `Faltan menos de ${settings.cancelacionTardiaMin} minutos para el inicio.`
                : `Faltan ${settings.cancelacionTardiaMin} minutos o más para el inicio.`}
            </p>
            <Alert
              title={preview.late ? 'Cancelación tardía' : 'Cancelación a tiempo'}
              variant={preview.late ? 'warning' : 'success'}
            >
              {preview.message}
            </Alert>
            <div className="flex flex-wrap gap-3 pt-1 max-sm:*:w-full">
              <SmoothButton
                color="destructive"
                loading={canceling}
                onClick={confirm}
                size="lg"
                variant="solid"
              >
                Confirmar cancelación
              </SmoothButton>
              {back}
            </div>
          </>
        )}
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
