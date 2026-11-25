import { api } from '@/lib/api'
import { addDays, toInstant } from '@/data/domain'

export const cancellationReasonLength = (reason) => Array.from(reason.trim()).length

export const canCancelBlock = (block, now) =>
  block.status === 'ACTIVE' && now < new Date(block.endAt).getTime()

export const formatBlockInstant = (instant) =>
  new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(instant))

/** Las fechas del filtro incluyen ambos días; la API recibe [from, to). */
export const listBlocks = ({ spaceId, from, through, status, page, size }, signal) =>
  api('/admin/blocks', {
    query: {
      spaceId,
      from: toInstant(from, 0),
      to: toInstant(addDays(through, 1), 0),
      status,
      page,
      size,
    },
    signal,
  })

export const cancelBlock = (id, reason) =>
  api(`/admin/blocks/${encodeURIComponent(id)}/cancellation`, {
    method: 'POST',
    body: { reason: reason.trim() },
  })
