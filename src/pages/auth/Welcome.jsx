import { useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarCheck2, QrCode, ShieldCheck, Timer, UserRound } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Separator from '@/components/smoothui/separator'
import { toast } from '@/components/smoothui/toast'
import { staggerChild, staggerParent } from '@/lib/anim'
import { errorMessage } from '@/lib/api'
import { useApp } from '@/store'

const FEATURES = [
  { icon: CalendarCheck2, text: 'Disponibilidad en tiempo real' },
  { icon: Timer, text: 'Confirmación inmediata, sin filas' },
  { icon: QrCode, text: 'Check-in con el QR del espacio' },
]

// Accesos de demostración: POST /dev/login solo existe con el perfil `dev` del backend.
const DEMO_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEMO_LOGIN === 'true'
const DEMO_USERS = {
  student: { email: 'maria.perez@unimagdalena.edu.co', name: 'María Pérez' },
  // Para que sea ADMIN, el correo debe estar en APP_AUTH_ADMIN_EMAILS del backend.
  admin: { email: 'admin.deportes@unimagdalena.edu.co', name: 'Equipo de Deportes' },
}

export default function Welcome() {
  const navigate = useNavigate()
  const location = useLocation()
  const { me, devLogin } = useApp()
  const [pending, setPending] = useState(null)

  if (me && !me.needsName) {
    return <Navigate to={me.role === 'ADMIN' ? '/admin' : '/app/inicio'} replace />
  }

  const demo = async (role) => {
    setPending(role)
    try {
      const { email, name } = DEMO_USERS[role]
      const user = await devLogin(email, name)
      if (role === 'admin' && user.role !== 'ADMIN') {
        toast('Entraste como estudiante', {
          description: `Agrega ${email} a APP_AUTH_ADMIN_EMAILS en el backend para usar el modo administrador.`,
        })
      }
      navigate(location.state?.from ?? (user.role === 'ADMIN' ? '/admin' : '/app/inicio'))
    } catch (err) {
      toast.error('No se pudo usar el acceso de demostración', {
        description:
          err.status === 404 || err.status === 401 || err.status === 403
            ? 'Requiere el backend con el perfil "dev" (SPRING_PROFILES_ACTIVE=dev).'
            : errorMessage(err),
      })
    } finally {
      setPending(null)
    }
  }

  return (
    <motion.div className="space-y-8" {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Reserva tu espacio
        </h1>
        <p className="text-lg text-muted-foreground">
          Actividad deportiva universitaria, en un solo lugar.
        </p>
        <p className="text-sm text-muted-foreground">
          Accede con tu correo institucional y consulta disponibilidad en tiempo real.
        </p>
      </motion.div>

      <motion.ul className="space-y-3" {...staggerParent}>
        {FEATURES.map(({ icon: Icon, text }) => (
          <motion.li
            key={text}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/60 text-left px-4 py-3 text-sm text-card-foreground shadow-xs"
            {...staggerChild}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-ink">
              <Icon className="size-4" />
            </span>
            {text}
          </motion.li>
        ))}
      </motion.ul>

      <motion.div className="space-y-4" {...staggerChild}>
        <SmoothButton
          className="w-full"
          color="accent"
          variant="candy"
          size="lg"
          suffix={<ArrowRight />}
          onClick={() => navigate('/acceso', { state: location.state })}
        >
          Iniciar sesión
        </SmoothButton>
        <p className="text-center text-xs text-muted-foreground">
          Sin contraseña · sin registro previo
        </p>
      </motion.div>

      {DEMO_ENABLED && (
        <motion.div className="space-y-4" {...staggerChild}>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Recorrido MVP
            </span>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SmoothButton className="px-3" color="accent" loading={pending === 'student'} onClick={() => demo('student')} prefix={<UserRound />} variant="soft">
              Entrar como estudiante
            </SmoothButton>
            <SmoothButton className="px-3" color="amber" loading={pending === 'admin'} onClick={() => demo('admin')} prefix={<ShieldCheck />} variant="soft">
              Entrar como administrador
            </SmoothButton>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Requiere el backend con el perfil dev; no pide código de acceso.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
