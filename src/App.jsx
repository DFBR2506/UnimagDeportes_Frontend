import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { ClipboardList, Dumbbell, Gauge, QrCode, ScrollText, SquareStack } from 'lucide-react'
import { AppProvider, useApp } from '@/store'
import Shell from '@/components/app/Shell'
import SubnavLayout from '@/components/app/SubnavLayout'
import AuthLayout from '@/pages/auth/AuthLayout'
import Welcome from '@/pages/auth/Welcome'
import RequestCode from '@/pages/auth/RequestCode'
import EnterCode from '@/pages/auth/EnterCode'
import FirstLogin from '@/pages/auth/FirstLogin'
import EmailNotAllowed from '@/pages/auth/EmailNotAllowed'
import Home from '@/pages/student/Home'
import CourtPicker from '@/pages/student/CourtPicker'
import CourtSchedule from '@/pages/student/CourtSchedule'
import ConfirmReservation from '@/pages/student/ConfirmReservation'
import ReservationConfirmed from '@/pages/student/ReservationConfirmed'
import Conflict from '@/pages/student/Conflict'
import MyReservations from '@/pages/student/MyReservations'
import CancelReservation from '@/pages/student/CancelReservation'
import Quota from '@/pages/student/Quota'
import Rules from '@/pages/student/Rules'
import CheckIn from '@/pages/student/CheckIn'
import AdminPanel from '@/pages/admin/AdminPanel'
import AdminSpaces from '@/pages/admin/AdminSpaces'
import AdminEquipment from '@/pages/admin/AdminEquipment'
import AdminBlocks from '@/pages/admin/AdminBlocks'
import AdminRules from '@/pages/admin/AdminRules'
import AdminQR from '@/pages/admin/AdminQR'

const RESERVATION_TABS = [
  { id: '/app/mis-reservas', label: 'Reservas', icon: <ClipboardList className="size-4" /> },
  { id: '/app/mis-reservas/cuota', label: 'Mi cuota', icon: <Gauge className="size-4" /> },
  { id: '/app/mis-reservas/reglas', label: 'Reglas de uso', icon: <ScrollText className="size-4" /> },
]

const SPACE_TABS = [
  { id: '/admin/espacios', label: 'Espacios', icon: <SquareStack className="size-4" /> },
  { id: '/admin/espacios/implementos', label: 'Implementos', icon: <Dumbbell className="size-4" /> },
  { id: '/admin/espacios/qr', label: 'Generar QR', icon: <QrCode className="size-4" /> },
]

function RootRedirect() {
  const { token, me } = useApp()
  if (!token) return <Navigate to="/bienvenida" replace />
  if (!me) return null // el Shell resuelve la sesión al entrar
  return <Navigate to={me.role === 'ADMIN' ? '/admin' : '/app/inicio'} replace />
}

/** Enlace de cancelación de los correos (APP_MAIL_CANCELLATION_URL = …/reservations/{id}/cancel). */
function CancelLinkRedirect() {
  const { id } = useParams()
  return <Navigate to={`/app/mis-reservas/cancelar/${id}`} replace />
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<AuthLayout />}>
            <Route path="/bienvenida" element={<Welcome />} />
            <Route path="/acceso" element={<RequestCode />} />
            <Route path="/acceso/codigo" element={<EnterCode />} />
            <Route path="/acceso/nombre" element={<FirstLogin />} />
            <Route path="/acceso/no-permitido" element={<EmailNotAllowed />} />
          </Route>

          <Route element={<Shell variant="student" />}>
            <Route path="/app/inicio" element={<Home />} />
            <Route path="/app/disponibilidad" element={<CourtPicker />} />
            <Route path="/app/disponibilidad/:spaceId" element={<CourtSchedule />} />
            <Route path="/app/reservar" element={<ConfirmReservation />} />
            <Route path="/app/reserva-confirmada/:id" element={<ReservationConfirmed />} />
            <Route path="/app/conflicto" element={<Conflict />} />
            <Route path="/app/mis-reservas" element={<SubnavLayout tabs={RESERVATION_TABS} />}>
              <Route index element={<MyReservations />} />
              <Route path="cuota" element={<Quota />} />
              <Route path="reglas" element={<Rules />} />
            </Route>
            <Route path="/app/mis-reservas/cancelar/:id" element={<CancelReservation />} />
            {/* Rutas antiguas: cuota y reglas ahora viven dentro de Mis reservas */}
            <Route path="/app/mi-cuota" element={<Navigate to="/app/mis-reservas/cuota" replace />} />
            <Route path="/app/reglas" element={<Navigate to="/app/mis-reservas/reglas" replace />} />
            {/* APP_MAIL_CONTACT_URL: abre el formulario de contacto (botón flotante) */}
            <Route
              path="/app/contacto"
              element={<Navigate to="/app/inicio" replace state={{ openContact: true }} />}
            />
            {/* RN-32: enlace fijo del QR por espacio (requiere sesión; vuelve aquí tras el login) */}
            <Route path="/checkin/:spaceId" element={<CheckIn />} />
          </Route>

          <Route path="/reservations/:id/cancel" element={<CancelLinkRedirect />} />

          <Route element={<Shell variant="admin" />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route
              path="/admin/espacios"
              element={<SubnavLayout className="max-w-6xl" tabs={SPACE_TABS} />}
            >
              <Route index element={<AdminSpaces />} />
              <Route path="implementos" element={<AdminEquipment />} />
              <Route path="qr" element={<AdminQR />} />
            </Route>
            <Route path="/admin/bloqueos" element={<AdminBlocks />} />
            <Route path="/admin/reglas" element={<AdminRules />} />
            <Route path="/admin/qr" element={<Navigate to="/admin/espacios/qr" replace />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
