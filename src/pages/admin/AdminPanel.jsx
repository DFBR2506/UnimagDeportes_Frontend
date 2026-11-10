import { useState } from 'react'
import { motion } from 'motion/react'
import Select from '@/components/smoothui/select'
import Field, { FieldLabel } from '@/components/smoothui/field'
import Badge from '@/components/smoothui/badge'
import PageHeader from '@/components/app/PageHeader'
import AnimatedNumber from '@/components/app/AnimatedNumber'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { DISCIPLINES, formatRange, todayISO } from '@/data/mock'
import { useApp } from '@/store'

const KPIS = [
  { label: 'Reservas', value: 24 },
  { label: 'Cancelaciones tardías', value: 3 },
  { label: 'Inasistencias', value: 2 },
  { label: 'Usuarios suspendidos', value: 1 },
]

const SLOT_BADGE = { libre: 'success', ocupada: 'secondary', bloqueada: 'warning', mia: 'default' }

export default function AdminPanel() {
  const { spaces, slotsFor, session, disciplineById } = useApp()
  const [discipline, setDiscipline] = useState('todas')
  const [spaceFilter, setSpaceFilter] = useState('todos')
  const [period] = useState('semana')

  const visibleSpaces = spaces.filter(
    (s) =>
      (discipline === 'todas' || s.disciplines.includes(discipline)) &&
      (spaceFilter === 'todos' || s.id === spaceFilter)
  )

  const today = todayISO()
  const rows = visibleSpaces.flatMap((space) =>
    slotsFor(space.id, today)
      .filter((slot) => slot.hour >= 13 && slot.hour <= 17)
      .map((slot) => ({
        space,
        slot,
        discipline: disciplineById(space.disciplines[0])?.name,
      }))
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de ocupación"
        subtitle="Consulta la operación deportiva del período seleccionado."
      />

      <motion.div className="grid grid-cols-2 gap-4 lg:grid-cols-4" {...staggerParent}>
        {KPIS.map(({ label, value }) => (
          <motion.div
            key={label}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs"
            {...staggerChild}
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-4xl font-bold text-foreground">
              <AnimatedNumber value={value} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
      >
        <Field>
          <FieldLabel>Período</FieldLabel>
          <Select
            aria-label="Período"
            options={[{ label: 'Semana en curso', value: 'semana' }]}
            value={period}
          />
        </Field>
        <Field>
          <FieldLabel>Disciplina</FieldLabel>
          <Select
            aria-label="Disciplina"
            onValueChange={setDiscipline}
            options={[
              { label: 'Todas', value: 'todas' },
              ...DISCIPLINES.map((d) => ({ label: d.name, value: d.id })),
            ]}
            value={discipline}
          />
        </Field>
        <Field>
          <FieldLabel>Espacio</FieldLabel>
          <Select
            aria-label="Espacio"
            onValueChange={setSpaceFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              ...spaces.map((s) => ({ label: s.name, value: s.id })),
            ]}
            value={spaceFilter}
          />
        </Field>
      </motion.div>

      <motion.section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.65 }}
      >
        <h2 className="px-6 pt-6 font-display text-lg font-semibold text-card-foreground">
          Ocupación por espacio y franja · hoy
        </h2>
        <div className="mt-4 overflow-x-auto pb-2">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Espacio</th>
                <th className="px-6 py-3 font-medium">Disciplina</th>
                <th className="px-6 py-3 font-medium">Franja</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <motion.tbody {...staggerParent}>
              {rows.map(({ space, slot, discipline: d }) => (
                <motion.tr
                  key={`${space.id}-${slot.hour}`}
                  className="border-b border-border/60 last:border-0"
                  {...staggerChild}
                >
                  <td className="px-6 py-3.5 font-medium text-card-foreground">{space.name}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{d}</td>
                  <td className="px-6 py-3.5 tabular-nums text-muted-foreground">
                    {formatRange(slot.hour)}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge variant={SLOT_BADGE[slot.estado] ?? 'secondary'}>
                      {slot.estado === 'mia'
                        ? 'Ocupada'
                        : slot.estado.charAt(0).toUpperCase() + slot.estado.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">
                    {slot.estado === 'bloqueada'
                      ? slot.motivo
                      : slot.estado === 'mia'
                        ? session?.name
                        : slot.estado === 'ocupada'
                          ? 'Reserva estudiantil'
                          : '—'}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.section>
    </div>
  )
}
