import { useState } from 'react'
import { motion } from 'motion/react'
import { Pencil, Plus, Search } from 'lucide-react'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import Badge from '@/components/smoothui/badge'
import Dialog from '@/components/smoothui/dialog'
import Field, { FieldLabel } from '@/components/smoothui/field'
import NumberField from '@/components/smoothui/number-field'
import Select from '@/components/smoothui/select'
import Checkbox from '@/components/smoothui/checkbox'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { DISCIPLINES, formatHour } from '@/data/mock'
import { useApp } from '@/store'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 5) // 5:00 → 21:00

const emptyForm = {
  id: null,
  name: '',
  disciplines: [],
  aforo: 10,
  open: 8,
  close: 20,
  estado: 'activo',
}

export default function AdminSpaces() {
  const { spaces, saveSpace, disciplineById } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const visible = spaces.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))

  const openCreate = () => {
    setForm(emptyForm)
    setOpen(true)
  }
  const openEdit = (space) => {
    setForm({ ...space })
    setOpen(true)
  }

  const toggleDiscipline = (id, checked) => {
    setForm((f) => ({
      ...f,
      disciplines: checked ? [...f.disciplines, id] : f.disciplines.filter((d) => d !== id),
    }))
  }

  const save = () => {
    const id = form.id ?? form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    saveSpace({ ...form, id, aforo: Number(form.aforo) })
    setOpen(false)
    toast.success(form.id ? 'Espacio actualizado' : 'Espacio creado', {
      description: form.name,
    })
  }

  const valid = form.name.trim() && form.disciplines.length > 0 && form.open < form.close

  return (
    <div className="space-y-8">
      <PageHeader
        title="Espacios y franjas"
        subtitle="Administra espacios, horarios de operación y estados."
        actions={
          <SmoothButton color="accent" onClick={openCreate} prefix={<Plus />} variant="candy">
            Crear espacio
          </SmoothButton>
        }
      />

      <motion.div
        className="max-w-sm"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
      >
        <Field>
          <FieldLabel>Buscar espacio</FieldLabel>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" onValueChange={setQuery} placeholder="Cancha…" value={query} />
          </div>
        </Field>
      </motion.div>

      <motion.section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Disciplina(s)</th>
                <th className="px-6 py-4 font-medium">Aforo</th>
                <th className="px-6 py-4 font-medium">Horario</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <motion.tbody {...staggerParent}>
              {visible.map((space) => (
                <motion.tr
                  key={space.id}
                  className="border-b border-border/60 last:border-0"
                  {...staggerChild}
                >
                  <td className="px-6 py-4 font-medium text-card-foreground">{space.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {space.disciplines.map((d) => disciplineById(d)?.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 tabular-nums text-muted-foreground">{space.aforo}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatHour(space.open)}–{formatHour(space.close)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={space.estado === 'activo' ? 'success' : 'warning'}>
                      {space.estado === 'activo' ? 'Activo' : 'Mantenimiento'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <SmoothButton
                      onClick={() => openEdit(space)}
                      prefix={<Pencil />}
                      size="sm"
                      variant="outline"
                    >
                      Editar
                    </SmoothButton>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.section>

      <Dialog
        description="RN-09: un espacio en mantenimiento no aparece como reservable."
        footer={
          <div className="flex justify-end gap-3">
            <SmoothButton onClick={() => setOpen(false)} variant="outline">
              Cancelar
            </SmoothButton>
            <SmoothButton color="accent" disabled={!valid} onClick={save} variant="candy">
              {form.id ? 'Guardar cambios' : 'Crear espacio'}
            </SmoothButton>
          </div>
        }
        onOpenChange={setOpen}
        open={open}
        title={form.id ? 'Editar espacio' : 'Crear espacio'}
      >
        <div className="space-y-5 py-2">
          <Field>
            <FieldLabel>Nombre</FieldLabel>
            <Input
              onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Cancha…"
              value={form.name}
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium">Disciplinas</p>
            <div className="grid grid-cols-2 gap-2.5">
              {DISCIPLINES.map((d) => (
                <label className="flex items-center gap-2 text-sm" key={d.id}>
                  <Checkbox
                    checked={form.disciplines.includes(d.id)}
                    onCheckedChange={(checked) => toggleDiscipline(d.id, checked)}
                  />
                  {d.name}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Aforo máximo</FieldLabel>
              <NumberField
                aria-label="Aforo máximo"
                min={1}
                max={50}
                onValueChange={(v) => setForm((f) => ({ ...f, aforo: v ?? 1 }))}
                value={form.aforo}
              />
            </Field>
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <Select
                aria-label="Estado"
                onValueChange={(v) => setForm((f) => ({ ...f, estado: v }))}
                options={[
                  { label: 'Activo', value: 'activo' },
                  { label: 'Mantenimiento', value: 'mantenimiento' },
                ]}
                value={form.estado}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Abre</FieldLabel>
              <Select
                aria-label="Hora de apertura"
                onValueChange={(v) => setForm((f) => ({ ...f, open: Number(v) }))}
                options={HOURS.map((h) => ({ label: formatHour(h), value: String(h) }))}
                value={String(form.open)}
              />
            </Field>
            <Field>
              <FieldLabel>Cierra</FieldLabel>
              <Select
                aria-label="Hora de cierre"
                onValueChange={(v) => setForm((f) => ({ ...f, close: Number(v) }))}
                options={HOURS.map((h) => ({ label: formatHour(h), value: String(h) }))}
                value={String(form.close)}
              />
            </Field>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
