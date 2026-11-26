import { beforeEach, expect, it, vi } from 'vitest'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
import { api } from '@/lib/api'
import { administratorName, canCancelBlock, cancelBlock, cancellationReasonLength, formatBlockInstant, listBlocks } from '@/lib/blocks'

beforeEach(() => api.mockReset())

it('traduce días inclusivos a un intervalo con offset y preserva la paginación base cero', () => {
  const controller = new AbortController()
  listBlocks({ spaceId: 'space', from: '2026-11-01', through: '2026-11-30', status: 'CANCELLED', page: 2, size: 20 }, controller.signal)
  expect(api).toHaveBeenCalledWith('/admin/blocks', {
    query: { spaceId: 'space', from: '2026-11-01T00:00:00-05:00', to: '2026-12-01T00:00:00-05:00', status: 'CANCELLED', page: 2, size: 20 },
    signal: controller.signal,
  })
})

it('cancela por ID y envía el motivo recortado, no el texto del calendario', () => {
  cancelBlock('block-id', '  Clase suspendida  ')
  expect(api).toHaveBeenCalledWith('/admin/blocks/block-id/cancellation', {
    method: 'POST', body: { reason: 'Clase suspendida' },
  })
})

it('cuenta puntos de código Unicode y no unidades UTF-16', () => {
  expect(cancellationReasonLength(`  ${'🏀'.repeat(1000)}  `)).toBe(1000)
  expect(cancellationReasonLength(' \n ')).toBe(0)
})

it('ACTIVE no garantiza elegibilidad y el límite de fin es exclusivo', () => {
  const block = { status: 'ACTIVE', endAt: '2026-11-25T15:00:00-05:00' }
  const end = Date.parse(block.endAt)
  expect(canCancelBlock(block, end - 1)).toBe(true)
  expect(canCancelBlock(block, end)).toBe(false)
  expect(canCancelBlock({ ...block, status: 'CANCELLED' }, end - 1)).toBe(false)
})

it('presenta fecha, año y hora en Bogotá sin depender de la zona del navegador', () => {
  const text = formatBlockInstant('2026-11-26T01:30:00Z')
  expect(text).toContain('25')
  expect(text).toContain('2026')
  expect(text).toMatch(/8:30:00|20:30:00/)
})

it('presenta el nombre recortado o el respaldo sin sustituirlo por un identificador', () => {
  expect(administratorName('  Ana Martínez  ')).toBe('Ana Martínez')
  for (const name of [null, undefined, '', ' \n ']) {
    expect(administratorName(name)).toBe('Administrador no disponible')
  }
})

it('preserva los nuevos campos de identidad y nombre en listado y cancelación', async () => {
  const block = {
    id: 'block', createdBy: 'creator-id', createdByName: 'Ana Martínez',
    cancelledBy: 'canceller-id', cancelledByName: 'Carlos Pérez',
  }
  const page = { items: [block], page: 0, size: 20, totalElements: 1 }
  api.mockResolvedValueOnce(page).mockResolvedValueOnce(block)
  expect(await listBlocks({ spaceId: 'space', from: '2026-11-01', through: '2026-11-30', page: 0, size: 20 })).toBe(page)
  expect(await cancelBlock('block', 'Motivo')).toBe(block)
})
