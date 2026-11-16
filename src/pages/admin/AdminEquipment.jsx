import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Dumbbell, Pencil, Plus } from 'lucide-react'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import Badge from '@/components/smoothui/badge'
import Dialog from '@/components/smoothui/dialog'
import Field, { FieldLabel } from '@/components/smoothui/field'
import NumberField from '@/components/smoothui/number-field'
import Select from '@/components/smoothui/select'
import Empty from '@/components/smoothui/empty'
import Skeleton from '@/components/smoothui/skeleton'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { DISCIPLINES, disciplineName } from '@/data/domain'

const NONE = 'NONE'
const emptyForm = { id: null, name: '', discipline: NONE, stock: 1, status: 'AVAILABLE' }

/** UC13 — catálogo de implementos (GET /equipment, POST/PUT /admin/equipment). */
export default function AdminEquipment() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api('/equipment')
      setItems([...res.equipment].sort((a, b) => a.name.localeCompare(b.name, 'es')))
      setError(null)
    } catch (err) {
      setError(err)
      setItems([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setOpen(true)
  }
  const openEdit = (item) => {
    setForm({ ...item, discipline: item.discipline ?? NONE })
    setOpen(true)
  }

  const save = async () => {
    setSaving(true)
    const body = {
      name: form.name.trim(),
      discipline: form.discipline === NONE ? null : form.discipline,
      stock: Number(form.stock),
      status: form.status,
    }
    try {
      if (form.id) {
        await api(`/admin/equipment/${form.id}`, { method: 'PUT', body })
      } else {
        await api('/admin/equipment', { method: 'POST', body })
      }
      toast.success(form.id ? 'Implemento actualizado' : 'Implemento creado', { description: body.name })
      setOpen(false)
      load()
    } catch (err) {
      // STOCK_BELOW_COMMITTED, EQUIPMENT_NAME_ALREADY_EXISTS, VALIDATION_ERROR…
      toast.error('No se pudo guardar', { description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const valid = form.name.trim() && Number(form.stock) >= 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Implementos"
        subtitle="Balones, mallas y demás elementos que se pueden pedir al reservar."
        actions={
          <SmoothButton color="accent" onClick={openCreate} prefix={<Plus />} variant="candy">
            Agregar implemento
          </SmoothButton>
        }
      />

      <motion.section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
      >
        {items == null ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-destructive-ink">{errorMessage(error)}</p>
        ) : items.length === 0 ? (
          <Empty
            className="py-14"
            description="Los estudiantes podrán pedirlos al confirmar una reserva."
            icon={<Dumbbell className="size-6" />}
            title="Sin implementos"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-6 py-4 font-medium">Nombre</th>
                  <th className="px-6 py-4 font-medium">Disciplina sugerida</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <motion.tbody {...staggerParent}>
                {items.map((item) => (
                  <motion.tr key={item.id} className="border-b border-border/60 last:border-0" {...staggerChild}>
                    <td className="px-6 py-4 font-medium text-card-foreground">{item.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.discipline ? disciplineName(item.discipline) : '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground tabular-nums">{item.stock}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                        {item.status === 'AVAILABLE' ? 'Disponible' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <SmoothButton onClick={() => openEdit(item)} prefix={<Pencil />} size="sm" variant="outline">
                        Editar
                      </SmoothButton>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.section>

      <Dialog
        description="El stock no puede quedar por debajo de las unidades ya comprometidas en reservas futuras (RN-65)."
        footer={
          <div className="flex justify-end gap-3">
            <SmoothButton onClick={() => setOpen(false)} variant="outline">
              Cancelar
            </SmoothButton>
            <SmoothButton color="accent" disabled={!valid} loading={saving} onClick={save} variant="candy">
              {form.id ? 'Guardar cambios' : 'Agregar'}
            </SmoothButton>
          </div>
        }
        onOpenChange={setOpen}
        open={open}
        title={form.id ? 'Editar implemento' : 'Agregar implemento'}
      >
        <div className="space-y-5 py-2">
          <Field>
            <FieldLabel>Nombre</FieldLabel>
            <Input
              maxLength={200}
              onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Balón de voleibol"
              value={form.name}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Stock total</FieldLabel>
              <NumberField
                aria-label="Stock total"
                max={10000}
                min={0}
                onValueChange={(v) => setForm((f) => ({ ...f, stock: v ?? 0 }))}
                value={form.stock}
              />
            </Field>
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <Select
                aria-label="Estado"
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                options={[
                  { label: 'Disponible', value: 'AVAILABLE' },
                  { label: 'Inactivo', value: 'INACTIVE' },
                ]}
                value={form.status}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>Disciplina sugerida</FieldLabel>
            <Select
              aria-label="Disciplina sugerida"
              onValueChange={(v) => setForm((f) => ({ ...f, discipline: v }))}
              options={[
                { label: 'Ninguna', value: NONE },
                ...DISCIPLINES.map((d) => ({ label: d.name, value: d.id })),
              ]}
              value={form.discipline}
            />
          </Field>
        </div>
      </Dialog>
    </div>
  )
}
