// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect, useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const http = vi.hoisted(() => ({ token: 'admin-before-otp', listener: null, api: vi.fn() }))
vi.mock('@/lib/api', () => ({
  api: http.api,
  getToken: () => http.token,
  setToken: (token) => { http.token = token },
  errorMessage: (err) => err.message ?? 'Error',
  onSessionProblem: (listener) => {
    http.listener = listener
    return () => { http.listener = null }
  },
}))
// Se ejercitan el diálogo, sus peticiones y el proveedor; solo se sustituye
// el widget visual de seis casillas, que se verifica en navegador.
vi.mock('@/components/app/CodeInput', () => ({
  default: ({ value, onChange, onComplete }) => (
    <input aria-label="Código OTP" value={value} onChange={(event) => {
      onChange(event.target.value)
      if (event.target.value.length === 6) onComplete(event.target.value)
    }} />
  ),
}))
import { AppProvider, useApp } from '@/store'
import { ApiError } from '@/lib/apiError'

const responses = {
  '/me': { id: 'admin-uuid', name: 'Admin', role: 'ADMIN', email: 'admin@unimagdalena.edu.co' },
  '/rules': { reservation: {}, quota: {}, cancellation: {}, checkIn: {}, reminder: {}, sanctions: {} },
  '/spaces': { spaces: [] },
  '/reservations/mine': { reservations: [] },
  '/quota/me': { weekStart: '2026-11-23T00:00:00-05:00' },
  '/auth/reauth/code': null,
  '/auth/reauth/verify': { token: 'admin-after-otp' },
}
let app
let mounts
function Operation() {
  const [reason, setReason] = useState('Motivo conservado')
  const [result, setResult] = useState('')
  useEffect(() => { mounts++ }, [])
  const { withReauth } = useApp()
  return (
    <>
      <input aria-label="Motivo pendiente" value={reason} onChange={(event) => setReason(event.target.value)} />
      <button onClick={async () => {
        try {
          const response = await withReauth(() => http.api('/admin/blocks/block-id/cancellation', {
            method: 'POST', body: { reason },
          }))
          setResult(response.cancellationReason)
        } catch (error) { setResult(error.code) }
      }}>Cancelar franja</button>
      <p role="status">{result}</p>
    </>
  )
}
function SessionScreen() {
  const state = useApp()
  useEffect(() => { app = state }, [state])
  return state.dataLoaded ? <Operation /> : <p>Cargando datos</p>
}
const renderSession = async () => {
  render(<AppProvider><SessionScreen /></AppProvider>)
  await screen.findByRole('button', { name: 'Cancelar franja' })
}

beforeEach(() => {
  mounts = 0
  http.token = 'admin-before-otp'
  let attempts = 0
  http.api.mockReset().mockImplementation(async (path) => {
    if (path.endsWith('/cancellation')) {
      if (++attempts === 1) throw new ApiError(403, { code: 'REAUTH_REQUIRED' })
      return { cancellationReason: 'Cancelación registrada' }
    }
    return responses[path]
  })
})
afterEach(cleanup)

it('recorre REAUTH_REQUIRED → código → nuevo token → un reintento sin desmontar la operación', async () => {
  await renderSession()
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar franja' }))
  await screen.findByRole('dialog', { name: 'Confirma que eres tú' })
  await waitFor(() => expect(http.api).toHaveBeenCalledWith('/auth/reauth/code', expect.objectContaining({ method: 'POST' })))
  fireEvent.change(screen.getByLabelText('Código OTP'), { target: { value: '123456' } })
  await screen.findByText('Cancelación registrada')
  expect(http.token).toBe('admin-after-otp')
  expect(screen.getByLabelText('Motivo pendiente').value).toBe('Motivo conservado')
  expect(mounts).toBe(1)
  expect(http.api.mock.calls.filter(([path]) => path === '/spaces')).toHaveLength(1)
  expect(http.api.mock.calls.filter(([path]) => path.endsWith('/cancellation')).map(([, opts]) => opts.body))
    .toEqual([{ reason: 'Motivo conservado' }, { reason: 'Motivo conservado' }])
})

it('cancelar OTP no reintenta la acción ni borra el motivo', async () => {
  await renderSession()
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar franja' }))
  await screen.findByRole('dialog', { name: 'Confirma que eres tú' })
  fireEvent.click(screen.getByRole('button', { name: /cerrar|close/i }))
  await screen.findByText('REAUTH_CANCELLED')
  expect(http.api.mock.calls.filter(([path]) => path.endsWith('/cancellation'))).toHaveLength(1)
  expect(screen.getByLabelText('Motivo pendiente').value).toBe('Motivo conservado')
})

it('no acepta un OTP tardío después de cerrar sesión', async () => {
  let verify
  http.api.mockImplementation(async (path) => {
    if (path.endsWith('/cancellation')) throw new ApiError(403, { code: 'REAUTH_REQUIRED' })
    if (path === '/auth/reauth/verify') return new Promise((resolve) => { verify = resolve })
    return responses[path]
  })
  await renderSession()
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar franja' }))
  await screen.findByRole('dialog', { name: 'Confirma que eres tú' })
  fireEvent.change(screen.getByLabelText('Código OTP'), { target: { value: '123456' } })
  await waitFor(() => expect(verify).toBeTypeOf('function'))
  await act(async () => { await app.logout() })
  await act(async () => verify({ token: 'late-token' }))
  expect(http.token).toBeNull()
  expect(app.me).toBeNull()
  expect(http.api.mock.calls.filter(([path]) => path.endsWith('/cancellation'))).toHaveLength(1)
})

it('un código inválido permite otro intento sin repetir la cancelación antes de autenticar', async () => {
  let attempts = 0
  http.api.mockImplementation(async (path) => {
    if (path.endsWith('/cancellation')) {
      if (http.token === 'admin-before-otp') throw new ApiError(403, { code: 'REAUTH_REQUIRED' })
      return { cancellationReason: 'Cancelación registrada' }
    }
    if (path === '/auth/reauth/verify' && ++attempts === 1) {
      throw new ApiError(400, { code: 'CODE_INVALID', message: 'Código inválido', details: { attemptsRemaining: 4 } })
    }
    return responses[path]
  })
  await renderSession()
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar franja' }))
  await screen.findByRole('dialog', { name: 'Confirma que eres tú' })
  fireEvent.change(screen.getByLabelText('Código OTP'), { target: { value: '111111' } })
  await screen.findByText('Código inválido Te quedan 4 intentos.')
  expect(http.api.mock.calls.filter(([path]) => path.endsWith('/cancellation'))).toHaveLength(1)
  fireEvent.change(screen.getByLabelText('Código OTP'), { target: { value: '123456' } })
  await screen.findByText('Cancelación registrada')
})
