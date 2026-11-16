import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { formatHour, formatRange, todayISO } from '@/data/domain'
import { cn } from '@/lib/utils'

const ROW = 52 // alto en px de una franja de 60 min

const EVENT_STYLE = {
  ocupada: 'bg-smooth-200 border-smooth-600 text-muted-foreground',
  bloqueada:
    'bg-surface-danger border-destructive text-destructive-ink bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(199_41_41/0.07)_6px_12px)]',
  mia: 'bg-surface-success border-accent text-accent-ink',
}

const eventLabel = (run) =>
  run.estado === 'ocupada'
    ? 'Reservada'
    : run.estado === 'mia'
      ? 'Tu reserva'
      : (run.motivo ?? 'Bloqueada')

/** Agrupa franjas consecutivas con el mismo estado en un solo "evento". */
const toRuns = (slots) => {
  const runs = []
  for (const s of slots) {
    if (s.estado === 'libre') continue
    const prev = runs.at(-1)
    if (prev && prev.estado === s.estado && prev.motivo === s.motivo && prev.end === s.hour) {
      prev.end = s.hour + 1
    } else {
      runs.push({ estado: s.estado, motivo: s.motivo, start: s.hour, end: s.hour + 1 })
    }
  }
  return runs
}

const SHORT_DAY = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')
const DAY_NUM = (iso) => Number(iso.slice(8))

/**
 * Vista semanal tipo Google Calendar. Las franjas ocupadas/bloqueadas/propias se
 * pintan como eventos; las libres se seleccionan con clic o arrastrando en un mismo día.
 * Con `readOnly` (panel del administrador) solo se consultan las ocupaciones.
 */
export default function WeekCalendar({
  days,
  maxDate,
  open,
  close,
  slotsForDay,
  isPast,
  maxHours,
  selection,
  onSelect,
  readOnly = false,
  loading = false,
  describe = eventLabel,
}) {
  const today = todayISO()
  const hours = Array.from({ length: close - open }, (_, i) => open + i)
  const drag = useRef(null)

  useEffect(() => {
    const end = () => {
      drag.current = null
    }
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [])

  const slotMap = Object.fromEntries(days.map((d) => [d, d > maxDate ? [] : slotsForDay(d)]))
  const isFree = (date, h) => {
    if (readOnly || date > maxDate || isPast(date, h)) return false
    const slot = slotMap[date]?.find((s) => s.hour === h)
    // `bookable` lo calcula el servidor (tolerancia, mantenimiento, horizonte).
    return slot?.estado === 'libre' && slot.bookable !== false
  }

  const rangeFree = (date, lo, hi) => {
    for (let h = lo; h <= hi; h++) if (!isFree(date, h)) return false
    return true
  }

  const pick = (date, h) => {
    if (!isFree(date, h)) return
    const sel = selection
    if (sel && sel.date === date) {
      // clic sobre la única franja elegida → deseleccionar
      if (sel.hours === 1 && sel.start === h) {
        onSelect(null)
        return
      }
      // clic en una franja adyacente → extender hasta el máximo permitido
      const adjacent = h === sel.start - 1 || h === sel.start + sel.hours
      if (adjacent && sel.hours < maxHours) {
        onSelect({ date, start: Math.min(sel.start, h), hours: sel.hours + 1 })
        drag.current = { date, anchor: sel.start }
        return
      }
    }
    onSelect({ date, start: h, hours: 1 })
    drag.current = { date, anchor: h }
  }

  const extendTo = (date, h) => {
    const d = drag.current
    if (!d || d.date !== date) return
    let lo = Math.min(d.anchor, h)
    let hi = Math.max(d.anchor, h)
    if (hi - lo + 1 > maxHours) {
      if (h > d.anchor) hi = d.anchor + maxHours - 1
      else lo = d.anchor - maxHours + 1
    }
    if (rangeFree(date, lo, hi)) onSelect({ date, start: lo, hours: hi - lo + 1 })
  }

  const now = new Date()
  const nowOffset = (now.getHours() + now.getMinutes() / 60 - open) * ROW
  const cols = `3.5rem repeat(${days.length}, minmax(5.25rem, 1fr))`

  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <div className="min-w-[40rem] select-none">
        {/* cabecera de días */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: cols }}>
          <div className="pb-2 text-[10px] text-muted-foreground self-end pl-1">GMT-5</div>
          {days.map((d) => {
            const isToday = d === today
            const out = d > maxDate
            return (
              <div key={d} className={cn('flex flex-col items-center gap-1 pb-3', out && 'opacity-40')}>
                <span
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-wide',
                    isToday ? 'text-accent-ink' : 'text-muted-foreground'
                  )}
                >
                  {SHORT_DAY(d)}
                </span>
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full font-display text-xl font-medium transition-colors',
                    isToday ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  )}
                >
                  {DAY_NUM(d)}
                </span>
              </div>
            )
          })}
        </div>

        {/* cuerpo */}
        <div
          aria-busy={loading}
          className={cn('grid transition-opacity duration-300', loading && 'pointer-events-none opacity-50')}
          style={{ gridTemplateColumns: cols }}
        >
          <div className="relative" style={{ height: hours.length * ROW }}>
            {hours.map((h, i) =>
              i === 0 ? null : (
                <span
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[10px] whitespace-nowrap text-muted-foreground tabular-nums"
                  style={{ top: i * ROW }}
                >
                  {formatHour(h).replace(':00', '')}
                </span>
              )
            )}
          </div>

          {days.map((date) => {
            const out = date > maxDate
            const runs = toRuns(slotMap[date])
            const pastCount = hours.filter((h) => isPast(date, h)).length
            const sel = selection?.date === date ? selection : null
            return (
              <div
                key={date}
                className={cn('relative border-l border-border', out && 'bg-muted/60')}
                style={{ height: hours.length * ROW }}
              >
                {/* celdas (franjas libres clicables) */}
                {hours.map((h, i) => {
                  const free = isFree(date, h)
                  return (
                    <button
                      key={h}
                      aria-label={`${formatRange(h)}${free ? ' · libre' : ''}`}
                      className={cn(
                        'group/cell absolute inset-x-0 border-t border-border/70 outline-none',
                        free
                          ? 'cursor-pointer hover:bg-accent/10 focus-visible:bg-accent/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
                          : 'cursor-default'
                      )}
                      disabled={!free}
                      onClick={(e) => e.detail === 0 && pick(date, h)}
                      onPointerDown={(e) => {
                        if (e.button !== 0) return
                        e.preventDefault()
                        pick(date, h)
                      }}
                      onPointerEnter={() => extendTo(date, h)}
                      style={{ top: i * ROW, height: ROW }}
                      type="button"
                    >
                      {free && (
                        <span className="pointer-events-none absolute inset-1 flex items-center justify-center gap-1 rounded-md text-[11px] font-medium text-accent-ink opacity-0 transition-opacity group-hover/cell:opacity-100">
                          <Plus className="size-3" />
                          {formatHour(h).replace(':00', '')}
                        </span>
                      )}
                    </button>
                  )
                })}

                {/* tiempo pasado (como Google Calendar, atenuado) */}
                {pastCount > 0 && (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 bg-background/55"
                    style={{ height: pastCount * ROW }}
                  />
                )}

                {/* eventos existentes */}
                {runs.map((run) => {
                  const len = run.end - run.start
                  return (
                    <div
                      key={`${run.estado}-${run.start}`}
                      title={`${describe(run)} · ${formatRange(run.start, len)}`}
                      className={cn(
                        'absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-xs',
                        EVENT_STYLE[run.estado]
                      )}
                      style={{ top: (run.start - open) * ROW + 2, height: len * ROW - 4 }}
                    >
                      <p className="truncate font-semibold">{describe(run)}</p>
                      {len * ROW > 40 && <p className="truncate opacity-80">{formatRange(run.start, len)}</p>}
                    </div>
                  )
                })}

                {/* selección actual */}
                {sel && (
                  <motion.div
                    layout
                    layoutId="calendar-selection"
                    className="pointer-events-none absolute inset-x-1 z-10 overflow-hidden rounded-md bg-accent px-2 py-1 text-accent-foreground shadow-lg ring-2 ring-accent/40 ring-offset-1 ring-offset-card"
                    style={{ top: (sel.start - open) * ROW + 2, height: sel.hours * ROW - 4 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                  >
                    <p className="truncate text-[11px] font-semibold">Nueva reserva</p>
                    <p className="truncate text-[11px] font-medium opacity-90">{formatRange(sel.start, sel.hours)}</p>
                  </motion.div>
                )}

                {/* línea de la hora actual */}
                {date === today && nowOffset > 0 && nowOffset < hours.length * ROW && (
                  <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: nowOffset }}>
                    <div className="relative h-0.5 bg-destructive">
                      <span className="absolute -top-[5px] -left-[6px] size-3 rounded-full bg-destructive" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
