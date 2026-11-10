import { useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import Progress from '@/components/smoothui/progress'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { formatDate, formatRange } from '@/data/mock'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

export default function ConfirmReservation() {
  const navigate = useNavigate()
  const { draft: liveDraft, setDraft, addReservation, quota, reservations, spaceById, disciplineById } =
    useApp()
  const [confirming, setConfirming] = useState(false)
  // Instantánea al montar: al confirmar se limpia el draft global y esta página
  // sigue visible durante la transición de salida.
  const [draft] = useState(liveDraft)

  if (!draft) return <Navigate to="/app/disponibilidad" replace />

  const space = spaceById(draft.spaceId)
  const discipline = disciplineById(draft.disciplineId)

  // RN-11: sin solapes con reservas propias, aunque sean en otros espacios.
  const overlaps = reservations.some(
    (r) =>
      r.date === draft.date &&
      ['confirmada', 'en-uso'].includes(r.estado) &&
      r.startHour < draft.startHour + draft.hours &&
      r.startHour + r.hours > draft.startHour
  )
  const quotaOk = quota.left >= draft.hours

  const validations = [
    { label: 'Correo válido', ok: true },
    { label: 'Sin suspensión', ok: true },
    { label: 'Franja disponible', ok: true },
    { label: 'Sin solapamiento', ok: !overlaps },
    { label: 'Cuota suficiente', ok: quotaOk },
  ]
  const allOk = validations.every((v) => v.ok)

  const confirm = () => {
    setConfirming(true)
    setTimeout(() => {
      // RN-10: si otra persona ganó la franja, se informa el conflicto.
      if (Math.random() < 0.12) {
        navigate('/app/conflicto')
        return
      }
      const res = addReservation(draft)
      setDraft(null)
      navigate(`/app/reserva-confirmada/${res.id}`, { replace: true })
    }, 1700)
  }

  const rows = [
    ['Disciplina', discipline?.name],
    ['Espacio', space?.name],
    ['Fecha', formatDate(draft.date)],
    ['Hora', formatRange(draft.startHour, draft.hours)],
    ['Duración', draft.hours === 1 ? '1 hora' : `${draft.hours} horas`],
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Confirma tu reserva"
        subtitle="La reserva queda a nombre de la persona autenticada y no es transferible."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.section
          className="rounded-2xl border border-border bg-card p-7 shadow-xs lg:col-span-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            Detalle de reserva
          </h2>
          <motion.dl className="mt-5 divide-y divide-border" {...staggerParent}>
            {rows.map(([label, value]) => (
              <motion.div
                key={label}
                className="flex items-center justify-between gap-4 py-3.5"
                {...staggerChild}
              >
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-medium text-card-foreground">{value}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.section>

        <div className="space-y-5">
          <motion.section
            className="rounded-2xl border border-border bg-card p-6 shadow-xs"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          >
            <h2 className="font-display text-base font-semibold text-card-foreground">
              Cuota semanal
            </h2>
            <p className="mt-2 font-display text-2xl font-bold">{quota.used} h usadas</p>
            <div className="mt-3">
              <Progress aria-label="Cuota semanal" max={quota.max} value={quota.used} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{quota.left} h disponibles</p>
          </motion.section>

          <motion.section
            className="rounded-2xl border border-border bg-card p-6 shadow-xs"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          >
            <h2 className="font-display text-base font-semibold text-card-foreground">
              Validaciones
            </h2>
            <motion.ul className="mt-4 space-y-2.5" {...staggerParent}>
              {validations.map(({ label, ok }) => (
                <motion.li
                  key={label}
                  className="flex items-center gap-2.5 text-sm"
                  {...staggerChild}
                >
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full',
                      ok ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                    )}
                  >
                    {ok ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  <span className={ok ? 'text-card-foreground' : 'text-destructive'}>{label}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.section>
        </div>
      </div>

      {!quotaOk && (
        <Alert title="Sin cuota suficiente" variant="warning">
          Esta reserva necesita {draft.hours} h y solo te quedan {quota.left} h esta semana. La
          cuota se reinicia el lunes. (RN-18)
        </Alert>
      )}
      {overlaps && (
        <Alert title="Se cruza con otra reserva tuya" variant="warning">
          Ya tienes una reserva que se solapa en ese horario, aunque sea en otro espacio. (RN-11)
        </Alert>
      )}

      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
      >
        <SmoothButton
          color="accent"
          disabled={!allOk}
          loading={confirming}
          onClick={confirm}
          size="lg"
          variant="candy"
        >
          Confirmar reserva
        </SmoothButton>
        <SmoothButton
          onClick={() => navigate('/app/disponibilidad')}
          prefix={<ArrowLeft />}
          size="lg"
          variant="outline"
        >
          Volver al calendario
        </SmoothButton>
      </motion.div>
    </div>
  )
}
