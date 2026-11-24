import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Clock, MapPinned, RefreshCw, Users, Wrench } from 'lucide-react'
import Select from '@/components/smoothui/select'
import Field, { FieldLabel } from '@/components/smoothui/field'
import SmoothButton from '@/components/smoothui/smooth-button'
import ToggleGroupRoot, { ToggleGroupItem } from '@/components/smoothui/toggle-group'
import Empty from '@/components/smoothui/empty'
import Skeleton from '@/components/smoothui/skeleton'
import Spinner from '@/components/smoothui/spinner'
import PageHeader from '@/components/app/PageHeader'
import AnimatedNumber from '@/components/app/AnimatedNumber'
import WeekCalendar from '@/components/app/WeekCalendar'
import CourtArt, { courtKind } from '@/components/app/CourtArt'
import useAdminSpaces from '@/lib/useAdminSpaces'
import useSpaceImage from '@/lib/useSpaceImage'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { addDays, bogotaParts, formatHour, mapSlot, mondayOf, todayISO } from '@/data/domain'
import { cn } from '@/lib/utils'

// semanas consultables alrededor de la actual (/admin/occupancy acepta cualquier fecha)
const PAST_WEEKS = 8
const NEXT_WEEKS = 4

const LEGEND = [
  { label: 'Reserva', className: 'border-l-[3px] border-smooth-600 bg-smooth-200' },
  { label: 'Bloqueo institucional', className: 'border-l-[3px] border-destructive bg-surface-danger' },
  { label: 'Libre', className: 'border border-border bg-card' },
]

const PERIODS = [
  { value: 'WEEKLY', label: 'Semana' },
  { value: 'MONTHLY', label: 'Mes' },
]

const shortDate = (iso) =>
  new Date(`${iso}T12:00:00`)
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    .replace('.', '')
    .replace(' de ', ' ')

const weekLabel = (monday) => {
  const sunday = addDays(monday, 6)
  return `${shortDate(monday)} – ${shortDate(sunday)} ${sunday.slice(0, 4)}`
}

function SpaceThumb({ space }) {
  const image = useSpaceImage(space?.id, 'PREVIEW')
  if (!space) return null
  return image ? (
    <img alt="" className="h-full w-full object-cover" src={image} />
  ) : (
    <CourtArt kind={courtKind(space)} />
  )
}

/** UC09 — GET /admin/indicators?period=WEEKLY|MONTHLY */
function Indicators() {
  const [period, setPeriod] = useState('WEEKLY')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError(null)
    api('/admin/indicators', { query: { period }, signal: controller.signal })
      .then(setData)
      .catch((err) => err?.name !== 'AbortError' && setError(err))
    return () => controller.abort()
  }, [period])

  const kpis = data
    ? [
        { label: 'Reservas', value: data.reservations },
        { label: 'Cancelaciones tardías', value: data.lateCancellations },
        { label: 'Inasistencias', value: data.noShows },
        { label: 'Usuarios suspendidos', value: data.suspendedUsers },
      ]
    : []

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Indicadores{' '}
          {data && (
            <span className="text-sm font-normal text-muted-foreground">
              · {shortDate(bogotaParts(data.from).date)} – {shortDate(addDays(bogotaParts(data.to).date, -1))}
            </span>
          )}
        </h2>
        <ToggleGroupRoot
          aria-label="Período de los indicadores"
          onValueChange={(v) => v.length && setPeriod(v[0])}
          value={[period]}
        >
          {PERIODS.map((p) => (
            <ToggleGroupItem key={p.value} value={p.value}>
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroupRoot>
      </div>
      {error ? (
        <p className="text-sm text-destructive-ink">{errorMessage(error)}</p>
      ) : (
        <motion.div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" {...staggerParent}>
          {(data ? kpis : [0, 1, 2, 3]).map((k, i) =>
            data ? (
              <motion.div
                key={k.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5"
                {...staggerChild}
              >
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className="mt-2 font-display text-3xl font-bold sm:text-4xl text-foreground">
                  <AnimatedNumber value={k.value} />
                </p>
              </motion.div>
            ) : (
              <Skeleton key={i} className="h-[106px] rounded-2xl" />
            )
          )}
        </motion.div>
      )}
    </section>
  )
}

export default function AdminPanel() {
  const { spaces, loaded, error: spacesError, reload } = useAdminSpaces()
  const [spaceId, setSpaceId] = useState(null)
  const [week, setWeek] = useState(0)
  const [slotsByDate, setSlotsByDate] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const activeId = spaceId ?? spaces[0]?.id
  const space = spaces.find((s) => s.id === activeId)
  const today = todayISO()
  const thisMonday = mondayOf(today)
  const monday = addDays(thisMonday, week * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  // UC09 — GET /admin/occupancy por cada día de la semana (solo lectura, RF-14).
  useEffect(() => {
    if (!activeId) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    Promise.all(
      days.map((date) =>
        api('/admin/occupancy', { query: { date, spaceId: activeId }, signal: controller.signal }).then(
          (res) => [
            date,
            // el id de la reserva separa reservas consecutivas distintas en el calendario
            (res.spaces[0]?.slots ?? [])
              .map(mapSlot)
              .map((s) => (s.estado === 'ocupada' ? { ...s, motivo: s.reservationId } : s)),
          ]
        )
      )
    )
      .then((entries) => {
        setSlotsByDate(Object.fromEntries(entries))
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setError(err)
        setLoading(false)
      })
    return () => controller.abort()
    // `days` se deriva de `monday`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, monday, reloadKey])

  const describe = (run) =>
    run.estado === 'bloqueada'
      ? 'Bloqueo institucional'
      : run.end - run.start > 1
        ? `Reserva · ${run.end - run.start} h`
        : 'Reserva'

  // métricas de la semana y cancha seleccionadas
  const weekSlots = days.flatMap((d) => slotsByDate[d] ?? [])
  const reservedHours = weekSlots.filter((s) => s.estado === 'ocupada').length
  const blockedHours = weekSlots.filter((s) => s.estado === 'bloqueada').length
  const freeHours = weekSlots.filter((s) => s.estado === 'libre').length
  const occupancy = weekSlots.length
    ? Math.round(((reservedHours + blockedHours) / weekSlots.length) * 100)
    : 0

  const stats = [
    { label: 'Horas reservadas', value: reservedHours },
    { label: 'Horas bloqueadas', value: blockedHours },
    { label: 'Horas libres', value: freeHours },
    { label: 'Ocupación', value: occupancy, suffix: '%' },
  ]

  const weekOptions = Array.from({ length: PAST_WEEKS + NEXT_WEEKS + 1 }, (_, i) => {
    const offset = i - PAST_WEEKS
    const m = addDays(thisMonday, offset * 7)
    return {
      value: String(offset),
      label: offset === 0 ? `Esta semana · ${weekLabel(m)}` : weekLabel(m),
    }
  })

  const nowHour = bogotaParts().hour
  const isPast = (date, hour) => date < today || (date === today && hour < nowHour)

  if (loaded && !spacesError && spaces.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Panel de ocupación" subtitle="Todavía no hay espacios registrados." />
        <Indicators />
        <Empty
          className="rounded-2xl border border-border bg-card py-14"
          description="Crea el primer espacio en Espacios para ver su ocupación aquí."
          icon={<MapPinned className="size-6" />}
          title="Sin espacios"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Panel de ocupación"
        subtitle="Revisa todas las reservas y bloqueos de cada cancha, semana a semana."
      />

      <Indicators />

      {/* selector de cancha y semana */}
      <motion.section
        className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5 md:flex-row md:items-end md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      >
        <div className="flex min-w-0 flex-1 items-end gap-4">
          <div className="hidden aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm sm:block">
            <SpaceThumb space={space} />
          </div>
          <Field className="min-w-0 flex-1">
            <FieldLabel>Cancha</FieldLabel>
            <Select
              aria-label="Cancha"
              onValueChange={setSpaceId}
              options={spaces.map((s) => ({
                label: s.estado === 'activo' ? s.name : `${s.name} (mantenimiento)`,
                value: s.id,
              }))}
              placeholder={loaded ? 'Sin espacios' : 'Cargando…'}
              value={activeId ?? ''}
            />
          </Field>
        </div>

        <Field className="md:w-[26rem] md:shrink-0">
          <FieldLabel>Semana</FieldLabel>
          <div className="flex items-center gap-1.5">
            <SmoothButton
              aria-label="Semana anterior"
              disabled={week <= -PAST_WEEKS}
              onClick={() => setWeek((w) => w - 1)}
              size="icon-sm"
              variant="outline"
            >
              <ChevronLeft />
            </SmoothButton>
            <div className="min-w-0 flex-1 [&>*]:w-full">
              <Select
                aria-label="Semana"
                onValueChange={(v) => setWeek(Number(v))}
                options={weekOptions}
                value={String(week)}
              />
            </div>
            <SmoothButton
              aria-label="Semana siguiente"
              disabled={week >= NEXT_WEEKS}
              onClick={() => setWeek((w) => w + 1)}
              size="icon-sm"
              variant="outline"
            >
              <ChevronRight />
            </SmoothButton>
          </div>
        </Field>
      </motion.section>

      <motion.div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" {...staggerParent}>
        {stats.map(({ label, value, suffix }) => (
          <motion.div
            key={label}
            className="rounded-2xl border border-border bg-surface-info/60 p-4 shadow-xs sm:p-5"
            {...staggerChild}
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              <AnimatedNumber value={value} />
              <span className="text-lg text-muted-foreground"> {suffix ?? 'h'}</span>
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        className="rounded-2xl border border-border bg-card p-4 shadow-xs md:p-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-card-foreground">
              {space?.name ?? 'Cargando…'}
              {loading && <Spinner aria-label="Cargando ocupación" size="sm" />}
            </h2>
            {space && (
              <p className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" /> {formatHour(space.open)} – {formatHour(space.close)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" /> Aforo {space.aforo}
                </span>
              </p>
            )}
          </div>
          {week !== 0 && (
            <SmoothButton onClick={() => setWeek(0)} size="sm" variant="outline">
              Ir a la semana actual
            </SmoothButton>
          )}
        </div>

        {space?.estado === 'mantenimiento' && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-surface-warning px-4 py-3 text-sm text-foreground">
            <Wrench className="size-4 shrink-0" />
            Esta cancha está en mantenimiento: los estudiantes no pueden reservarla.
          </p>
        )}

        {error || spacesError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">{errorMessage(error ?? spacesError)}</p>
            <SmoothButton
              onClick={() => (spacesError ? reload() : setReloadKey((k) => k + 1))}
              prefix={<RefreshCw />}
              variant="outline"
            >
              Reintentar
            </SmoothButton>
          </div>
        ) : space ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeId}-${week}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <WeekCalendar
                close={space.close}
                days={days}
                describe={describe}
                isPast={isPast}
                loading={loading}
                maxDate="9999-12-31"
                maxHours={0}
                onSelect={() => {}}
                open={space.open}
                readOnly
                selection={null}
                slotsForDay={(d) => slotsByDate[d] ?? []}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <Skeleton className="h-96 w-full rounded-xl" />
        )}

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn('h-3 w-4 rounded-sm', l.className)} />
              {l.label}
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  )
}
