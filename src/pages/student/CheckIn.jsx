import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCheck, QrCode } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import Empty from '@/components/smoothui/empty'
import PageHeader from '@/components/app/PageHeader'
import { EASE, springSlow } from '@/lib/anim'
import { formatHour, formatRange, todayISO } from '@/data/mock'
import { useApp } from '@/store'

const fmtMinutes = (hour, minutes) => {
  const base = formatHour(hour) // "2:00 p. m."
  return base.replace(':00', `:${String(minutes).padStart(2, '0')}`)
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { spaceId } = useParams()
  const { spaceById, reservations, checkInReservation, settings } = useApp()
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  const space = spaceById(spaceId)
  const today = todayISO()

  if (!space) {
    return (
      <div className="space-y-8">
        <PageHeader title="Check-in del espacio" subtitle="Espacio no encontrado." />
        <Empty title="QR no reconocido">Este enlace no corresponde a ningún espacio activo.</Empty>
      </div>
    )
  }

  const res = reservations.find(
    (r) => r.spaceId === spaceId && r.date === today && ['confirmada', 'en-uso'].includes(r.estado)
  )

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const windowStart = res ? res.startHour * 60 - 10 : null
  const windowEnd = res ? res.startHour * 60 + settings.toleranciaMin : null
  const inWindow = res && nowMin >= windowStart && nowMin <= windowEnd

  const confirm = () => {
    setConfirming(true)
    setTimeout(() => {
      checkInReservation(res.id)
      setDone(true)
    }, 1400)
  }

  // RN-35: motivo del fallo visible.
  let failure = null
  if (!res) {
    failure = 'No tienes una reserva activa en este espacio para hoy.'
  } else if (res.estado === 'confirmada' && !inWindow) {
    failure =
      nowMin < windowStart
        ? 'Es demasiado temprano: la ventana de check-in aún no abre.'
        : 'La ventana de check-in ya cerró. La reserva quedará como inasistencia.'
  }

  const success = done || res?.estado === 'en-uso'

  return (
    <div className="space-y-8">
      <PageHeader
        title="Check-in del espacio"
        subtitle="Confirma tu asistencia desde el enlace fijo del QR."
      />

      <motion.section
        className="rounded-2xl border border-border bg-card p-7 shadow-xs md:p-9"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-card-foreground">{space.name}</h2>
            {res ? (
              <>
                <p className="text-muted-foreground">
                  Reserva activa: hoy · {formatRange(res.startHour, res.hours)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ventana de check-in: {fmtMinutes(res.startHour - 1, 50)}–
                  {fmtMinutes(res.startHour, settings.toleranciaMin)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Enlace fijo: /checkin/{space.id}</p>
            )}
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <QrCode className="size-6" />
          </span>
        </div>

        <div className="mt-7">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="ok"
                className="flex flex-col items-center gap-4 rounded-xl bg-success/10 px-6 py-10 text-center"
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
                    Tu reserva pasó a estado «En uso». Disfruta el espacio.
                  </p>
                </div>
                <SmoothButton onClick={() => navigate('/app/mis-reservas')} variant="outline">
                  Ir a Mis reservas
                </SmoothButton>
              </motion.div>
            ) : failure ? (
              <motion.div
                key="fail"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <Alert title="No se pudo registrar el check-in" variant="warning">
                  {failure}
                </Alert>
              </motion.div>
            ) : (
              <motion.div
                key="go"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <SmoothButton
                  color="accent"
                  loading={confirming}
                  onClick={confirm}
                  size="lg"
                  variant="candy"
                >
                  Confirmar asistencia
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
