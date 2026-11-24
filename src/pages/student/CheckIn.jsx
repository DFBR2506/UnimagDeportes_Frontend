import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCheck, QrCode } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import PageHeader from '@/components/app/PageHeader'
import { EASE, springSlow } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { ACTIVE_STATES, formatHour, formatInstantTime, formatRange, todayISO } from '@/data/domain'
import { useApp } from '@/store'

// RN-35: el motivo del fallo siempre es visible.
const FAILURE_TITLES = {
  CHECKIN_TOO_EARLY: 'Aún es temprano',
  CHECKIN_WINDOW_CLOSED: 'La ventana de check-in cerró',
  NO_ACTIVE_RESERVATION: 'No tienes una reserva activa aquí',
  RESERVATION_CANCELLED: 'La reserva fue cancelada',
  FORBIDDEN: 'El espacio está en uso por otra persona',
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { spaceId } = useParams()
  const { spaceById, reservations, refreshReservations, settings } = useApp()
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState(null) // respuesta 200 de POST /checkin/{spaceId}
  const [failure, setFailure] = useState(null) // ApiError

  useEffect(() => {
    refreshReservations().catch(() => {})
  }, [refreshReservations])

  const today = todayISO()
  const res = reservations
    .filter((r) => r.spaceId === spaceId && r.date === today && ACTIVE_STATES.includes(r.estado))
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0]
  const spaceName = spaceById(spaceId)?.name ?? res?.spaceName ?? 'Espacio deportivo'

  const confirm = async () => {
    setConfirming(true)
    setFailure(null)
    try {
      // La identidad sale del token, nunca del QR (RN-32).
      const r = await api(`/checkin/${spaceId}`, { method: 'POST' })
      setResult(r)
      refreshReservations().catch(() => {})
    } catch (err) {
      setFailure(err)
    } finally {
      setConfirming(false)
    }
  }

  const success = result || res?.estado === 'en-uso'
  const checkedInAt = result?.checkedInAt ?? res?.checkedInAt
  const opensAt = failure?.details?.opensAt

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Check-in del espacio"
        subtitle="Confirma tu asistencia desde el enlace fijo del QR."
      />

      <motion.section
        className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7 md:p-9"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <h2 className="font-display text-xl font-bold sm:text-2xl text-card-foreground">{spaceName}</h2>
            {res ? (
              <>
                <p className="text-muted-foreground">
                  Tu reserva: hoy · {formatRange(res.startHour, res.hours)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ventana de check-in: desde {settings.checkinAntesMin} min antes (
                  {formatHour(
                    Math.floor((res.startHour * 60 - settings.checkinAntesMin) / 60),
                    (res.startHour * 60 - settings.checkinAntesMin) % 60
                  )}
                  )
                  {settings.checkinCierraAlFinal ? ` hasta ${formatHour(res.startHour + res.hours)}` : ''}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No vemos una reserva tuya para hoy en este espacio; puedes intentarlo igualmente.
              </p>
            )}
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
            <QrCode className="size-6" />
          </span>
        </div>

        <div className="mt-7 space-y-5">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="ok"
                className="flex flex-col items-center gap-4 rounded-xl bg-success/10 px-4 py-8 text-center sm:px-6 sm:py-10"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <motion.span
                  className="flex size-16 items-center justify-center rounded-full bg-success text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...springSlow, delay: 0.3 }}
                >
                  <CheckCheck className="size-8" />
                </motion.span>
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Asistencia confirmada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tu reserva pasó a «En uso»
                    {checkedInAt ? ` a las ${formatInstantTime(checkedInAt)}` : ''}. Disfruta el espacio.
                  </p>
                </div>
                <SmoothButton onClick={() => navigate('/app/mis-reservas')} variant="outline">
                  Ir a Mis reservas
                </SmoothButton>
              </motion.div>
            ) : (
              <motion.div
                key="go"
                className="space-y-5"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                {failure && (
                  <Alert
                    title={FAILURE_TITLES[failure.code] ?? 'No se pudo registrar el check-in'}
                    variant="warning"
                  >
                    {errorMessage(failure)}
                    {opensAt ? ` Abre a las ${formatInstantTime(opensAt)}.` : ''}
                  </Alert>
                )}
                <SmoothButton
                  className="max-sm:w-full"
                  color="accent"
                  loading={confirming}
                  onClick={confirm}
                  size="lg"
                  variant="candy"
                >
                  {failure ? 'Intentar de nuevo' : 'Confirmar asistencia'}
                </SmoothButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-7 border-t border-border pt-5 text-xs text-muted-foreground">
          El QR identifica el espacio; tu sesión identifica a la persona. (RN-32)
        </p>
      </motion.section>
    </div>
  )
}
