// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const http = vi.hoisted(() => ({ api: vi.fn() }))
vi.mock('@/lib/api', () => ({ api: http.api, errorMessage: (error) => error.message }))
vi.mock('@/lib/useAdminSpaces', () => ({
  default: () => ({
    spaces: [{ id: 'space-a', name: 'Cancha de prueba', open: 8, close: 20, aforo: 10, estado: 'activo' }],
    loaded: true, error: null, reload: vi.fn(),
  }),
}))
vi.mock('@/lib/useSpaceImage', () => ({ default: () => null }))
vi.mock('@/lib/useAvailabilityRevision', () => ({ default: () => 0 }))
vi.mock('@/components/app/AnimatedNumber', () => ({ default: ({ value }) => <span>{value}</span> }))
vi.mock('@/components/smoothui/select', () => ({
  default: ({ options, onValueChange, ...props }) => (
    <select {...props} onChange={(event) => onValueChange(event.target.value)}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  ),
}))
// Se comprueba el rango y los datos enviados al calendario compartido, no su presentación.
vi.mock('@/components/app/WeekCalendar', () => ({
  default: ({ days, slotsForDay, readOnly }) => (
    <ol aria-label="Fechas del calendario" data-readonly={readOnly}>
      {days.map((date) => (
        <li key={date}>{date}: {slotsForDay(date).map((slot) => slot.estado).join(',')}</li>
      ))}
    </ol>
  ),
}))

import AdminPanel from '@/pages/admin/AdminPanel'
import { addDays } from '@/data/domain'

const occupancyDates = () => http.api.mock.calls
  .filter(([path]) => path === '/admin/occupancy')
  .map(([, options]) => options.query.date)

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-25T15:00:00-05:00'))
  http.api.mockReset().mockImplementation(async (path, { query }) => {
    if (path === '/admin/indicators') return {
      from: '2026-11-23T00:00:00-05:00', to: '2026-11-30T00:00:00-05:00',
      reservations: 0, lateCancellations: 0, noShows: 0, suspendedUsers: 0,
    }
    return { spaces: [{ slots: [{
      startAt: `${query.date}T08:00:00-05:00`, status: 'OCCUPIED', reservationId: 'reservation-a',
    }] }] }
  })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it.each([
  ['2026-11-25T15:00:00-05:00', '2026-11-25'],
  ['2026-11-29T15:00:00-05:00', '2026-11-29'],
  ['2027-01-01T02:00:00Z', '2026-12-31'],
])('consulta hoy y los seis días siguientes según Bogotá (%s)', async (instant, today) => {
  vi.setSystemTime(new Date(instant))
  render(<AdminPanel />)
  const expected = Array.from({ length: 7 }, (_, index) => addDays(today, index))
  await waitFor(() => expect(occupancyDates()).toEqual(expected))
  await waitFor(() => expect(screen.getByText(`${expected[6]}: ocupada`)).toBeTruthy())
  const calendar = screen.getByRole('list', { name: 'Fechas del calendario' })
  expect(calendar.firstElementChild.textContent).toBe(`${today}: ocupada`)
  expect(calendar.getAttribute('data-readonly')).toBe('true')
  expect(screen.getByLabelText('Semana').selectedOptions[0].textContent).toContain('Próximos 7 días')
})

it('mantiene la navegación semanal y vuelve al rango que comienza hoy', async () => {
  render(<AdminPanel />)
  await waitFor(() => expect(occupancyDates()).toHaveLength(7))
  fireEvent.click(screen.getByRole('button', { name: 'Semana siguiente' }))
  await waitFor(() => expect(occupancyDates().slice(-7)).toEqual(
    Array.from({ length: 7 }, (_, index) => addDays('2026-12-02', index)),
  ))
  fireEvent.click(screen.getByRole('button', { name: 'Volver a hoy' }))
  await waitFor(() => expect(occupancyDates().slice(-7)).toEqual(
    Array.from({ length: 7 }, (_, index) => addDays('2026-11-25', index)),
  ))
  fireEvent.click(screen.getByRole('button', { name: 'Semana anterior' }))
  await waitFor(() => expect(occupancyDates().slice(-7)).toEqual(
    Array.from({ length: 7 }, (_, index) => addDays('2026-11-18', index)),
  ))
})
