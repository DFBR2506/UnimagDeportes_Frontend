// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const http = vi.hoisted(() => ({ api: vi.fn() }))
const session = vi.hoisted(() => ({ current: null }))
vi.mock('@/lib/api', () => ({
  api: http.api,
  errorMessage: (err) => err?.message ?? 'Error de conexión',
  openEventStream: () => () => {},
}))
vi.mock('@/store', () => ({ useApp: () => session.current }))
// Los filtros se prueban sin depender del portal/animación del select.
vi.mock('@/components/smoothui/select', () => ({
  default: ({ options, onValueChange, ...props }) => (
    <select {...props} onChange={(event) => onValueChange(event.target.value)}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  ),
}))

import AdminBlockHistory from '@/components/app/AdminBlockHistory'
import { onAvailabilityChanged } from '@/lib/availabilityEvents'
import { ApiError } from '@/lib/apiError'

const block = {
  id: 'block-a', spaceId: 'space-a', type: 'CLASS', reason: 'Mismo motivo visible',
  startAt: '2099-11-26T08:00:00-05:00', endAt: '2099-11-26T09:00:00-05:00',
  recurrenceGroup: 'group-a', status: 'ACTIVE',
  createdBy: 'creator-id', createdByName: 'Ana Martínez',
  cancelledByName: null,
  cancelledAt: null, cancelledBy: null, cancellationReason: null,
}
const props = {
  spaces: [{ id: 'space-a', name: 'Cancha múltiple' }], loaded: true, spacesError: null, reloadSpaces: vi.fn(),
}
const page = (items = [block], overrides = {}) => ({ items, page: 0, size: 20, totalElements: items.length, ...overrides })
const renderHistory = () => render(<AdminBlockHistory {...props} />)
const confirm = () => screen.getByRole('button', { name: 'Confirmar cancelación' })
const openCancellation = async () => {
  fireEvent.click((await screen.findAllByRole('button', { name: 'Cancelar bloqueo' }))[0])
  return screen.findByRole('dialog', { name: 'Cancelar bloqueo' })
}

beforeEach(() => {
  http.api.mockReset().mockResolvedValue(page())
  session.current = { token: 'admin-token', isAdmin: true, withReauth: (fn) => fn() }
})
afterEach(cleanup)

it('selecciona por ID, pide motivo y confirmación, y no libera franjas de forma optimista', async () => {
  let finish
  http.api.mockImplementation((path) => path.endsWith('/cancellation')
    ? new Promise((resolve) => { finish = resolve })
    : Promise.resolve(page([block, { ...block, id: 'block-b' }])))
  const invalidations = []
  const unsubscribe = onAvailabilityChanged((id) => invalidations.push(id))
  try {
    renderHistory()
    const dialog = await openCancellation()
    expect(within(dialog).queryByText(/ID:/)).toBeNull()
    expect(within(dialog).getByText('Creado por: Ana Martínez')).toBeTruthy()
    expect(within(dialog).getByText(/8:00:00.*9:00:00/)).toBeTruthy()
    expect(within(dialog).getByText('Las reservas canceladas anteriormente no se reactivarán.')).toBeTruthy()
    expect(within(dialog).getByText(/no toda la recurrencia/)).toBeTruthy()
    expect(confirm().disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Motivo de cancelación'), { target: { value: '  Clase suspendida  ' } })
    fireEvent.click(confirm())
    fireEvent.submit(within(dialog).getByRole('button', { name: 'Confirmar cancelación' }).closest('form'))
    expect(http.api.mock.calls.filter(([path]) => path.endsWith('/cancellation'))).toHaveLength(1)
    expect(http.api).toHaveBeenCalledWith('/admin/blocks/block-a/cancellation', {
      method: 'POST', body: { reason: 'Clase suspendida' },
    })
    expect(invalidations).toEqual([])
    await act(async () => finish({ ...block, status: 'CANCELLED', cancellationReason: 'Primer motivo registrado' }))
    expect(invalidations).toEqual(['space-a'])
    expect(await screen.findByText(/Motivo registrado: Primer motivo registrado/)).toBeTruthy()
  } finally {
    unsubscribe()
  }
})

it('muestra historial persistido y no ofrece cancelar filas finalizadas o ya canceladas', async () => {
  http.api.mockResolvedValue(page([
    { ...block, endAt: '2000-11-26T09:00:00-05:00' },
    { ...block, id: 'block-c', status: 'CANCELLED', cancelledBy: 'admin-uuid', cancelledByName: 'Carlos Pérez', cancelledAt: '2026-11-25T10:00:00-05:00', cancellationReason: 'Motivo histórico' },
  ]))
  renderHistory()
  expect(await screen.findByText('Motivo histórico')).toBeTruthy()
  expect(screen.getByText('Carlos Pérez')).toBeTruthy()
  expect(screen.queryByText('admin-uuid')).toBeNull()
  expect(screen.getByText(/Franja finalizada/)).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Cancelar bloqueo' })).toBeNull()
})

it('valida Unicode y conserva el motivo al volver de una reautenticación cancelada', async () => {
  session.current.withReauth = vi.fn().mockRejectedValue({ code: 'REAUTH_CANCELLED' })
  renderHistory()
  await openCancellation()
  const input = screen.getByLabelText('Motivo de cancelación')
  fireEvent.change(input, { target: { value: '🏀'.repeat(1001) } })
  expect(confirm().disabled).toBe(true)
  fireEvent.change(input, { target: { value: '🏀'.repeat(1000) } })
  expect(confirm().disabled).toBe(false)
  fireEvent.click(confirm())
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Conservamos el motivo'))
  expect(input.value).toBe('🏀'.repeat(1000))
})

it('reintenta con el mismo motivo después de un resultado incierto, incluso tras el fin', async () => {
  let now = Date.parse(block.endAt) - 1000
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  let attempts = 0
  http.api.mockImplementation(async (path) => {
    if (!path.endsWith('/cancellation')) return page()
    if (++attempts === 1) throw new ApiError(0, { message: 'Respuesta perdida' })
    return { ...block, status: 'CANCELLED', cancellationReason: 'Original' }
  })
  renderHistory()
  await openCancellation()
  const input = screen.getByLabelText('Motivo de cancelación')
  fireEvent.change(input, { target: { value: 'Original' } })
  fireEvent.click(confirm())
  await screen.findByText('Respuesta perdida')
  expect(input.readOnly).toBe(true)
  now += 2000
  fireEvent.click(confirm())
  await screen.findByText(/Motivo registrado: Original/)
  expect(http.api.mock.calls.filter(([path]) => path.endsWith('/cancellation')).map(([, options]) => options.body))
    .toEqual([{ reason: 'Original' }, { reason: 'Original' }])
})

it('conserva el reintento tras perder el cuerpo HTTP 200 y finalizar la franja', async () => {
  const actual = await vi.importActual('@/lib/api')
  let now = Date.parse(block.endAt) - 1000
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(new ReadableStream({
      start(controller) { controller.error(new TypeError('Cuerpo interrumpido')) },
    }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ ...block, status: 'CANCELLED', cancellationReason: 'Motivo antes del fin' })))
  vi.stubGlobal('fetch', fetch)
  http.api.mockImplementation((path, options) => path.endsWith('/cancellation')
    ? actual.api(path, options)
    : Promise.resolve(page()))
  try {
    renderHistory()
    await openCancellation()
    const input = screen.getByLabelText('Motivo de cancelación')
    fireEvent.change(input, { target: { value: 'Motivo antes del fin' } })
    fireEvent.click(confirm())
    await screen.findByText('No se pudo leer la respuesta del servidor. Intenta de nuevo.')
    expect(input.readOnly).toBe(true)
    now += 2000
    fireEvent.click(confirm())
    await screen.findByText(/Motivo registrado: Motivo antes del fin/)
    expect(fetch.mock.calls.map(([, options]) => JSON.parse(options.body)))
      .toEqual([{ reason: 'Motivo antes del fin' }, { reason: 'Motivo antes del fin' }])
  } finally {
    vi.unstubAllGlobals()
  }
})

it.each([
  [404, 'BLOCK_NOT_FOUND'],
  [409, 'BLOCK_NOT_CANCELLABLE'],
  [403, 'FORBIDDEN'],
  [400, 'VALIDATION_ERROR'],
])('presenta el error %s %s sin anunciar éxito', async (status, code) => {
  http.api.mockImplementation(async (path) => {
    if (path.endsWith('/cancellation')) throw new ApiError(status, { code, message: `Error ${code}` })
    return page()
  })
  renderHistory()
  await openCancellation()
  fireEvent.change(screen.getByLabelText('Motivo de cancelación'), { target: { value: 'Motivo' } })
  fireEvent.click(confirm())
  expect(await screen.findByText(`Error ${code}`)).toBeTruthy()
  expect(screen.queryByText(/Bloqueo cancelado\./)).toBeNull()
  if (status === 404 || status === 409) {
    expect(confirm().disabled).toBe(true)
    await waitFor(() => expect(http.api.mock.calls.filter(([path]) => path === '/admin/blocks').length).toBeGreaterThan(1))
  }
})

it('pagina desde cero y reinicia la página al cambiar los filtros', async () => {
  http.api.mockImplementation(async (_path, { query }) => page([], { page: query.page, totalElements: 41 }))
  renderHistory()
  await screen.findByText('Página 1 de 3')
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  await screen.findByText('Página 2 de 3')
  fireEvent.change(screen.getByLabelText('Estado del bloqueo'), { target: { value: 'CANCELLED' } })
  await screen.findByText('Página 1 de 3')
  expect(http.api.mock.lastCall[1].query).toMatchObject({ page: 0, status: 'CANCELLED' })
})

it('descarta respuestas antiguas y permite reintentar un error de consulta', async () => {
  let finishOld
  http.api.mockImplementationOnce(() => new Promise((resolve) => { finishOld = resolve }))
  renderHistory()
  await waitFor(() => expect(http.api).toHaveBeenCalledTimes(1))
  http.api.mockRejectedValueOnce(new ApiError(503, { message: 'Consulta no disponible' }))
  fireEvent.change(screen.getByLabelText('Estado del bloqueo'), { target: { value: 'CANCELLED' } })
  await screen.findByText('Consulta no disponible')
  await act(async () => finishOld(page()))
  expect(screen.queryByRole('button', { name: 'Cancelar bloqueo' })).toBeNull()
  http.api.mockResolvedValue(page([]))
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar consulta' }))
  expect(await screen.findByText('No hay bloqueos para estos filtros.')).toBeTruthy()
})

it('no consulta ni ofrece acciones administrativas a estudiantes', () => {
  session.current.isAdmin = false
  renderHistory()
  expect(http.api).not.toHaveBeenCalled()
  expect(screen.queryByText('Bloqueos e historial')).toBeNull()
})

it('muestra el estado de carga hasta que llega la consulta y después presenta las tarjetas', async () => {
  let finish
  http.api.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
  const { container } = renderHistory()
  expect(screen.getByRole('status').textContent).toBe('Consultando bloqueos…')
  expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Cancelar bloqueo' })).toBeNull()
  await act(async () => finish(page()))
  expect(await screen.findByRole('heading', { name: 'Cancha múltiple' })).toBeTruthy()
  expect(container.querySelector('[aria-busy="true"]')).toBeNull()
})

it('ofrece orientación al no encontrar bloqueos y conserva los controles de consulta', async () => {
  http.api.mockResolvedValue(page([]))
  renderHistory()
  expect(await screen.findByRole('heading', { name: 'No hay bloqueos para estos filtros.' })).toBeTruthy()
  expect(screen.getByText('Prueba con otro espacio, intervalo de fechas o estado.')).toBeTruthy()
  expect(screen.getByLabelText('Espacio del historial')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Actualizar historial' })).toBeTruthy()
  expect(screen.queryByRole('listitem')).toBeNull()
})

it('separa fecha y horas de Bogotá, muestra bloqueo activo y sitúa cancelar al pie de la tarjeta', async () => {
  http.api.mockResolvedValue(page([{
    ...block, startAt: '2099-11-26T13:00:00Z', endAt: '2099-11-26T14:00:00Z',
  }]))
  renderHistory()
  const card = await screen.findByRole('listitem')
  expect(within(card).queryByText('No cancelado')).toBeNull()
  expect(within(card).getByText('Bloqueo activo')).toBeTruthy()
  const cancelButton = within(card).getByRole('button', { name: 'Cancelar bloqueo' })
  expect(card.lastElementChild.contains(cancelButton)).toBe(true)
  expect(within(card).getByText('Fecha:').nextElementSibling.textContent).toBe('26/11/2099')
  expect(within(card).getByText('Hora inicio:').nextElementSibling.textContent).toMatch(/8:00/)
  expect(within(card).getByText('Hora fin:').nextElementSibling.textContent).toMatch(/9:00/)
})

it('conserva ambas fechas si la franja cruza la medianoche y distingue cancelado con el color destructivo', async () => {
  http.api.mockResolvedValue(page([{
    ...block, status: 'CANCELLED',
    startAt: '2099-11-27T04:00:00Z', endAt: '2099-11-27T06:00:00Z',
    cancelledAt: '2099-11-25T13:00:00Z', cancellationReason: 'Clase suspendida',
  }]))
  renderHistory()
  const card = await screen.findByRole('listitem')
  const date = within(card).getByText('Fecha:').nextElementSibling.textContent
  expect(date).toContain('26/11/2099')
  expect(date).toContain('27/11/2099')
  expect(within(card).getByText('Cancelado').className).toContain('text-destructive-ink')
  expect(within(card).queryByText('Bloqueo activo')).toBeNull()
  expect(within(card).queryByRole('button', { name: 'Cancelar bloqueo' })).toBeNull()
})

const UUIDS = {
  block: '11111111-1111-4111-8111-111111111111',
  space: '22222222-2222-4222-8222-222222222222',
  creator: '33333333-3333-4333-8333-333333333333',
  canceller: '44444444-4444-4444-8444-444444444444',
  recurrence: '55555555-5555-4555-8555-555555555555',
}
const uuidPattern = /\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i
const identifiedBlock = {
  ...block, id: UUIDS.block, spaceId: UUIDS.space, createdBy: UUIDS.creator,
  recurrenceGroup: UUIDS.recurrence,
}

it('muestra nombres y conserva UUID internos sin exponerlos en tarjetas ni confirmación', async () => {
  http.api.mockResolvedValue(page([identifiedBlock]))
  render(<AdminBlockHistory {...props} spaces={[{ id: UUIDS.space, name: 'Cancha múltiple' }]} />)
  const dialog = await openCancellation()
  const card = screen.getByRole('listitem', { hidden: true })
  expect(card.textContent).toContain('Creado por: Ana Martínez')
  expect(card.textContent).not.toMatch(uuidPattern)
  expect(dialog.textContent).not.toMatch(uuidPattern)
  expect(card.textContent).not.toContain('Cancelado por:')
  expect(dialog.textContent).toContain('Cancha múltiple')
  expect(dialog.textContent).toContain('Mismo motivo visible')
  fireEvent.change(screen.getByLabelText('Motivo de cancelación'), { target: { value: 'Nueva razón' } })
  fireEvent.click(confirm())
  await waitFor(() => expect(http.api).toHaveBeenCalledWith(`/admin/blocks/${UUIDS.block}/cancellation`, {
    method: 'POST', body: { reason: 'Nueva razón' },
  }))
})

it.each([null, undefined, '', '   '])('usa el respaldo para nombres ausentes (%s), nunca el UUID conocido', async (name) => {
  http.api.mockResolvedValue(page([{
    ...identifiedBlock, status: 'CANCELLED', createdByName: name,
    cancelledBy: UUIDS.canceller, cancelledByName: name,
    cancelledAt: '2026-11-25T10:00:00-05:00', cancellationReason: 'Motivo histórico',
  }]))
  renderHistory()
  await screen.findByText('Motivo histórico')
  const card = screen.getByRole('listitem')
  expect(card.textContent).toContain('Creado por: Administrador no disponible')
  expect(card.textContent).toContain('Cancelado por: Administrador no disponible')
  expect(card.textContent).toContain('Espacio no disponible')
  expect(card.textContent).not.toMatch(uuidPattern)
})

it('la confirmación tampoco usa UUID como respaldo de administrador o espacio ausentes', async () => {
  http.api.mockResolvedValue(page([{ ...identifiedBlock, createdByName: null }]))
  renderHistory()
  const dialog = await openCancellation()
  expect(dialog.textContent).toContain('Espacio no disponible')
  expect(dialog.textContent).toContain('Creado por: Administrador no disponible')
  expect(dialog.textContent).not.toMatch(uuidPattern)
})

it('vuelve a consultar y muestra los nombres actuales después de una cancelación idempotente', async () => {
  let items = [identifiedBlock]
  http.api.mockImplementation(async (path) => {
    if (path.endsWith('/cancellation')) {
      const cancelled = {
        ...identifiedBlock, status: 'CANCELLED', cancelledBy: UUIDS.canceller,
        cancelledByName: 'Carlos Pérez', cancelledAt: '2026-11-25T10:00:00-05:00',
        cancellationReason: 'Primera cancelación',
      }
      // Los nombres pueden actualizarse entre la mutación y el GET.
      items = [{ ...cancelled, createdByName: 'Ana Martínez actualizada', cancelledByName: 'Carlos Pérez actualizado' }]
      return cancelled
    }
    return page(items)
  })
  render(<AdminBlockHistory {...props} spaces={[{ id: UUIDS.space, name: 'Cancha múltiple' }]} />)
  await openCancellation()
  fireEvent.change(screen.getByLabelText('Motivo de cancelación'), { target: { value: 'Otro motivo en un reintento' } })
  fireEvent.click(confirm())
  await screen.findByText('Carlos Pérez actualizado')
  expect(screen.getByText('Ana Martínez actualizada')).toBeTruthy()
  expect(screen.getByText('Primera cancelación')).toBeTruthy()
  const card = screen.getByRole('listitem', { hidden: true })
  expect(card.textContent).toContain('Cancelado')
  expect(card.textContent).toContain('Cancha múltiple')
  expect(card.textContent).toContain('Mismo motivo visible')
  expect(card.textContent).not.toMatch(uuidPattern)
  expect(http.api.mock.calls.filter(([path]) => path === '/admin/blocks')).toHaveLength(2)
})
