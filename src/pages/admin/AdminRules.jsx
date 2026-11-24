import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Lock, Save } from 'lucide-react'
import Field, { FieldDescription, FieldLabel } from '@/components/smoothui/field'
import NumberField from '@/components/smoothui/number-field'
import SmoothButton from '@/components/smoothui/smooth-button'
import Skeleton from '@/components/smoothui/skeleton'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { mapRules } from '@/data/domain'
import { useApp } from '@/store'

/** Valores fijos o de despliegue: se muestran, pero no se editan por API (RF-12, OQ-16). */
const readOnlyRows = (s) => [
  ['Duración de franja', `${s.franjaMin} minutos`],
  ['Duración máxima', `${s.maxFranjas} franjas consecutivas`],
  ['Anticipación máxima', `${s.anticipacionMaxDias} días`],
  ['Tolerancia', `${s.toleranciaMin} minutos`],
  ['Cancelación tardía', `Menos de ${s.cancelacionTardiaMin} minutos`],
  ['Ventana de check-in', `${s.checkinAntesMin} min antes${s.checkinCierraAlFinal ? ' hasta el fin' : ` hasta ${s.checkinCierraMinDespues} min después del fin`}`],
  ['Recordatorio', `${s.recordatorioHoras} horas antes`],
  ['Suspensión', `${s.diasSuspension} días (mes calendario)`],
  ['Dominio de correo', s.emailDomain],
]

export default function AdminRules() {
  const { withReauth, refreshRules } = useApp()
  const [current, setCurrent] = useState(null) // GET /admin/parameters mapeado
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api('/admin/parameters')
      .then((raw) => {
        const s = mapRules(raw)
        setCurrent(s)
        setForm({ weeklyHours: s.cuotaSemanalHoras, noShows: s.inasistenciasSuspension })
      })
      .catch(setError)
  }, [])

  const changed =
    current &&
    form &&
    (form.weeklyHours !== current.cuotaSemanalHoras || form.noShows !== current.inasistenciasSuspension)

  const save = async (e) => {
    e.preventDefault()
    if (!changed) return
    setSaving(true)
    // Solo se envían los bloques modificados; el resto se conserva.
    const body = {}
    if (form.weeklyHours !== current.cuotaSemanalHoras) body.quota = { weeklyHours: form.weeklyHours }
    if (form.noShows !== current.inasistenciasSuspension) {
      body.sanctions = { noShowsForSuspension: form.noShows }
    }
    try {
      // Acción sensible: exige reautenticación reciente (D-21).
      const raw = await withReauth(() => api('/admin/parameters', { method: 'PUT', body }))
      const s = mapRules(raw)
      setCurrent(s)
      setForm({ weeklyHours: s.cuotaSemanalHoras, noShows: s.inasistenciasSuspension })
      refreshRules().catch(() => {})
      toast.success('Reglas actualizadas', {
        description: 'Aplican a operaciones nuevas; las reservas existentes no cambian.',
      })
    } catch (err) {
      if (err.code !== 'REAUTH_CANCELLED') {
        toast.error('No se pudieron guardar las reglas', { description: errorMessage(err) })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Configuración de reglas"
        subtitle="Edita los parámetros configurables. No hay cobros monetarios."
      />

      {error ? (
        <p className="text-sm text-destructive-ink">{errorMessage(error)}</p>
      ) : !current ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <motion.form
            className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-7 md:p-9"
            onSubmit={save}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            <motion.div className="space-y-6" {...staggerParent}>
              <motion.div className="grid gap-5 md:grid-cols-2" {...staggerChild}>
                <Field>
                  <FieldLabel>Cuota semanal (horas)</FieldLabel>
                  <NumberField
                    aria-label="Cuota semanal"
                    max={168}
                    min={1}
                    onValueChange={(v) => setForm((f) => ({ ...f, weeklyHours: v ?? f.weeklyHours }))}
                    value={form.weeklyHours}
                  />
                  <FieldDescription>Horas reservables por persona cada semana.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Inasistencias para suspender</FieldLabel>
                  <NumberField
                    aria-label="Inasistencias para suspender"
                    max={31}
                    min={1}
                    onValueChange={(v) => setForm((f) => ({ ...f, noShows: v ?? f.noShows }))}
                    value={form.noShows}
                  />
                  <FieldDescription>
                    En el mismo mes calendario; suspende {current.diasSuspension} días.
                  </FieldDescription>
                </Field>
              </motion.div>

              <motion.div className="flex flex-wrap gap-3 pt-2 max-sm:*:w-full" {...staggerChild}>
                <SmoothButton
                  color="accent"
                  disabled={!changed}
                  loading={saving}
                  prefix={<Save />}
                  size="lg"
                  type="submit"
                  variant="candy"
                >
                  Guardar cambios
                </SmoothButton>
                <SmoothButton
                  disabled={!changed}
                  onClick={() =>
                    setForm({ weeklyHours: current.cuotaSemanalHoras, noShows: current.inasistenciasSuspension })
                  }
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  Descartar
                </SmoothButton>
              </motion.div>
            </motion.div>
          </motion.form>

          <motion.section
            className="rounded-2xl border border-border bg-card px-5 shadow-xs sm:px-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          >
            <h2 className="flex items-center gap-2 pt-6 font-display text-base font-semibold text-card-foreground">
              <Lock className="size-4 text-muted-foreground" />
              Valores fijos del sistema
            </h2>
            <dl className="divide-y divide-border">
              {readOnlyRows(current).map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="font-medium wrap-anywhere text-card-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.section>

          <p className="text-xs text-muted-foreground">
            Guardar pide un código de reautenticación enviado a tu correo. Cada cambio crea una versión
            nueva de las reglas.
          </p>
        </>
      )}
    </div>
  )
}
