import { useState } from 'react'
import { motion } from 'motion/react'
import { ShieldBan } from 'lucide-react'
import Select from '@/components/smoothui/select'
import Input from '@/components/smoothui/input'
import Field, { FieldLabel } from '@/components/smoothui/field'
import ToggleGroupRoot, { ToggleGroupItem } from '@/components/smoothui/toggle-group'
import SmoothButton from '@/components/smoothui/smooth-button'
import Badge from '@/components/smoothui/badge'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { formatDate, formatRange, nextDays } from '@/data/mock'
import { useApp } from '@/store'

const TYPES = [
  { label: 'Clases y grupos formativos', value: 'clases' },
  { label: 'Eventos o torneos', value: 'eventos' },
  { label: 'Mantenimiento', value: 'mantenimiento' },
]

export default function AdminBlocks() {
  const { spaces, addBlock, blocks, settings, spaceById } = useApp()
  const [spaceId, setSpaceId] = useState(spaces[0]?.id ?? '')
  const [type, setType] = useState('clases')
  const [date, setDate] = useState(nextDays(settings.anticipacionMaxDias)[0])
  const [startHour, setStartHour] = useState(15)
  const [motivo, setMotivo] = useState('')
  const [mode, setMode] = useState('puntual')
  const [saving, setSaving] = useState(false)

  const space = spaceById(spaceId)
  const hourOptions = space
    ? Array.from({ length: space.close - space.open }, (_, i) => space.open + i).map((h) => ({
        label: formatRange(h),
        value: String(h),
      }))
    : []

  const submit = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      const affected = addBlock({
        spaceId,
        type,
        date,
        startHour,
        endHour: startHour + 1,
        motivo: motivo.trim() || TYPES.find((t) => t.value === type)?.label,
        mode,
      })
      setSaving(false)
      setMotivo('')
      toast.success('Bloqueo confirmado', {
        description:
          affected > 0
            ? `${affected} reserva(s) cancelada(s) por administrador; las horas se devolvieron.`
            : 'La franja quedó fuera de la reserva libre.',
      })
    }, 1400)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bloquear franjas"
        subtitle="Los bloqueos tienen prioridad sobre las reservas libres."
      />

      <motion.form
        className="rounded-2xl border border-border bg-card p-7 shadow-xs md:p-9"
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <motion.div className="space-y-6" {...staggerParent}>
          <motion.div className="grid gap-5 md:grid-cols-2" {...staggerChild}>
            <Field>
              <FieldLabel>Espacio</FieldLabel>
              <Select
                aria-label="Espacio"
                onValueChange={setSpaceId}
                options={spaces.map((s) => ({ label: s.name, value: s.id }))}
                value={spaceId}
              />
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select aria-label="Tipo" onValueChange={setType} options={TYPES} value={type} />
            </Field>
          </motion.div>

          <motion.div className="grid gap-5 md:grid-cols-2" {...staggerChild}>
            <Field>
              <FieldLabel>Fecha</FieldLabel>
              <Select
                aria-label="Fecha"
                onValueChange={setDate}
                options={nextDays(settings.anticipacionMaxDias).map((iso) => ({
                  label: formatDate(iso),
                  value: iso,
                }))}
                value={date}
              />
            </Field>
            <Field>
              <FieldLabel>Hora</FieldLabel>
              <Select
                aria-label="Hora"
                onValueChange={(v) => setStartHour(Number(v))}
                options={hourOptions}
                value={String(startHour)}
              />
            </Field>
          </motion.div>

          <motion.div {...staggerChild}>
            <Field>
              <FieldLabel>Motivo</FieldLabel>
              <Input
                onValueChange={setMotivo}
                placeholder="Clase formativa"
                value={motivo}
              />
            </Field>
          </motion.div>

          <motion.div {...staggerChild}>
            <p className="mb-2 text-sm font-medium">Modalidad</p>
            <ToggleGroupRoot
              aria-label="Modalidad del bloqueo"
              onValueChange={(v) => v.length && setMode(v[0])}
              value={[mode]}
            >
              <ToggleGroupItem value="puntual">Bloqueo puntual</ToggleGroupItem>
              <ToggleGroupItem value="recurrente">Fijo / recurrente</ToggleGroupItem>
            </ToggleGroupRoot>
          </motion.div>

          <motion.p className="text-xs text-muted-foreground" {...staggerChild}>
            Si afecta reservas existentes, se cancelan por administrador y se devuelven las horas.
            (RN-43)
          </motion.p>

          <motion.div {...staggerChild}>
            <SmoothButton
              color="accent"
              loading={saving}
              prefix={<ShieldBan />}
              size="lg"
              type="submit"
              variant="candy"
            >
              Confirmar bloqueo
            </SmoothButton>
          </motion.div>
        </motion.div>
      </motion.form>

      {blocks.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Bloqueos vigentes</h2>
          <motion.ul className="space-y-3" {...staggerParent}>
            {blocks.map((b) => (
              <motion.li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-xs"
                {...staggerChild}
              >
                <div className="min-w-0">
                  <p className="font-medium text-card-foreground">
                    {spaceById(b.spaceId)?.name} · {formatRange(b.startHour)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(b.date)} · {b.motivo}
                  </p>
                </div>
                <Badge variant="warning">
                  {b.mode === 'recurrente' ? 'Recurrente' : 'Puntual'}
                </Badge>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      )}
    </div>
  )
}
