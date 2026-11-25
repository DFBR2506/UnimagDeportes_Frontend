import { useEffect, useRef, useState } from 'react'
import Badge from '@/components/smoothui/badge'
import Dialog from '@/components/smoothui/dialog'
import Field, { FieldLabel } from '@/components/smoothui/field'
import Input from '@/components/smoothui/input'
import Select from '@/components/smoothui/select'
import SmoothButton from '@/components/smoothui/smooth-button'
import Textarea from '@/components/smoothui/textarea'
import { BLOCK_TYPES, addDays, todayISO } from '@/data/domain'
import { errorMessage } from '@/lib/api'
import { notifyAvailabilityChanged } from '@/lib/availabilityEvents'
import { canCancelBlock, cancelBlock, cancellationReasonLength, formatBlockInstant, listBlocks } from '@/lib/blocks'
import useAvailabilityRevision from '@/lib/useAvailabilityRevision'
import { useApp } from '@/store'

const blockRange = (block) =>
  `${formatBlockInstant(block.startAt)} – ${formatBlockInstant(block.endAt)} (America/Bogota)`

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

  const spaceName = (id) => spaces.find((space) => space.id === id)?.name ?? id
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
          Consulta las franjas por espacio. “No cancelado” también incluye bloqueos que ya terminaron.
        </p>
      </div>
      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field>
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
        <div role="alert" className="space-y-3">
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
          <p role="status" className="text-sm text-muted-foreground">
            {!validRange ? '' : loading || !loaded ? 'Consultando bloqueos…' : page ? `${page.totalElements} bloqueo(s) encontrados` : spaces.length === 0 ? 'No hay espacios registrados.' : ''}
          </p>
          {page?.items.length === 0 && <p className="py-6 text-sm text-muted-foreground">No hay bloqueos para estos filtros.</p>}
          <ul className="mt-4 space-y-3">
            {validRange && page?.items.map((block) => (
              <li key={block.id} className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-medium text-card-foreground">{spaceName(block.spaceId)}</h3>
                    <p className="text-sm">{blockRange(block)}</p>
                    <p className="break-words text-sm text-muted-foreground">{BLOCK_TYPES.find((type) => type.value === block.type)?.label ?? block.type} · {block.reason}</p>
                  </div>
                  <Badge variant={block.status === 'CANCELLED' ? 'secondary' : 'warning'}>
                    {block.status === 'CANCELLED' ? 'Cancelado' : 'No cancelado'}
                  </Badge>
                </div>
                <dl className="space-y-1 text-xs text-muted-foreground">
                  <div><dt className="inline font-medium">ID: </dt><dd className="inline break-all">{block.id}</dd></div>
                  {block.recurrenceGroup && <div><dt className="inline font-medium">Grupo recurrente: </dt><dd className="inline break-all">{block.recurrenceGroup}</dd></div>}
                </dl>
                {block.status === 'CANCELLED' ? (
                  <dl className="space-y-2 border-t border-border pt-3 text-sm">
                    <div><dt className="font-medium">Administrador que canceló (UUID)</dt><dd className="break-all text-muted-foreground">{block.cancelledBy}</dd></div>
                    <div><dt className="font-medium">Fecha de cancelación</dt><dd className="text-muted-foreground">{formatBlockInstant(block.cancelledAt)} (America/Bogota)</dd></div>
                    <div><dt className="font-medium">Motivo de cancelación</dt><dd className="break-words text-muted-foreground">{block.cancellationReason}</dd></div>
                  </dl>
                ) : canCancelBlock(block, now) ? (
                  <SmoothButton className="max-sm:w-full" variant="outline" disabled={saving} onClick={() => selectBlock(block)}>
                    Cancelar bloqueo
                  </SmoothButton>
                ) : <p className="text-sm text-muted-foreground">Franja finalizada: no admite una primera cancelación.</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {page && validRange && (
        <nav aria-label="Paginación de bloqueos" className="flex flex-wrap items-center gap-3">
          <SmoothButton variant="outline" disabled={loading || page.page === 0} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Anterior</SmoothButton>
          <p className="text-sm">Página {page.page + 1} de {Math.max(1, Math.ceil(page.totalElements / page.size))}</p>
          <SmoothButton variant="outline" disabled={loading || (page.page + 1) * page.size >= page.totalElements} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Siguiente</SmoothButton>
          <SmoothButton variant="ghost" disabled={loading} onClick={() => setReloadKey((value) => value + 1)}>Actualizar historial</SmoothButton>
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
              <p className="break-all text-xs text-muted-foreground">ID: {selected.id}</p>
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
