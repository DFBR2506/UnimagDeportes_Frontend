import { api } from '@/lib/api'
import { addDays, toInstant } from '@/data/domain'

/**
 * DTO compartido por GET /admin/blocks y POST /admin/blocks/{id}/cancellation.
 * Los nombres son los actuales del perfil; los UUID solo identifican entidades.
 * @typedef {Object} AdminBlock
 * @property {string} id
 * @property {string} spaceId
 * @property {'CLASS'|'EVENT'|'MAINTENANCE'} type
 * @property {string} reason
 * @property {string} startAt
 * @property {string} endAt
 * @property {string|null} recurrenceGroup
 * @property {'ACTIVE'|'CANCELLED'} status
 * @property {string|null} createdBy
 * @property {string|null} createdByName
 * @property {string|null} cancelledAt
 * @property {string|null} cancelledBy
 * @property {string|null} cancelledByName
 * @property {string|null} cancellationReason
 */

/**
 * @typedef {Object} BlockPage
 * @property {AdminBlock[]} items
 * @property {number} page
 * @property {number} size
 * @property {number} totalElements
 */

export const administratorName = (name) => name?.trim() || 'Administrador no disponible'

export const cancellationReasonLength = (reason) => Array.from(reason.trim()).length

export const canCancelBlock = (block, now) =>
  block.status === 'ACTIVE' && now < new Date(block.endAt).getTime()

export const formatBlockInstant = (instant) =>
  new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(instant))

/**
 * Las fechas del filtro incluyen ambos días; la API recibe [from, to).
 * @returns {Promise<BlockPage>}
 */
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

/** @returns {Promise<AdminBlock>} */
export const cancelBlock = (id, reason) =>
  api(`/admin/blocks/${encodeURIComponent(id)}/cancellation`, {
    method: 'POST',
    body: { reason: reason.trim() },
  })
