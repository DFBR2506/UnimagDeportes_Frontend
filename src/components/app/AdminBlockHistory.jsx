import { useEffect, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import Badge from '@/components/smoothui/badge'
import Dialog from '@/components/smoothui/dialog'
import Empty from '@/components/smoothui/empty'
import Field, { FieldLabel } from '@/components/smoothui/field'
import Input from '@/components/smoothui/input'
import Select from '@/components/smoothui/select'
import Skeleton from '@/components/smoothui/skeleton'
import SmoothButton from '@/components/smoothui/smooth-button'
import Textarea from '@/components/smoothui/textarea'
import { BLOCK_TYPES, addDays, todayISO } from '@/data/domain'
import { errorMessage } from '@/lib/api'
import { notifyAvailabilityChanged } from '@/lib/availabilityEvents'
import { administratorName, canCancelBlock, cancelBlock, cancellationReasonLength, formatBlockInstant, listBlocks } from '@/lib/blocks'
import useAvailabilityRevision from '@/lib/useAvailabilityRevision'
import { useApp } from '@/store'

const blockRange = (block) =>
  `${formatBlockInstant(block.startAt)} – ${formatBlockInstant(block.endAt)} (America/Bogota)`

const blockDateFormat = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota', day: 'numeric', month: 'numeric', year: 'numeric',
})
const blockTimeFormat = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota', timeStyle: 'short',
})

function BlockSchedule({ block }) {
  const start = new Date(block.startAt)
  const end = new Date(block.endAt)
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm leading-relaxed text-muted-foreground">
      <div className="flex items-center gap-2">
        <dt className="flex items-center gap-2 font-medium">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          Fecha:
        </dt>
        <dd>{blockDateFormat.formatRange(start, end)}</dd>
      </div>
      <div className="flex flex-wrap gap-x-1">
        <dt className="font-medium">Hora inicio:</dt>
        <dd><time dateTime={block.startAt}>{blockTimeFormat.format(start)}</time></dd>
      </div>
      <div className="flex flex-wrap gap-x-1">
        <dt className="font-medium">Hora fin:</dt>
        <dd><time dateTime={block.endAt}>{blockTimeFormat.format(end)}</time></dd>
      </div>
    </dl>
  )
}

export default function AdminBlockHistory({ spaces, loaded, spacesError, reloadSpaces }) {
  const { isAdmin, token, withReauth } = useApp()
  const [filters, setFilters] = useState(() => ({
    spaceId: '', from: todayISO(), through: addDays(todayISO(), 30), status: '', page: 0, size: 20,
  }))
  const spaceId = filters.spaceId || spaces[0]?.id
  const revision = useAvailabilityRevision(isAdmin ? spaceId : null)
  const [reloadKey, setReloadKey] = useState(0)
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(Date.now)
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [retryIntent, setRetryIntent] = useState(null)
  const [notice, setNotice] = useState('')
  const submitting = useRef(false)
  const mounted = useRef(false)
  const historyHeading = useRef(null)
  const validRange = Boolean(filters.from && filters.through && filters.from <= filters.through)

  useEffect(() => {
    mounted.current = true
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin || !spaceId || !validRange) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setPage(null)
    listBlocks({ ...filters, spaceId }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        // Otro administrador puede retirar la última fila de la página filtrada.
        const lastPage = Math.max(0, Math.ceil(result.totalElements / result.size) - 1)
        if (filters.page > lastPage) {
          setFilters((current) => ({ ...current, page: lastPage }))
          return
        }
        setPage(result)
        setLoading(false)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(err)
        setLoading(false)
      })
    return () => controller.abort()
  }, [filters, spaceId, validRange, isAdmin, token, revision, reloadKey])

  const changeFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 0 }))

  const selectBlock = (block) => {
    setSelected(block)
    setReason('')
    setCancelError(null)
    setRetryIntent(null)
    setNotice('')
  }

  const submitCancellation = async (event) => {
    event.preventDefault()
    const length = cancellationReasonLength(reason)
    if (!isAdmin || !selected || submitting.current || length < 1 || length > 1000 ||
        (!retryIntent && !canCancelBlock(selected, Date.now())) || ['BLOCK_NOT_FOUND', 'BLOCK_NOT_CANCELLABLE'].includes(cancelError?.code)) return
    const block = selected
    const cancellationReason = retryIntent?.reason ?? reason.trim()
    submitting.current = true
    setSaving(true)
    setCancelError(null)
    try {
      const result = await withReauth(() => cancelBlock(block.id, cancellationReason))
      // También tras un 200 idempotente: el servidor no publica otro SSE.
      notifyAvailabilityChanged(block.spaceId)
      if (!mounted.current) return
      setSelected(null)
      setReason('')
      setNotice(`Bloqueo cancelado. Motivo registrado: ${result.cancellationReason}. La disponibilidad se consulta de nuevo; no se presupone que la franja esté libre.`)
      historyHeading.current?.focus()
    } catch (err) {
      if (!mounted.current) return
      if (err.code === 'REAUTH_CANCELLED') {
        setCancelError({ message: 'Reautenticación cancelada. Conservamos el motivo; puedes volver a confirmar.' })
      } else {
        setCancelError(err)
        if (err.status === 0 || err.status >= 500) {
          // El commit pudo completarse aunque se perdiera la respuesta.
          setRetryIntent({ reason: cancellationReason })
        }
        if (['BLOCK_NOT_FOUND', 'BLOCK_NOT_CANCELLABLE'].includes(err.code)) {
          setReloadKey((value) => value + 1)
        }
      }
    } finally {
      submitting.current = false
      if (mounted.current) setSaving(false)
    }
  }

  if (!isAdmin) return null

  const spaceName = (id) => spaces.find((space) => space.id === id)?.name?.trim() || 'Espacio no disponible'
  const reasonLength = cancellationReasonLength(reason)
  const noLongerEligible = selected && !retryIntent && !canCancelBlock(selected, now)
  const terminalError = ['BLOCK_NOT_FOUND', 'BLOCK_NOT_CANCELLABLE'].includes(cancelError?.code)

  return (
    <section aria-labelledby="block-history-heading" className="min-w-0 space-y-5">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" id="block-history-heading" ref={historyHeading} tabIndex={-1}>
          Bloqueos e historial
        </h2>
        <p className="text-sm text-muted-foreground">
           Consulta las franjas por espacio. “No cancelado” también incluye bloqueos que ya terminaron. Las horas se muestran en hora de Bogotá.
        </p>
      </div>
      <div className="grid gap-x-4 gap-y-5 rounded-2xl border border-border bg-card p-4 shadow-xs sm:grid-cols-2 sm:p-5 lg:grid-cols-6">
        <Field className="lg:col-span-2">
          <FieldLabel>Espacio del historial</FieldLabel>
          <Select
            aria-label="Espacio del historial"
            value={spaceId ?? ''}
            options={spaces.map((space) => ({ value: space.id, label: space.name }))}
            onValueChange={(value) => changeFilter('spaceId', value)}
            placeholder={loaded ? 'Sin espacios' : 'Cargando…'}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="blocks-from">Desde el día</FieldLabel>
          <Input id="blocks-from" type="date" value={filters.from} onValueChange={(value) => changeFilter('from', value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="blocks-through">Hasta el día (incluido)</FieldLabel>
          <Input id="blocks-through" type="date" value={filters.through} min={filters.from} onValueChange={(value) => changeFilter('through', value)} />
        </Field>
        <Field>
          <FieldLabel>Estado del bloqueo</FieldLabel>
          <Select
            aria-label="Estado del bloqueo"
            value={filters.status}
            options={[{ value: '', label: 'Todos' }, { value: 'ACTIVE', label: 'No cancelado' }, { value: 'CANCELLED', label: 'Cancelado' }]}
            onValueChange={(value) => changeFilter('status', value)}
          />
        </Field>
        <Field>
          <FieldLabel>Bloqueos por página</FieldLabel>
          <Select
            aria-label="Bloqueos por página"
            value={String(filters.size)}
            options={[20, 50, 100].map((size) => ({ value: String(size), label: String(size) }))}
            onValueChange={(value) => changeFilter('size', Number(value))}
          />
        </Field>
      </div>
      {!validRange && <p role="alert" className="text-sm text-destructive-ink">Indica ambas fechas; el último día no puede ser anterior al primero.</p>}
      {notice && <p role="status" className="break-words rounded-xl bg-surface-success p-4 text-sm">{notice}</p>}
      {spacesError || error ? (
        <div role="alert" className="space-y-3 rounded-xl border border-destructive/20 bg-surface-danger p-5">
          <p className="text-sm text-destructive-ink">
            {notice ? 'La cancelación se registró, pero no se pudo actualizar el historial. ' : ''}
            {errorMessage(spacesError ?? error)}
          </p>
          <SmoothButton variant="outline" onClick={() => spacesError ? reloadSpaces() : setReloadKey((value) => value + 1)}>
            Reintentar consulta
          </SmoothButton>
        </div>
      ) : (
        <div aria-busy={validRange && loading}>
          <p role="status" className="text-sm font-medium text-muted-foreground">
            {!validRange ? '' : loading || !loaded ? 'Consultando bloqueos…' : page ? `${page.totalElements} bloqueo(s) encontrados` : spaces.length === 0 ? 'No hay espacios registrados.' : ''}
          </p>
          {validRange && (loading || !loaded) && (
            <div aria-hidden="true" className="mt-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          )}
          {validRange && page?.items.length === 0 && (
            <Empty
              className="mt-4 rounded-xl border border-border bg-card"
              title="No hay bloqueos para estos filtros."
              description="Prueba con otro espacio, intervalo de fechas o estado."
            />
          )}
          <ul className="mt-4 space-y-3">
            {validRange && page?.items.map((block) => (
              <li key={block.id} className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="break-words font-display text-base font-semibold text-card-foreground">{spaceName(block.spaceId)}</h3>
                    <BlockSchedule block={block} />
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
                    {block.status === 'CANCELLED' && (
                      <Badge variant="outline" className="border-destructive/20 bg-surface-danger text-destructive-ink">
                        Cancelado
                      </Badge>
                    )}
                    {canCancelBlock(block, now) && (
                      <Badge variant="outline" className="border-blue/20 bg-surface-info text-blue-ink">
                        Bloqueo activo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2 border-t border-border/70 pt-4">
                  <p className="text-xs font-medium text-blue-ink">
                    {BLOCK_TYPES.find((type) => type.value === block.type)?.label ?? block.type}
                  </p>
                  <p className="break-words text-sm leading-relaxed text-card-foreground">{block.reason}</p>
                  <dl className="text-xs leading-relaxed text-muted-foreground">
                    <div><dt className="inline font-medium">Creado por: </dt><dd className="inline break-words">{administratorName(block.createdByName)}</dd></div>
                  </dl>
                </div>
                {block.status === 'CANCELLED' ? (
                  <dl className="grid gap-x-6 gap-y-4 rounded-lg bg-muted/60 p-4 text-sm sm:grid-cols-2 [&>div]:min-w-0">
                    <div><dt className="font-medium">Cancelado por: </dt><dd className="mt-1 break-words text-muted-foreground">{administratorName(block.cancelledByName)}</dd></div>
                    <div><dt className="font-medium">Fecha de cancelación</dt><dd className="mt-1 text-muted-foreground">{formatBlockInstant(block.cancelledAt)} (America/Bogota)</dd></div>
                    <div className="sm:col-span-2"><dt className="font-medium">Motivo de cancelación</dt><dd className="mt-1 break-words leading-relaxed text-muted-foreground">{block.cancellationReason}</dd></div>
                  </dl>
                ) : canCancelBlock(block, now) ? (
                  <div className="flex justify-end border-t border-border/70 pt-4">
                    <SmoothButton className="max-sm:w-full" color="destructive" size="sm" variant="soft" disabled={saving} onClick={() => selectBlock(block)}>
                      Cancelar bloqueo
                    </SmoothButton>
                  </div>
                ) : (
                  <p className="rounded-lg bg-muted/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">Franja finalizada: no admite una primera cancelación.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {page && validRange && (
        <nav aria-label="Paginación de bloqueos" className="flex flex-wrap items-center justify-center gap-3 border-t border-border pt-5 sm:justify-start">
          <SmoothButton variant="outline" disabled={loading || page.page === 0} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Anterior</SmoothButton>
          <p className="text-sm">Página {page.page + 1} de {Math.max(1, Math.ceil(page.totalElements / page.size))}</p>
          <SmoothButton variant="outline" disabled={loading || (page.page + 1) * page.size >= page.totalElements} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Siguiente</SmoothButton>
          <SmoothButton className="max-sm:w-full sm:ml-auto" variant="ghost" disabled={loading} onClick={() => setReloadKey((value) => value + 1)}>Actualizar historial</SmoothButton>
        </nav>
      )}
      <Dialog
        open={Boolean(selected)}
        title="Cancelar bloqueo"
        description="Confirma la cancelación de esta franja institucional."
        showCloseButton={!saving}
        onOpenChange={(open) => {
          if (!open && !submitting.current) setSelected(null)
        }}
      >
        {selected && (
          <form className="space-y-4" onSubmit={submitCancellation} aria-busy={saving}>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{spaceName(selected.spaceId)}</p>
              <p>{blockRange(selected)}</p>
              <p className="break-words text-muted-foreground">Creado por: {administratorName(selected.createdByName)}</p>
              <p className="break-words text-muted-foreground">Motivo original: {selected.reason}</p>
            </div>
            <p className="rounded-lg bg-surface-warning p-3 text-sm font-medium">Las reservas canceladas anteriormente no se reactivarán.</p>
            <p className="text-sm text-muted-foreground">
              Solo se cancela esta franja, no toda la recurrencia ni otras franjas. No se levanta el mantenimiento del espacio. Su disponibilidad depende de las demás restricciones.
            </p>
            <Field>
              <FieldLabel htmlFor="block-cancellation-reason">Motivo de cancelación</FieldLabel>
              <Textarea
                id="block-cancellation-reason"
                value={reason}
                onValueChange={setReason}
                disabled={saving}
                readOnly={Boolean(retryIntent)}
                aria-describedby="block-cancellation-help"
                aria-invalid={reasonLength > 1000}
                required
              />
              <p id="block-cancellation-help" className="text-xs text-muted-foreground">
                Entre 1 y 1000 caracteres, sin contar espacios exteriores. {reasonLength}/1000.
              </p>
            </Field>
            {cancelError && <p role="alert" className="text-sm text-destructive-ink">{cancelError.message ?? errorMessage(cancelError)}</p>}
            {retryIntent && <p className="text-sm text-muted-foreground">No se pudo confirmar el resultado. Reintentar enviará el mismo ID y motivo, incluso si la franja terminó; no duplicará una cancelación ya registrada.</p>}
            {noLongerEligible && <p role="alert" className="text-sm text-destructive-ink">La franja ya terminó y no admite una primera cancelación.</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <SmoothButton type="button" variant="outline" disabled={saving} onClick={() => setSelected(null)}>Volver</SmoothButton>
              <SmoothButton type="submit" color="destructive" variant="solid" loading={saving} disabled={reasonLength < 1 || reasonLength > 1000 || noLongerEligible || terminalError}>
                Confirmar cancelación
              </SmoothButton>
            </div>
          </form>
        )}
      </Dialog>
    </section>
  )
}
