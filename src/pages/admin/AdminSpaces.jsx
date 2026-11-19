import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ImageUp, MapPinned, Pencil, Plus, Rotate3d, Search } from 'lucide-react'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import Badge from '@/components/smoothui/badge'
import Dialog from '@/components/smoothui/dialog'
import Field, { FieldLabel } from '@/components/smoothui/field'
import NumberField from '@/components/smoothui/number-field'
import Select from '@/components/smoothui/select'
import Checkbox from '@/components/smoothui/checkbox'
import Empty from '@/components/smoothui/empty'
import Skeleton from '@/components/smoothui/skeleton'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import CourtArt, { courtKind } from '@/components/app/CourtArt'
import SpacePanorama from '@/components/app/SpacePanorama'
import useAdminSpaces from '@/lib/useAdminSpaces'
import useSpaceImage, { invalidateSpaceImage } from '@/lib/useSpaceImage'
import useSpacePanorama, { invalidateSpacePanorama } from '@/lib/useSpacePanorama'
import { PANORAMA_ACCEPT, validatePanorama } from '@/lib/validatePanorama'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { DISCIPLINES, disciplineName, formatHour, hasIncompatibleDisciplines, INCOMPATIBLE_FOOTBALL_MESSAGE, toHHmm } from '@/data/domain'
import { useApp } from '@/store'
import { cn } from '@/lib/utils'

const OPEN_HOURS = Array.from({ length: 23 }, (_, i) => i) // 0:00 → 22:00
const CLOSE_HOURS = Array.from({ length: 23 }, (_, i) => i + 1) // 1:00 → 23:00
const MAX_IMAGE_BYTES = 31_457_280 // 30 MiB por archivo

const emptyForm = {
  id: null,
  name: '',
  disciplines: [],
  aforo: 10,
  requirements: '',
  open: 6,
  close: 22,
  estado: 'activo',
}

function SpaceThumb({ space, version }) {
  const image = useSpaceImage(space.id, 'PREVIEW', version)
  return (
    <div className="aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
      {image ? (
        <img alt="" className="h-full w-full object-cover" src={image} />
      ) : (
        <CourtArt kind={courtKind(space)} />
      )}
    </div>
  )
}

/** Selector de imagen con vista previa local (PREVIEW o PANORAMA). */
function ImagePicker({ label, hint, file, onChange, required, current, wide, panorama = false, onValidatingChange }) {
  const [validating, setValidating] = useState(false)
  const validation = useRef(null)
  const local = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => local && URL.revokeObjectURL(local), [local])
  useEffect(() => () => validation.current?.abort(), [])
  const preview = local ?? current
  return (
    <Field>
      <FieldLabel>
        {label}
        {required && <span className="text-destructive-ink"> *</span>}
      </FieldLabel>
      <label
        className={cn(
          'group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/50 text-sm text-muted-foreground transition-colors hover:border-accent hover:bg-accent/5 focus-ring-within',
          wide ? 'aspect-[3/1]' : 'aspect-[16/10]'
        )}
      >
        {preview ? (
          <img alt="" className="absolute inset-0 h-full w-full object-cover" src={preview} />
        ) : (
          <span className="flex flex-col items-center gap-1.5 px-3 text-center">
            <ImageUp className="size-5" />
            {hint}
          </span>
        )}
        {preview && (
          <span className="absolute inset-x-2 bottom-2 rounded-md bg-sidebar/80 px-2 py-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            Cambiar imagen
          </span>
        )}
        <input
          accept={panorama ? PANORAMA_ACCEPT : 'image/*'}
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (!f) return
            if (f.size > MAX_IMAGE_BYTES) {
              toast.error('Imagen demasiado grande', { description: 'El máximo es 30 MB por archivo.' })
              return
            }
            if (panorama) {
              validation.current?.abort()
              const controller = new AbortController()
              validation.current = controller
              setValidating(true)
              onValidatingChange?.(true)
              try {
                await validatePanorama(f, { signal: controller.signal })
              } catch (error) {
                if (!controller.signal.aborted) toast.error('Panorama no válido', { description: error.message })
                return
              } finally {
                if (validation.current === controller) {
                  setValidating(false)
                  onValidatingChange?.(false)
                }
              }
              if (controller.signal.aborted) return
            }
            onChange(f)
          }}
          type="file"
        />
      </label>
      {validating && <p className="text-xs text-muted-foreground" role="status">Validando panorama…</p>}
    </Field>
  )
}

function ExistingImage({ id, kind, version, children }) {
  return children(useSpaceImage(id, kind, version))
}

function ExistingPanorama({ id, version, children }) {
  return children(useSpacePanorama(id, version))
}

export default function AdminSpaces() {
  const { spaces, loaded, error, reload } = useAdminSpaces()
  const { refreshSpaces } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState({ PREVIEW: null, PANORAMA: null })
  const [saving, setSaving] = useState(false)
  const [validatingPanorama, setValidatingPanorama] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [imageVersion, setImageVersion] = useState(0)
  const [viewSpace, setViewSpace] = useState(null)

  const visible = spaces.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))

  const openCreate = () => {
    setForm(emptyForm)
    setImages({ PREVIEW: null, PANORAMA: null })
    setFieldErrors({})
    setValidatingPanorama(false)
    setOpen(true)
  }
  const openEdit = (space) => {
    setForm({ ...space })
    setImages({ PREVIEW: null, PANORAMA: null })
    setFieldErrors({})
    setValidatingPanorama(false)
    setOpen(true)
  }

  const toggleDiscipline = (id, checked) => {
    setFieldErrors((errors) => ({ ...errors, disciplines: null }))
    setForm((f) => ({
      ...f,
      disciplines: checked ? [...f.disciplines, id] : f.disciplines.filter((d) => d !== id),
    }))
  }

  const payload = () => ({
    name: form.name.trim(),
    capacity: Number(form.aforo),
    requirements: form.requirements.trim() || null,
    openingTime: toHHmm(form.open),
    closingTime: toHHmm(form.close),
    status: form.estado === 'activo' ? 'ACTIVE' : 'MAINTENANCE',
    disciplines: form.disciplines,
  })

  const save = async () => {
    if (hasIncompatibleDisciplines(form.disciplines)) {
      setFieldErrors({ disciplines: INCOMPATIBLE_FOOTBALL_MESSAGE })
      return
    }
    setSaving(true)
    setFieldErrors({})
    try {
      if (form.id) {
        // PUT /admin/spaces/{id} (JSON) y, si se eligieron, las imágenes por separado.
        await api(`/admin/spaces/${form.id}`, { method: 'PUT', body: payload() })
        for (const kind of ['PREVIEW', 'PANORAMA']) {
          if (!images[kind]) continue
          const data = new FormData()
          data.append('image', images[kind])
          await api(`/admin/spaces/${form.id}/images/${kind}`, { method: 'PUT', form: data })
          if (kind === 'PANORAMA') invalidateSpacePanorama(form.id)
          else invalidateSpaceImage(form.id, kind)
        }
        setImageVersion((v) => v + 1)
      } else {
        // POST /admin/spaces (multipart): parte JSON `space` + imágenes obligatorias.
        const data = new FormData()
        data.append('space', new Blob([JSON.stringify(payload())], { type: 'application/json' }))
        data.append('preview', images.PREVIEW)
        data.append('panorama', images.PANORAMA)
        await api('/admin/spaces', { method: 'POST', form: data })
      }
      toast.success(form.id ? 'Espacio actualizado' : 'Espacio creado', { description: form.name })
      setOpen(false)
      await reload()
      refreshSpaces().catch(() => {})
    } catch (err) {
      setFieldErrors(err.details?.fields ?? {})
      toast.error('No se pudo guardar el espacio', { description: errorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const valid =
    !validatingPanorama &&
    form.name.trim() &&
    form.disciplines.length > 0 &&
    !hasIncompatibleDisciplines(form.disciplines) &&
    form.open < form.close &&
    Number(form.aforo) > 0 &&
    (form.id || (images.PREVIEW && images.PANORAMA))

  const fieldError = (key) =>
    fieldErrors[key] ? <p className="text-xs text-destructive-ink">{fieldErrors[key]}</p> : null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Espacios"
        subtitle="Administra espacios, horarios de operación, estados e imágenes."
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
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
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
        {!loaded ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-destructive-ink">{errorMessage(error)}</p>
        ) : spaces.length === 0 ? (
          <Empty
            className="py-14"
            description="Crea el primer espacio con su imagen de vista previa y su panorámica 360°."
            icon={<MapPinned className="size-6" />}
            title="Aún no hay espacios"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
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
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <SpaceThumb space={space} version={imageVersion} />
                        <span className="font-medium text-card-foreground">{space.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {space.disciplines.map(disciplineName).join(', ')}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground tabular-nums">{space.aforo}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {formatHour(space.open)}–{formatHour(space.close)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={space.estado === 'activo' ? 'success' : 'warning'}>
                        {space.estado === 'activo' ? 'Activo' : 'Mantenimiento'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-2">
                        <SmoothButton onClick={() => setViewSpace(space)} prefix={<Rotate3d />} size="sm" variant="soft">
                          Ver 360°
                        </SmoothButton>
                        <SmoothButton
                          onClick={() => openEdit(space)}
                          prefix={<Pencil />}
                          size="sm"
                          variant="outline"
                        >
                          Editar
                        </SmoothButton>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.section>

      <Dialog
        className="sm:max-w-2xl"
        description="RN-09: un espacio en mantenimiento no aparece como reservable. Los cambios rigen para reservas nuevas."
        footer={
          <div className="flex justify-end gap-3">
            <SmoothButton onClick={() => setOpen(false)} variant="outline">
              Cancelar
            </SmoothButton>
            <SmoothButton
              color="accent"
              disabled={!valid}
              loading={saving}
              onClick={save}
              variant="candy"
            >
              {form.id ? 'Guardar cambios' : 'Crear espacio'}
            </SmoothButton>
          </div>
        }
        onOpenChange={setOpen}
        open={open}
        title={form.id ? 'Editar espacio' : 'Crear espacio'}
      >
        <div className="max-h-[65dvh] space-y-5 overflow-y-auto py-2 pr-1">
          <Field>
            <FieldLabel>Nombre</FieldLabel>
            <Input
              onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Cancha…"
              value={form.name}
            />
            {fieldError('name')}
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium">Disciplinas</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {DISCIPLINES.map((d) => (
                <label className="flex items-center gap-2 text-sm" key={d.id}>
                  <Checkbox
                    checked={form.disciplines.includes(d.id)}
                    disabled={!form.disciplines.includes(d.id) && hasIncompatibleDisciplines([...form.disciplines, d.id])}
                    onCheckedChange={(checked) => toggleDiscipline(d.id, checked)}
                  />
                  {d.name}
                </label>
              ))}
            </div>
            {fieldError('disciplines')}
            <p className="mt-2 text-xs text-muted-foreground">
              {INCOMPATIBLE_FOOTBALL_MESSAGE}
              {hasIncompatibleDisciplines(form.disciplines) && ' Retira una modalidad para guardar.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Aforo máximo</FieldLabel>
              <NumberField
                aria-label="Aforo máximo"
                max={500}
                min={1}
                onValueChange={(v) => setForm((f) => ({ ...f, aforo: v ?? 1 }))}
                value={form.aforo}
              />
              {fieldError('capacity')}
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
                options={OPEN_HOURS.map((h) => ({ label: formatHour(h), value: String(h) }))}
                value={String(form.open)}
              />
            </Field>
            <Field>
              <FieldLabel>Cierra</FieldLabel>
              <Select
                aria-label="Hora de cierre"
                onValueChange={(v) => setForm((f) => ({ ...f, close: Number(v) }))}
                options={CLOSE_HOURS.map((h) => ({ label: formatHour(h), value: String(h) }))}
                value={String(form.close)}
              />
              {form.open >= form.close ? (
                <p className="text-xs text-destructive-ink">Debe ser posterior a la apertura.</p>
              ) : (
                fieldError('closingTime')
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel>Requisitos de uso (opcional)</FieldLabel>
            <Input
              onValueChange={(v) => setForm((f) => ({ ...f, requirements: v }))}
              placeholder="Calzado deportivo"
              value={form.requirements}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[2fr_3fr]">
            <ExistingImage id={form.id} kind="PREVIEW" version={imageVersion}>
              {(current) => (
                <ImagePicker
                  current={current}
                  file={images.PREVIEW}
                  hint="Foto de la cancha"
                  label="Vista previa"
                  onChange={(f) => setImages((i) => ({ ...i, PREVIEW: f }))}
                  required={!form.id}
                />
              )}
            </ExistingImage>
            <ExistingPanorama id={form.id} version={imageVersion}>
              {(panorama) => (
                <div className="space-y-2">
                  <ImagePicker
                    current={panorama.url}
                    file={images.PANORAMA}
                    hint="Panorámica 360° (equirectangular)"
                    label="Panorámica 360°"
                    onChange={(f) => setImages((i) => ({ ...i, PANORAMA: f }))}
                    onValidatingChange={setValidatingPanorama}
                    required={!form.id}
                    wide
                    panorama
                  />
                  {!images.PANORAMA && (panorama.status === 'unavailable' || panorama.status === 'error') && (
                    <p className="text-xs text-muted-foreground" role="status">{panorama.error?.message}</p>
                  )}
                </div>
              )}
            </ExistingPanorama>
          </div>
          <p className="text-xs text-muted-foreground">
            Máximo 30 MB por imagen. El servidor valida el formato por su contenido.
          </p>
          <p className="text-xs text-muted-foreground">
            Se admiten panoramas PNG, JPG/JPEG o WebP de cualquier proporción. El visor los estira o comprime a 2:1, sin recortar,
            hasta un máximo de 4096 × 2048 px. El archivo original no se modifica; las proporciones muy distintas pueden deformarse.
            {' '}En el Recorrido MVP, las imágenes subidas son temporales: al recargar vuelven los panoramas de public/panoramas/.
          </p>
        </div>
      </Dialog>

      <Dialog
        className="sm:max-w-3xl"
        description="Arrastra para explorar la cancha. En móvil, usa dos dedos."
        onOpenChange={(next) => { if (!next) setViewSpace(null) }}
        open={Boolean(viewSpace)}
        title={`Vista 360° · ${viewSpace?.name ?? 'Cancha'}`}
      >
        {viewSpace && <SpacePanorama className="aspect-[4/3] max-h-[65dvh] w-full sm:aspect-video" space={viewSpace} />}
      </Dialog>
    </div>
  )
}
