import { useState } from 'react'
import { motion } from 'motion/react'
import { Save } from 'lucide-react'
import Field, { FieldLabel } from '@/components/smoothui/field'
import NumberField from '@/components/smoothui/number-field'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { useApp } from '@/store'

export default function AdminRules() {
  const { settings, setSettings } = useApp()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  const num = (key, label, { min = 1, max = 240, suffix } = {}) => (
    <Field>
      <FieldLabel>
        {label}
        {suffix ? ` (${suffix})` : ''}
      </FieldLabel>
      <NumberField
        aria-label={label}
        min={min}
        max={max}
        onValueChange={(v) => setForm((f) => ({ ...f, [key]: v ?? f[key] }))}
        value={form[key]}
      />
    </Field>
  )

  const save = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSettings(form)
      setSaving(false)
      toast.success('Reglas actualizadas', {
        description: 'Los nuevos valores aplican de inmediato para todas las personas.',
      })
    }, 1300)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración de reglas"
        subtitle="Edita parámetros configurables. No hay cobros monetarios."
      />

      <motion.form
        className="rounded-2xl border border-border bg-card p-7 shadow-xs md:p-9"
        onSubmit={save}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <motion.div className="space-y-6" {...staggerParent}>
          <motion.div className="grid gap-5 md:grid-cols-2" {...staggerChild}>
            {num('toleranciaMin', 'Tolerancia', { suffix: 'minutos', max: 30 })}
            {num('cancelacionTardiaMin', 'Umbral de cancelación tardía', {
              suffix: 'minutos',
              max: 240,
            })}
          </motion.div>
          <motion.div className="grid gap-5 md:grid-cols-2" {...staggerChild}>
            {num('franjaMin', 'Duración de franja', { suffix: 'minutos', min: 30, max: 120 })}
            {num('maxFranjas', 'Duración máxima', { suffix: 'franjas consecutivas', max: 4 })}
          </motion.div>
          <motion.div className="grid gap-5 md:grid-cols-2" {...staggerChild}>
            {num('cuotaSemanalHoras', 'Cuota semanal', { suffix: 'horas', max: 20 })}
            {num('anticipacionMaxDias', 'Anticipación máxima', { suffix: 'días', max: 30 })}
          </motion.div>
          <motion.div className="grid gap-5 md:grid-cols-2" {...staggerChild}>
            <Field>
              <FieldLabel>Ventana de check-in</FieldLabel>
              <Input
                onValueChange={(v) => setForm((f) => ({ ...f, ventanaCheckin: v }))}
                value={form.ventanaCheckin}
              />
            </Field>
            <Field>
              <FieldLabel>Suspensión</FieldLabel>
              <Input
                onValueChange={(v) => setForm((f) => ({ ...f, suspension: v }))}
                value={form.suspension}
              />
            </Field>
          </motion.div>

          <motion.div className="flex flex-wrap gap-3 pt-2" {...staggerChild}>
            <SmoothButton
              color="accent"
              loading={saving}
              prefix={<Save />}
              size="lg"
              type="submit"
              variant="candy"
            >
              Guardar cambios
            </SmoothButton>
            <SmoothButton
              onClick={() => setForm(settings)}
              size="lg"
              type="button"
              variant="outline"
            >
              Cancelar
            </SmoothButton>
          </motion.div>
        </motion.div>
      </motion.form>

      <motion.p
        className="text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        Estos valores se reflejan al instante en «Reglas de uso» y en las validaciones de reserva.
      </motion.p>
    </div>
  )
}
