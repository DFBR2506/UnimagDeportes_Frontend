import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock, RefreshCw, Users } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import ToggleGroupRoot, { ToggleGroupItem } from '@/components/smoothui/toggle-group'
import Alert from '@/components/smoothui/alert'
import Spinner from '@/components/smoothui/spinner'
import { toast } from '@/components/smoothui/toast'
import SpacePanorama from '@/components/app/SpacePanorama'
import WeekCalendar from '@/components/app/WeekCalendar'
import { EASE } from '@/lib/anim'
import { errorMessage } from '@/lib/api'
import useAvailabilityRevision from '@/lib/useAvailabilityRevision'
import {
  addDays,
  bogotaParts,
  formatDate,
  formatHour,
  formatInstantTime,
  formatRange,
  todayISO,
} from '@/data/domain'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

const LEGEND = [
  { label: 'Libre', className: 'border border-border bg-card' },
  { label: 'Reservada', className: 'border-l-[3px] border-smooth-600 bg-smooth-200' },
  { label: 'Bloqueada', className: 'border-l-[3px] border-destructive bg-surface-danger' },
  { label: 'Tu reserva', className: 'border-l-[3px] border-accent bg-surface-success' },
  { label: 'Seleccionada', className: 'bg-accent' },
]

const monthLabel = (days) => {
  const fmt = (iso, opts) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', opts)
  const a = fmt(days[0], { month: 'long', year: 'numeric' })
  const b = fmt(days.at(-1), { month: 'long', year: 'numeric' })
  const text = a === b ? a : `${fmt(days[0], { month: 'short' })} – ${b}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function SelectionPanel({ className, selection, disciplineName, settings, blocked, onContinue, onClear }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5', className)}>
      <AnimatePresence initial={false} mode="wait">
        {selection ? (
          <motion.div
            key="sel"
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Franja seleccionada
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-card-foreground">
                {formatDate(selection.date)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatRange(selection.start, selection.hours)} · {selection.hours} h · {disciplineName}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SmoothButton
                className="flex-1 max-sm:px-3"
                color="accent"
                disabled={blocked}
                onClick={onContinue}
                suffix={<ArrowRight />}
                variant="candy"
              >
                <span>
                  Continuar<span className="max-sm:hidden"> con la reserva</span>
                </span>
              </SmoothButton>
              <SmoothButton onClick={onClear} variant="outline">
                Quitar
              </SmoothButton>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="md:hidden">Toca una franja libre; toca la siguiente para elegir hasta </span>
            <span className="max-md:hidden">
              Haz clic en una franja libre del calendario, o arrastra para elegir hasta{' '}
            </span>
            {settings.maxFranjas} franjas consecutivas. Tolerancia de {settings.toleranciaMin} min tras el
            inicio.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CourtSchedule() {
  const { spaceId } = useParams()
  const navigate = useNavigate()
  const { me, isAdmin, spaces, spacesLoaded, settings, setDraft, disciplineById, fetchAvailability } =
    useApp()
  const space = spaces.find((s) => s.id === spaceId)
  const availabilityRevision = useAvailabilityRevision(space?.id)

  const today = todayISO()
  const maxDate = addDays(today, settings.anticipacionMaxDias) // horizonte de 7 días (OQ-09)
  const lastWeek = Math.floor(settings.anticipacionMaxDias / 7)

  const [week, setWeek] = useState(0)
  const [selection, setSelection] = useState(null)
  const [discipline, setDiscipline] = useState(null)
  const [slotsByDate, setSlotsByDate] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [updatedAt, setUpdatedAt] = useState(null)

  const activeDiscipline = discipline ?? space?.disciplines[0]
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, week * 7 + i))
  const daysKey = days.filter((d) => d <= maxDate).join(',')

  // Disponibilidad de cada día visible (GET /spaces/{id}/availability).
  useEffect(() => {
    if (!space) return
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    Promise.all(
      daysKey.split(',').map((d) =>
        fetchAvailability(spaceId, d, activeDiscipline, controller.signal).then((slots) => [d, slots])
      )
    )
      .then((entries) => {
        if (controller.signal.aborted) return
        setSlotsByDate(Object.fromEntries(entries))
        setUpdatedAt(new Date())
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setLoadError(errorMessage(err))
        setLoading(false)
      })
    return () => controller.abort()
    // fetchAvailability depende de las reservas propias; se recarga con reloadKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space?.id, daysKey, activeDiscipline, reloadKey, availabilityRevision])

  // Si la franja elegida dejó de estar libre tras una actualización, se descarta.
  useEffect(() => {
    if (!selection) return
    const slots = slotsByDate[selection.date]
    if (!slots) return
    for (let h = selection.start; h < selection.start + selection.hours; h++) {
      const slot = slots.find((s) => s.hour === h)
      if (!slot || slot.estado !== 'libre' || !slot.bookable) {
        setSelection(null)
        toast('La franja que elegiste ya no está disponible', {
          description: 'Otra persona la reservó o se bloqueó. Elige otra.',
        })
        return
      }
    }
  }, [slotsByDate, selection])

  if (!spacesLoaded) {
    return (
      <div className="flex justify-center py-20">
        <Spinner aria-label="Cargando espacio" size="lg" />
      </div>
    )
  }
  if (!space) return <Navigate to="/app/disponibilidad" replace />

  const nowHour = bogotaParts().hour
  const isPast = (date, hour) => date < today || (date === today && hour < nowHour)

  const suspended = Boolean(me?.suspendedUntil && new Date(me.suspendedUntil) > new Date())
  // POST /reservations es exclusivo del rol USER.
  const cannotBook = suspended || isAdmin

  const continueToConfirm = (sel) => {
    setDraft({
      spaceId,
      spaceName: space.name,
      disciplineId: activeDiscipline,
      date: sel.date,
      startHour: sel.start,
      hours: sel.hours,
    })
    navigate('/app/reservar')
  }

  const panelProps = {
    selection,
    disciplineName: disciplineById(activeDiscipline)?.name,
    settings,
    blocked: cannotBook,
    onContinue: () => continueToConfirm(selection),
    onClear: () => setSelection(null),
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-wrap items-end justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="space-y-2">
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium pointer-coarse:min-h-10 text-muted-foreground transition-colors hover:text-foreground focus-ring"
            onClick={() => navigate('/app/disponibilidad')}
            type="button"
          >
            <ArrowLeft className="size-4" /> Todas las canchas
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {space.name}
          </h1>
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {formatHour(space.open)} – {formatHour(space.close)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> Aforo {space.aforo} personas
            </span>
            {space.requirements && <span>{space.requirements}</span>}
          </p>
        </div>

        {space.disciplines.length > 1 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Disciplina</p>
            <ToggleGroupRoot
              aria-label="Disciplina"
              onValueChange={(v) => v.length && setDiscipline(v[0])}
              value={[activeDiscipline]}
            >
              {space.disciplines.map((d) => (
                <ToggleGroupItem key={d} value={d}>
                  {disciplineById(d)?.name ?? d}
                </ToggleGroupItem>
              ))}
            </ToggleGroupRoot>
          </div>
        )}
      </motion.div>

      {suspended && (
        <Alert title="Cuenta suspendida" variant="destructive">
          Puedes consultar el calendario, pero no crear reservas hasta el{' '}
          {formatDate(bogotaParts(me.suspendedUntil).date)}. (RN-40)
        </Alert>
      )}
      {isAdmin && !suspended && (
        <Alert title="Vista de consulta" variant="info">
          Las reservas las crean los estudiantes; con el rol de administrador solo puedes consultar el
          calendario.
        </Alert>
      )}

      {/* pantalla dividida: calendario 60% · vista 360 40% */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <motion.section
          className="order-2 min-w-0 rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6 lg:order-1"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        >
          <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-3 sm:gap-3">
            <SmoothButton disabled={week === 0} onClick={() => setWeek(0)} size="sm" variant="outline">
              Hoy
            </SmoothButton>
            <div className="flex items-center">
              <SmoothButton
                aria-label="Semana anterior"
                disabled={week === 0}
                onClick={() => setWeek((w) => w - 1)}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronLeft />
              </SmoothButton>
              <SmoothButton
                aria-label="Semana siguiente"
                disabled={week >= lastWeek}
                onClick={() => setWeek((w) => w + 1)}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronRight />
              </SmoothButton>
            </div>
            <h2 className="font-display text-base font-semibold text-card-foreground sm:text-lg">{monthLabel(days)}</h2>
            <p className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              {loading ? (
                <Spinner aria-label="Actualizando" size="sm" />
              ) : (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  className="size-2 rounded-full bg-success"
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {updatedAt ? `En vivo · ${formatInstantTime(updatedAt)}` : 'Cargando…'}
            </p>
          </div>

          {loadError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">{loadError}</p>
              <SmoothButton
                onClick={() => setReloadKey((k) => k + 1)}
                prefix={<RefreshCw />}
                variant="outline"
              >
                Reintentar
              </SmoothButton>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={week}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <WeekCalendar
                  close={space.close}
                  days={days}
                  isPast={isPast}
                  loading={loading}
                  maxDate={maxDate}
                  maxHours={settings.maxFranjas}
                  onSelect={setSelection}
                  open={space.open}
                  readOnly={cannotBook}
                  selection={selection}
                  slotsForDay={(d) => slotsByDate[d] ?? []}
                />
              </motion.div>
            </AnimatePresence>
          )}

          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            {LEGEND.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('h-3 w-4 rounded-sm', l.className)} />
                {l.label}
              </li>
            ))}
          </ul>

          {/* en móvil, con una franja elegida, el panel queda pegado sobre la barra inferior para no perderlo de vista */}
          <SelectionPanel
            className={cn(
              'mt-4 lg:hidden',
              selection && 'sticky bottom-[calc(var(--bottom-bar-space)+0.5rem)] z-30 shadow-lg md:bottom-3'
            )}
            {...panelProps}
          />
        </motion.section>

        <motion.aside
          className="order-1 lg:order-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        >
          <div className="space-y-4 lg:sticky lg:top-24">
            <SpacePanorama
              className="aspect-[4/3] w-full lg:aspect-auto lg:h-[min(30rem,calc(100dvh-20rem))]"
              space={space}
            />
            <SelectionPanel className="hidden lg:block" {...panelProps} />
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
