import { useState } from 'react'
import { motion } from 'motion/react'
import { ShieldBan } from 'lucide-react'
import Select from '@/components/smoothui/select'
import Input from '@/components/smoothui/input'
import Field, { FieldDescription, FieldLabel } from '@/components/smoothui/field'
import ToggleGroupRoot, { ToggleGroupItem } from '@/components/smoothui/toggle-group'
import SmoothButton from '@/components/smoothui/smooth-button'
import Badge from '@/components/smoothui/badge'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import useAdminSpaces from '@/lib/useAdminSpaces'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { errorMessage, api } from '@/lib/api'
import {
  BLOCK_TYPES,
  WEEK_DAYS,
  addDays,
  formatDate,
  formatHour,
  formatRange,
  toInstant,
  todayISO,
} from '@/data/domain'
import { useApp } from '@/store'

export default function AdminBlocks() {
  const { withReauth } = useApp()
  const { spaces } = useAdminSpaces()
  const [spaceId, setSpaceId] = useState(null)
  const [type, setType] = useState('CLASS')
  const [date, setDate] = useState(todayISO())
  const [startHour, setStartHour] = useState(null)
  const [endHour, setEndHour] = useState(null)
  const [reason, setReason] = useState('')
  const [mode, setMode] = useState('puntual')
  const [days, setDays] = useState([])
  const [until, setUntil] = useState(addDays(todayISO(), 30))
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState([]) // bloqueos creados en esta sesión (la API no los lista)

  const space = spaces.find((s) => s.id === (spaceId ?? spaces[0]?.id))
  const hours = space ? Array.from({ length: space.close - space.open }, (_, i) => space.open + i) : []
  const start = startHour ?? hours[0]
  const end = endHour && endHour > start ? endHour : start + 1

  const recurrent = mode === 'recurrente'
  const valid =
    space && reason.trim() && date && (!recurrent || (days.length > 0 && until && until >= date))

  const submit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setSaving(true)
    const body = {
      spaceId: space.id,
      type,
      reason: reason.trim(),
      startAt: toInstant(date, start),
      endAt: toInstant(date, end),
      ...(recurrent ? { recurrence: { daysOfWeek: days, until } } : {}),
    }
    try {
      // Acción sensible: exige reautenticación de los últimos 10 minutos (D-21).
      const res = await withReauth(() => api('/admin/blocks', { method: 'POST', body }))
      toast.success('Bloqueo confirmado', {
        description:
          res.cancelledReservations > 0
            ? `${res.createdBlocks} franja(s) bloqueadas · ${res.cancelledReservations} reserva(s) cancelada(s) por administrador.`
            : `${res.createdBlocks} franja(s) bloqueadas.`,
      })
      setCreated((prev) => [
        { ...body, spaceName: space.name, date, start, end, recurrent, ...res, key: Date.now() },
        ...prev,
      ])
      setReason('')
    } catch (err) {
      if (err.code !== 'REAUTH_CANCELLED') {
        toast.error('No se pudo crear el bloqueo', { description: errorMessage(err) })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Bloquear franjas"
        subtitle="Los bloqueos tienen prioridad sobre las reservas futuras."
      />

      <motion.form
        className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7 md:p-9"
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
                onValueChange={(v) => {
                  setSpaceId(v)
                  setStartHour(null)
                  setEndHour(null)
                }}
                options={spaces.map((s) => ({ label: s.name, value: s.id }))}
                placeholder="Cargando espacios…"
                value={space?.id ?? ''}
              />
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select aria-label="Tipo" onValueChange={setType} options={BLOCK_TYPES} value={type} />
            </Field>
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 md:gap-5" {...staggerChild}>
            <Field className="max-md:col-span-2">
              <FieldLabel htmlFor="block-date">{recurrent ? 'Desde' : 'Fecha'}</FieldLabel>
              <Input
                id="block-date"
                min={todayISO()}
                onValueChange={setDate}
                type="date"
                value={date}
              />
            </Field>
            <Field>
              <FieldLabel>Desde</FieldLabel>
              <Select
                aria-label="Hora de inicio"
                onValueChange={(v) => setStartHour(Number(v))}
                options={hours.map((h) => ({ label: formatHour(h), value: String(h) }))}
                value={start != null ? String(start) : ''}
              />
            </Field>
            <Field>
              <FieldLabel>Hasta</FieldLabel>
              <Select
                aria-label="Hora de fin"
                onValueChange={(v) => setEndHour(Number(v))}
                options={hours
                  .map((h) => h + 1)
                  .filter((h) => h > start)
                  .map((h) => ({ label: formatHour(h), value: String(h) }))}
                value={start != null ? String(end) : ''}
              />
            </Field>
          </motion.div>

          <motion.div {...staggerChild}>
            <Field>
              <FieldLabel>Motivo</FieldLabel>
              <Input onValueChange={setReason} placeholder="Clase de voleibol" value={reason} />
              <FieldDescription>Se muestra en el calendario de los estudiantes (RN-44).</FieldDescription>
            </Field>
          </motion.div>

          <motion.div className="space-y-4" {...staggerChild}>
            <div>
              <p className="mb-2 text-sm font-medium">Modalidad</p>
              <ToggleGroupRoot
                aria-label="Modalidad del bloqueo"
                className="max-sm:flex max-sm:*:flex-1 max-sm:*:px-1"
                onValueChange={(v) => v.length && setMode(v[0])}
                value={[mode]}
              >
                <ToggleGroupItem value="puntual">Bloqueo puntual</ToggleGroupItem>
                <ToggleGroupItem value="recurrente">Fijo / recurrente</ToggleGroupItem>
              </ToggleGroupRoot>
            </div>

            {recurrent && (
              <div className="grid gap-5 rounded-xl bg-muted/50 p-4 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="mb-2 text-sm font-medium">Se repite los</p>
                  <ToggleGroupRoot
                    aria-label="Días de la semana"
                    className="flex-wrap max-sm:grid max-sm:grid-cols-7 max-sm:*:px-0 max-sm:*:text-xs"
                    onValueChange={setDays}
                    type="multiple"
                    value={days}
                  >
                    {WEEK_DAYS.map((d) => (
                      <ToggleGroupItem key={d.value} value={d.value}>
                        {d.short}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroupRoot>
                </div>
                <Field>
                  <FieldLabel htmlFor="block-until">Hasta el</FieldLabel>
                  <Input id="block-until" min={date} onValueChange={setUntil} type="date" value={until} />
                </Field>
              </div>
            )}
          </motion.div>

          <motion.p className="text-xs text-muted-foreground" {...staggerChild}>
            Las reservas futuras afectadas se cancelan por administrador sin contar cuota y se avisa por
            correo. Si alguna franja tiene una reserva en curso, no se crea nada. (RN-43) Por seguridad
            te pediremos un código enviado a tu correo.
          </motion.p>

          <motion.div {...staggerChild}>
            <SmoothButton
              className="max-sm:w-full"
              color="accent"
              disabled={!valid}
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

      {created.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Creados en esta sesión</h2>
          <motion.ul className="space-y-3" {...staggerParent}>
            {created.map((b) => (
              <motion.li
                key={b.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-xs sm:px-5"
                {...staggerChild}
              >
                <div className="min-w-0">
                  <p className="font-medium text-card-foreground">
                    {b.spaceName} · {formatRange(b.start, b.end - b.start)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {b.recurrent
                      ? `Desde ${formatDate(b.date)} hasta ${formatDate(b.recurrence.until)}`
                      : formatDate(b.date)}{' '}
                    · {b.reason} · {b.createdBlocks} franja(s)
                  </p>
                </div>
                <Badge variant="warning">{b.recurrent ? 'Recurrente' : 'Puntual'}</Badge>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      )}
    </div>
  )
}
