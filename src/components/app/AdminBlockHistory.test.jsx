// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const http = vi.hoisted(() => ({ api: vi.fn() }))
const session = vi.hoisted(() => ({ current: null }))
vi.mock('@/lib/api', () => ({
  api: http.api,
  errorMessage: (err) => err?.message ?? 'Error de conexión',
}))
vi.mock('@/store', () => ({ useApp: () => session.current }))
vi.mock('@/lib/useAvailabilityRevision', () => ({ default: () => 0 }))
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
    expect(within(dialog).getByText('ID: block-a')).toBeTruthy()
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
    { ...block, id: 'block-c', status: 'CANCELLED', cancelledBy: 'admin-uuid', cancelledAt: '2026-11-25T10:00:00-05:00', cancellationReason: 'Motivo histórico' },
  ]))
  renderHistory()
  expect(await screen.findByText('Motivo histórico')).toBeTruthy()
  expect(screen.getByText('admin-uuid')).toBeTruthy()
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
