import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from '@/store'
import Shell from '@/components/app/Shell'
import AuthLayout from '@/pages/auth/AuthLayout'
import Welcome from '@/pages/auth/Welcome'
import RequestCode from '@/pages/auth/RequestCode'
import EnterCode from '@/pages/auth/EnterCode'
import FirstLogin from '@/pages/auth/FirstLogin'
import EmailNotAllowed from '@/pages/auth/EmailNotAllowed'
import Home from '@/pages/student/Home'
import Availability from '@/pages/student/Availability'
import ConfirmReservation from '@/pages/student/ConfirmReservation'
import ReservationConfirmed from '@/pages/student/ReservationConfirmed'
import Conflict from '@/pages/student/Conflict'
import MyReservations from '@/pages/student/MyReservations'
import CancelReservation from '@/pages/student/CancelReservation'
import Quota from '@/pages/student/Quota'
import Rules from '@/pages/student/Rules'
import Contact from '@/pages/student/Contact'
import CheckIn from '@/pages/student/CheckIn'
import AdminPanel from '@/pages/admin/AdminPanel'
import AdminSpaces from '@/pages/admin/AdminSpaces'
import AdminBlocks from '@/pages/admin/AdminBlocks'
import AdminRules from '@/pages/admin/AdminRules'
import AdminQR from '@/pages/admin/AdminQR'

function RootRedirect() {
  const { session } = useApp()
  return <Navigate to={session?.name ? '/app/inicio' : '/bienvenida'} replace />
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
            <Route path="/app/disponibilidad" element={<Availability />} />
            <Route path="/app/reservar" element={<ConfirmReservation />} />
            <Route path="/app/reserva-confirmada/:id" element={<ReservationConfirmed />} />
            <Route path="/app/conflicto" element={<Conflict />} />
            <Route path="/app/mis-reservas" element={<MyReservations />} />
            <Route path="/app/mis-reservas/cancelar/:id" element={<CancelReservation />} />
            <Route path="/app/mi-cuota" element={<Quota />} />
            <Route path="/app/reglas" element={<Rules />} />
            <Route path="/app/contacto" element={<Contact />} />
            {/* RN-32: enlace fijo del QR por espacio */}
            <Route path="/checkin/:spaceId" element={<CheckIn />} />
          </Route>

          <Route element={<Shell variant="admin" />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/espacios" element={<AdminSpaces />} />
            <Route path="/admin/bloqueos" element={<AdminBlocks />} />
            <Route path="/admin/reglas" element={<AdminRules />} />
            <Route path="/admin/qr" element={<AdminQR />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
