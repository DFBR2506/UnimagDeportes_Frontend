import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Dumbbell, X } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import Progress from '@/components/smoothui/progress'
import NumberField from '@/components/smoothui/number-field'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { ACTIVE_STATES, formatDate, formatRange, toInstant } from '@/data/domain'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

// Conflictos de disponibilidad: se vuelve al calendario actualizado (RN-10, RN-42).
const CONFLICT_CODES = ['SLOT_TAKEN', 'BLOCKED_SLOT', 'SPACE_IN_MAINTENANCE', 'OUTSIDE_BOOKING_WINDOW']

export default function ConfirmReservation() {
  const navigate = useNavigate()
  const { draft: liveDraft, setDraft, createReservation, quota, reservations, me, disciplineById } =
    useApp()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)
  // Instantánea al montar: al confirmar se limpia el draft global y esta página
  // sigue visible durante la transición de salida.
  const [draft] = useState(liveDraft)
  const [equipment, setEquipment] = useState(null) // disponibilidad de implementos (UC13)
  const [equipmentError, setEquipmentError] = useState(null)
  const [equipmentRetry, setEquipmentRetry] = useState(0)
  const [requested, setRequested] = useState({}) // equipmentId → cantidad

  // GET /equipment/availability: implementos con unidades libres en la ventana.
  useEffect(() => {
    if (!draft) return
    const controller = new AbortController()
    setEquipment(null)
    setEquipmentError(null)
    setRequested({})
    api('/equipment/availability', {
      query: {
        startAt: toInstant(draft.date, draft.startHour),
        endAt: toInstant(draft.date, draft.startHour + draft.hours),
        discipline: draft.disciplineId,
      },
      signal: controller.signal,
    })
      .then((res) => !controller.signal.aborted && setEquipment(res.items))
      .catch((err) => {
        if (!controller.signal.aborted && err?.name !== 'AbortError') setEquipmentError(err)
      })
    return () => controller.abort()
  }, [draft, equipmentRetry])

  if (!draft) return <Navigate to="/app/disponibilidad" replace />

  const discipline = disciplineById(draft.disciplineId)

  // RN-11: sin solapes con reservas propias, aunque sean en otros espacios.
  const overlaps = reservations.some(
    (r) =>
      r.date === draft.date &&
      ACTIVE_STATES.includes(r.estado) &&
      r.startHour < draft.startHour + draft.hours &&
      r.startHour + r.hours > draft.startHour
  )
  const quotaOk = !quota || quota.left >= draft.hours
  const suspended = Boolean(me?.suspendedUntil && new Date(me.suspendedUntil) > new Date())

  const validations = [
    { label: 'Correo institucional', ok: true },
    { label: 'Sin suspensión', ok: !suspended },
    { label: 'Sin solapamiento', ok: !overlaps },
    { label: 'Cuota suficiente', ok: quotaOk },
  ]
  const allOk = validations.every((v) => v.ok)

  const equipmentPayload = Object.entries(requested)
    .filter(([, qty]) => qty > 0)
    .map(([equipmentId, quantity]) => ({ equipmentId, quantity }))

  const confirm = async () => {
    setConfirming(true)
    setError(null)
    try {
      const res = await createReservation({ ...draft, equipment: equipmentPayload })
      setDraft(null)
      navigate(`/app/reserva-confirmada/${res.id}`, {
        replace: true,
        state: { reservation: res, discipline: draft.disciplineId },
      })
    } catch (err) {
      if (CONFLICT_CODES.includes(err.code)) {
        navigate('/app/conflicto', {
          state: { spaceId: draft.spaceId, code: err.code, message: err.message },
        })
        return
      }
      setError(err)
      setConfirming(false)
    }
  }

  const rows = [
    ['Disciplina', discipline?.name],
    ['Espacio', draft.spaceName],
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
        <div className="space-y-5 lg:col-span-2">
          <motion.section
            className="rounded-2xl border border-border bg-card p-7 shadow-xs"
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

          {/* UC13: implementos opcionales, según stock libre en la franja (RN-65) */}
          <motion.section
            className="rounded-2xl border border-border bg-card p-7 shadow-xs"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          >
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
              <Dumbbell className="size-5 text-accent-ink" />
              Implementos <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
            </h2>
            {equipmentError ? (
              <div className="mt-4 space-y-3">
                <Alert title="No se pudieron consultar los implementos" variant="warning">
                  {errorMessage(equipmentError)} Puedes reservar sin implementos.
                </Alert>
                <SmoothButton onClick={() => setEquipmentRetry((retry) => retry + 1)} variant="outline">
                  Reintentar
                </SmoothButton>
              </div>
            ) : equipment == null ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : equipment.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No hay implementos disponibles para esta franja.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {equipment.map((item) => (
                  <li key={item.equipmentId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-card-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.available} disponible{item.available === 1 ? '' : 's'} en esta franja
                      </p>
                    </div>
                    <NumberField
                      aria-label={`Cantidad de ${item.name}`}
                      className="w-36"
                      max={item.available}
                      min={0}
                      onValueChange={(v) =>
                        setRequested((prev) => ({ ...prev, [item.equipmentId]: Math.max(0, v ?? 0) }))
                      }
                      value={requested[item.equipmentId] ?? 0}
                    />
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        </div>

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
            {quota ? (
              <>
                <p className="mt-2 font-display text-2xl font-bold">{quota.used} h usadas</p>
                <div className="mt-3">
                  <Progress aria-label="Cuota semanal" max={quota.max} value={Math.min(quota.used, quota.max)} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{quota.left} h disponibles</p>
              </>
            ) : (
              <Skeleton className="mt-3 h-14 w-full" />
            )}
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
                <motion.li key={label} className="flex items-center gap-2.5 text-sm" {...staggerChild}>
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
            <p className="mt-4 text-xs text-muted-foreground">
              La disponibilidad final se confirma en el servidor al reservar.
            </p>
          </motion.section>
        </div>
      </div>

      {error && (
        <Alert title="No se pudo crear la reserva" variant="destructive">
          {errorMessage(error)}
        </Alert>
      )}
      {!quotaOk && (
        <Alert title="Sin cuota suficiente" variant="warning">
          Esta reserva necesita {draft.hours} h y solo te quedan {quota.left} h esta semana. La cuota se
          reinicia el lunes. (RN-18)
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
          onClick={() => navigate(`/app/disponibilidad/${draft.spaceId}`)}
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
