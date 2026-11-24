import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCheck, QrCode } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import { EASE, springSlow } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { formatInstantTime, formatDate, formatRange, mapCheckinEligible, todayISO } from '@/data/domain'
import { useApp } from '@/store'

// RN-35: el motivo del fallo siempre es visible.
const FAILURE_TITLES = {
  CHECKIN_TOO_EARLY: 'Aún es temprano',
  CHECKIN_WINDOW_CLOSED: 'La ventana de check-in cerró',
  NO_ACTIVE_RESERVATION: 'No tienes una reserva activa aquí',
  RESERVATION_NOT_FOUND: 'La reserva no corresponde a este espacio',
  RESERVATION_CANCELLED: 'La reserva fue cancelada',
  FORBIDDEN: 'El espacio está en uso por otra persona',
  CHECKIN_SELECTION_REQUIRED: 'Elige cuál reserva confirmar',
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { spaceId } = useParams()
  const { spaceById, reservations, refreshReservations, settings } = useApp()
  const [eligible, setEligible] = useState(null) // reservas de GET /checkin/{spaceId}/reservations
  const [listError, setListError] = useState(null)
  const [listRetry, setListRetry] = useState(0)
  const [confirmingId, setConfirmingId] = useState(null)
  const [result, setResult] = useState(null) // respuesta 200 del POST por identificador
  const [failure, setFailure] = useState(null) // ApiError

  const loadEligible = useCallback(
    (signal) => api(`/checkin/${spaceId}/reservations`, { signal }),
    [spaceId]
  )

  useEffect(() => {
    const controller = new AbortController()
    setEligible(null)
    setListError(null)
    loadEligible(controller.signal)
      .then((list) => !controller.signal.aborted && setEligible(list.map(mapCheckinEligible)))
      .catch((err) => {
        if (!controller.signal.aborted && err?.name !== 'AbortError') setListError(err)
      })
    // /reservations/mine completa la vista: las elegibles solo incluyen CONFIRMED sin check-in.
    refreshReservations().catch(() => {})
    return () => controller.abort()
  }, [loadEligible, listRetry, refreshReservations])

  const today = todayISO()
  // Con check-in registrado la reserva deja de ser elegible: se muestra desde /reservations/mine.
  const inUse = reservations.find(
    (r) => r.spaceId === spaceId && r.date === today && r.estado === 'en-uso'
  )
  const confirmed = result ?? (inUse ? { status: 'IN_USE', checkedInAt: inUse.checkedInAt } : null)
  const spaceName = spaceById(spaceId)?.name ?? inUse?.spaceName ?? 'Espacio deportivo'

  // Próxima reserva propia de hoy en este espacio, para explicar por qué aún no es elegible.
  const pendingToday = reservations
    .filter((r) => r.spaceId === spaceId && r.date === today && r.estado === 'confirmada')
    .sort((a, b) => a.startHour - b.startHour)[0]

  const confirm = async (id) => {
    setConfirmingId(id)
    setFailure(null)
    try {
      // La identidad sale del token (RN-32) y la reserva se confirma por identificador (RN-33).
      const r = await api(`/checkin/${spaceId}/reservations/${id}`, { method: 'POST' })
      setResult(r)
      // La lista se consulta de nuevo: el servidor revalida el estado de cada reserva.
      setListRetry((retry) => retry + 1)
    } catch (err) {
      setFailure(err)
    } finally {
      setConfirmingId(null)
    }
  }

  const checkedInAt = confirmed?.checkedInAt
  const opensToday = pendingToday
    ? formatInstantTime(new Date(new Date(pendingToday.startAt).getTime() - settings.checkinAntesMin * 60_000).toISOString())
    : null
  // Tras confirmar la última elegible, la lista cede el protagonismo al resultado;
  // si la reconsulta falla, el error se muestra igualmente.
  const showList = !(confirmed && (eligible === null || eligible.length === 0) && !listError)

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
            <p className="text-muted-foreground">
              Elige entre tus reservas elegibles y confirma la asistencia de la que corresponda.
            </p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
            <QrCode className="size-6" />
          </span>
        </div>

        <div className="mt-7 space-y-5">
          <AnimatePresence mode="wait">
            {confirmed && (
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
                    {confirmed.status === 'COMPLETED' ? (
                      <>
                        Registro tardío: tu reserva quedó «Completada»
                        {checkedInAt ? ` a las ${formatInstantTime(checkedInAt)}` : ''}. No amplía el
                        horario reservado.
                      </>
                    ) : (
                      <>
                        Tu reserva pasó a «En uso»
                        {checkedInAt ? ` a las ${formatInstantTime(checkedInAt)}` : ''}. Disfruta el
                        espacio.
                      </>
                    )}
                  </p>
                </div>
                <SmoothButton onClick={() => navigate('/app/mis-reservas')} variant="outline">
                  Ir a Mis reservas
                </SmoothButton>
              </motion.div>
            )}
          </AnimatePresence>

          {failure && (
            <Alert
              title={FAILURE_TITLES[failure.code] ?? 'No se pudo registrar el check-in'}
              variant="warning"
            >
              {errorMessage(failure)}
              {failure?.details?.opensAt ? ` Abre a las ${formatInstantTime(failure.details.opensAt)}.` : ''}
            </Alert>
          )}

          {showList && (
            <section aria-label="Reservas elegibles para confirmar" className="space-y-3">
              <h3 className="text-sm font-semibold text-card-foreground">Reservas elegibles hoy</h3>
              {listError ? (
                <Alert title="No se pudieron consultar tus reservas" variant="warning">
                  {errorMessage(listError)} Vuelve a intentarlo.
                </Alert>
              ) : eligible == null ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : eligible.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {settings.checkinCierraAlFinal
                      ? `No hay reservas propias elegibles para confirmar en este momento. La ventana abre ${settings.checkinAntesMin} min antes del inicio y cierra al final de la reserva.`
                      : `No hay reservas propias elegibles para confirmar en este momento. La ventana abre ${settings.checkinAntesMin} min antes del inicio y cierra ${settings.checkinCierraMinDespues} min después del fin, inclusive.`}
                  </p>
                  {opensToday && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tu reserva de hoy abre para check-in a las {opensToday}.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                  {eligible.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-medium text-card-foreground">
                          {formatDate(item.date)} · {formatRange(item.startHour, item.hours)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ventana: {formatInstantTime(item.opensAt)} – {formatInstantTime(item.closesAt)}{' '}
                          (inclusive)
                        </p>
                      </div>
                      <SmoothButton
                        className="max-sm:w-full"
                        color="accent"
                        loading={confirmingId === item.id}
                        onClick={() => confirm(item.id)}
                        size="sm"
                        variant="candy"
                      >
                        Confirmar asistencia
                      </SmoothButton>
                    </li>
                  ))}
                </ul>
              )}
              {(listError || eligible?.length === 0) && (
                <SmoothButton
                  className="max-sm:w-full"
                  onClick={() => setListRetry((retry) => retry + 1)}
                  variant="outline"
                >
                  Volver a consultar
                </SmoothButton>
              )}
            </section>
          )}
        </div>

        <p className="mt-7 border-t border-border pt-5 text-xs text-muted-foreground">
          El QR identifica el espacio; tu sesión identifica a la persona. (RN-32)
        </p>
      </motion.section>
    </div>
  )
}
