import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Select from '@/components/smoothui/select'
import SmoothButton from '@/components/smoothui/smooth-button'
import Field, { FieldLabel } from '@/components/smoothui/field'
import PageHeader from '@/components/app/PageHeader'
import { SlotBadge } from '@/components/app/StatusBadge'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { DISCIPLINES, formatDate, formatRange, nextDays, todayISO } from '@/data/mock'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

export default function Availability() {
  const navigate = useNavigate()
  const { spaces, slotsFor, settings, setDraft } = useApp()

  const [discipline, setDiscipline] = useState('baloncesto')
  const spacesFor = (d) => spaces.filter((s) => s.estado === 'activo' && s.disciplines.includes(d))
  const [spaceId, setSpaceId] = useState(() => spacesFor('baloncesto')[0]?.id ?? '')
  const [date, setDate] = useState(todayISO())
  const [selection, setSelection] = useState([]) // horas consecutivas elegidas

  const spaceOptions = spacesFor(discipline).map((s) => ({ label: s.name, value: s.id }))
  const dateOptions = nextDays(settings.anticipacionMaxDias).map((iso) => ({
    label: formatDate(iso),
    value: iso,
  }))

  const slots = useMemo(() => slotsFor(spaceId, date), [slotsFor, spaceId, date])
  const space = spaces.find((s) => s.id === spaceId)

  const now = new Date()
  const isToday = date === todayISO()
  /** RN-27/28: una franja iniciada sigue reservable solo durante la tolerancia. */
  const isPast = (hour) =>
    isToday &&
    (hour < now.getHours() ||
      (hour === now.getHours() && now.getMinutes() > settings.toleranciaMin))

  const toggleHour = (hour) => {
    setSelection((sel) => {
      if (sel.includes(hour)) return sel.filter((h) => h !== hour)
      if (sel.length === 0) return [hour]
      const min = Math.min(...sel)
      const max = Math.max(...sel)
      const adjacent = hour === min - 1 || hour === max + 1
      if (!adjacent || sel.length >= settings.maxFranjas) return [hour]
      return [...sel, hour].sort((a, b) => a - b)
    })
  }

  const changeFilters = (apply) => {
    setSelection([])
    apply()
  }

  const continueToConfirm = () => {
    const startHour = Math.min(...selection)
    setDraft({ spaceId, disciplineId: discipline, date, startHour, hours: selection.length })
    navigate('/app/reservar')
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Disponibilidad"
        subtitle="Selecciona disciplina, espacio y fecha. Actualización en tiempo real."
      />

      <motion.div className="grid gap-4 md:grid-cols-3" {...staggerParent}>
        <motion.div {...staggerChild}>
          <Field>
            <FieldLabel>Disciplina</FieldLabel>
            <Select
              aria-label="Disciplina"
              onValueChange={(d) =>
                changeFilters(() => {
                  setDiscipline(d)
                  setSpaceId(spacesFor(d)[0]?.id ?? '')
                })
              }
              options={DISCIPLINES.map((d) => ({ label: d.name, value: d.id }))}
              value={discipline}
            />
          </Field>
        </motion.div>
        <motion.div {...staggerChild}>
          <Field>
            <FieldLabel>Espacio</FieldLabel>
            <Select
              aria-label="Espacio"
              onValueChange={(v) => changeFilters(() => setSpaceId(v))}
              options={spaceOptions}
              placeholder="Sin espacios activos"
              value={spaceId}
            />
          </Field>
        </motion.div>
        <motion.div {...staggerChild}>
          <Field>
            <FieldLabel>Fecha</FieldLabel>
            <Select
              aria-label="Fecha"
              onValueChange={(v) => changeFilters(() => setDate(v))}
              options={dateOptions}
              value={date}
            />
          </Field>
        </motion.div>
      </motion.div>

      <motion.section
        className="rounded-2xl border border-border bg-card p-6 shadow-xs md:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-card-foreground">
              {formatDate(date)} · America/Bogota
            </h2>
            <p className="text-sm text-muted-foreground">
              {space ? `${space.name} · Horario de operación ${formatRange(space.open, space.close - space.open)}` : 'Selecciona un espacio'}
            </p>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              className="size-2 rounded-full bg-success"
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            Actualizado ahora
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.ul
            key={`${spaceId}-${date}`}
            className="mt-6 space-y-2.5"
            {...staggerParent}
          >
            {slots.map((slot) => {
              const past = isPast(slot.hour)
              const selectable = slot.estado === 'libre' && !past
              const selected = selection.includes(slot.hour)
              return (
                <motion.li key={slot.hour} {...staggerChild}>
                  <button
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 focus-ring',
                      selectable
                        ? 'cursor-pointer border-border bg-background hover:border-accent/50 hover:shadow-sm'
                        : 'cursor-default border-border/60 bg-muted/40',
                      selected && 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent/40',
                      past && 'opacity-55'
                    )}
                    disabled={!selectable}
                    onClick={() => toggleHour(slot.hour)}
                    type="button"
                  >
                    <span
                      className={cn(
                        'font-medium tabular-nums text-foreground',
                        !selectable && !past && 'text-muted-foreground'
                      )}
                    >
                      {formatRange(slot.hour)}
                    </span>
                    {past ? (
                      <span className="text-xs text-muted-foreground">Finalizada</span>
                    ) : (
                      <SlotBadge estado={selected ? 'mia' : slot.estado} motivo={slot.motivo} />
                    )}
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Hasta {settings.maxFranjas} franjas consecutivas · tolerancia de {settings.toleranciaMin}{' '}
            min tras el inicio
          </p>
          <SmoothButton
            color="accent"
            disabled={selection.length === 0}
            onClick={continueToConfirm}
            suffix={<ArrowRight />}
            variant="candy"
          >
            {selection.length > 0
              ? `Continuar · ${formatRange(Math.min(...selection), selection.length)}`
              : 'Continuar con franja libre'}
          </SmoothButton>
        </div>
      </motion.section>
    </div>
  )
}
