// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const http = vi.hoisted(() => ({ api: vi.fn() }))
const store = vi.hoisted(() => ({ current: null }))

vi.mock('@/lib/api', () => ({
  api: http.api,
  errorMessage: (err, fallback = 'Ocurrió un error inesperado.') => err?.message ?? fallback,
}))

vi.mock('@/store', () => ({
  useApp: () => store.current,
}))

import CheckIn from '@/pages/student/CheckIn'

const SPACE = 'space-1'
const SPACE_NAME = 'Cancha múltiple 1'
const SETTINGS = { checkinAntesMin: 10, checkinCierraAlFinal: false, checkinCierraMinDespues: 60 }

// DTO crudo de GET /checkin/{spaceId}/reservations (dos reservas propias consecutivas).
const ITEMS = [
  {
    reservationId: 'res-a',
    spaceId: SPACE,
    startAt: '2026-11-24T14:00:00-05:00',
    endAt: '2026-11-24T15:00:00-05:00',
    opensAt: '2026-11-24T13:50:00-05:00',
    closesAt: '2026-11-24T16:00:00-05:00',
  },
  {
    reservationId: 'res-b',
    spaceId: SPACE,
    startAt: '2026-11-24T15:00:00-05:00',
    endAt: '2026-11-24T16:00:00-05:00',
    opensAt: '2026-11-24T14:50:00-05:00',
    closesAt: '2026-11-24T17:00:00-05:00',
  },
]

const mappedReservation = (over = {}) => ({
  id: 'res-x',
  spaceId: SPACE,
  spaceName: SPACE_NAME,
  date: '2026-11-24',
  startHour: 16,
  endHour: 17,
  hours: 1,
  startAt: '2026-11-24T16:00:00-05:00',
  endAt: '2026-11-24T17:00:00-05:00',
  estado: 'confirmada',
  checkedInAt: null,
  equipment: [],
  ...over,
})

const mockStore = (reservations = []) => {
  store.current = {
    spaceById: (id) => (id === SPACE ? { name: SPACE_NAME } : null),
    reservations,
    refreshReservations: vi.fn().mockResolvedValue([]),
    settings: SETTINGS,
  }
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={[`/checkin/${SPACE}`]}>
      <Routes>
        <Route path="/checkin/:spaceId" element={<CheckIn />} />
      </Routes>
    </MemoryRouter>
  )

const confirmButtons = () => screen.getAllByRole('button', { name: 'Confirmar asistencia' })

beforeEach(() => {
  http.api.mockReset()
})

afterEach(cleanup)

it('muestra las reservas elegibles y confirma la elegida por identificador', async () => {
  mockStore()
  let remaining = ITEMS
  http.api.mockImplementation(async (path, opts = {}) => {
    if (path === `/checkin/${SPACE}/reservations` && !opts.method) return remaining
    if (path === `/checkin/${SPACE}/reservations/res-a` && opts.method === 'POST') {
      remaining = ITEMS.filter((item) => item.reservationId !== 'res-a')
      return { reservationId: 'res-a', spaceId: SPACE, status: 'IN_USE', checkedInAt: '2026-11-24T14:01:00-05:00' }
    }
    throw new Error(`Ruta inesperada: ${path} ${opts.method ?? 'GET'}`)
  })

  renderPage()

  // Dos elegibles consecutivas, cada una con su ventana y su botón.
  expect((await screen.findAllByText(/24 de noviembre/))).toHaveLength(2)
  await waitFor(() => expect(confirmButtons()).toHaveLength(2))
  expect(screen.getByText(/1:50 p. m./)).toBeTruthy()
  expect(screen.getByText(/5:00 p. m./)).toBeTruthy()

  fireEvent.click(confirmButtons()[0])

  // Confirma por identificador (RN-33) y vuelve a consultar la lista.
  await waitFor(() =>
    expect(http.api).toHaveBeenCalledWith(`/checkin/${SPACE}/reservations/res-a`, { method: 'POST' })
  )
  expect(await screen.findByText(/Asistencia confirmada/)).toBeTruthy()
  expect(screen.getByText(/«En uso»/)).toBeTruthy()
  await waitFor(() => expect(confirmButtons()).toHaveLength(1))
  const listCalls = http.api.mock.calls.filter(([path, opts]) => path === `/checkin/${SPACE}/reservations` && !opts?.method)
  expect(listCalls).toHaveLength(2)
})

it('admite la respuesta COMPLETED de una confirmación tardía', async () => {
  mockStore()
  http.api.mockImplementation(async (path, opts = {}) => {
    if (path === `/checkin/${SPACE}/reservations` && !opts.method) return [ITEMS[0]]
    if (path === `/checkin/${SPACE}/reservations/res-a` && opts.method === 'POST') {
      return { reservationId: 'res-a', spaceId: SPACE, status: 'COMPLETED', checkedInAt: '2026-11-24T16:30:00-05:00' }
    }
    throw new Error(`Ruta inesperada: ${path} ${opts.method ?? 'GET'}`)
  })

  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar asistencia' }))

  expect(await screen.findByText(/Registro tardío/)).toBeTruthy()
  expect(screen.getByText(/«Completada»/)).toBeTruthy()
})

it('muestra el motivo cuando el check-in falla (RN-35)', async () => {
  mockStore()
  http.api.mockImplementation(async (path, opts = {}) => {
    if (path === `/checkin/${SPACE}/reservations` && !opts.method) return [ITEMS[0]]
    if (path === `/checkin/${SPACE}/reservations/res-a` && opts.method === 'POST') {
      throw { status: 409, code: 'CHECKIN_WINDOW_CLOSED', message: 'La ventana de check-in ya cerró.' }
    }
    throw new Error(`Ruta inesperada: ${path} ${opts.method ?? 'GET'}`)
  })

  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar asistencia' }))

  expect(await screen.findByText('La ventana de check-in cerró')).toBeTruthy()
  expect(screen.getByText(/La ventana de check-in ya cerró/)).toBeTruthy()
})

it('explica el estado vacío y cuándo abre la ventana de su reserva de hoy', async () => {
  mockStore([mappedReservation()])
  http.api.mockImplementation(async (path) => {
    if (path === `/checkin/${SPACE}/reservations`) return []
    throw new Error(`Ruta inesperada: ${path}`)
  })

  renderPage()

  expect(await screen.findByText(/No hay reservas propias elegibles/)).toBeTruthy()
  expect(screen.getByText(/abre para check-in a las 3:50 p. m./)).toBeTruthy()
})

it('muestra el resultado cuando la reserva ya está en uso', async () => {
  mockStore([mappedReservation({ id: 'res-a', estado: 'en-uso', checkedInAt: '2026-11-24T14:01:00-05:00' })])
  http.api.mockImplementation(async (path) => {
    if (path === `/checkin/${SPACE}/reservations`) return []
    throw new Error(`Ruta inesperada: ${path}`)
  })

  renderPage()

  expect(await screen.findByText(/Asistencia confirmada/)).toBeTruthy()
  expect(screen.getByText(/«En uso»/)).toBeTruthy()
  // Repetir no vuelve a llamar al POST (RN-33: repetición inequívoca por identificador).
  await waitFor(() => expect(http.api.mock.calls.filter(([, opts]) => opts?.method === 'POST')).toHaveLength(0))
  expect(screen.queryByRole('button', { name: 'Confirmar asistencia' })).toBeNull()
})
