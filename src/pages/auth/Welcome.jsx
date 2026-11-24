import { useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarCheck2, QrCode, ShieldCheck, Timer, UserRound } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import Separator from '@/components/smoothui/separator'
import { staggerChild, staggerParent } from '@/lib/anim'
import { useApp } from '@/store'

const FEATURES = [
  { icon: CalendarCheck2, text: 'Disponibilidad en tiempo real' },
  { icon: Timer, text: 'Confirmación inmediata, sin filas' },
  { icon: QrCode, text: 'Check-in con el QR del espacio' },
]

export default function Welcome() {
  const navigate = useNavigate()
  const location = useLocation()
  const { me, enterDemo } = useApp()
  const [pending, setPending] = useState(null)

  if (me && !me.needsName) {
    return <Navigate to={me.role === 'ADMIN' ? '/admin' : '/app/inicio'} replace />
  }

  // Recorrido MVP: entra directo con una sesión simulada (datos del prototipo), sin backend ni código.
  const demo = async (role) => {
    setPending(role)
    try {
      await enterDemo(role)
      navigate(role === 'admin' ? '/admin' : '/app/inicio')
    } finally {
      setPending(null)
    }
  }

  return (
    <motion.div className="space-y-6 sm:space-y-8" {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <img
          alt="Área Deportes · Unimagdalena – Bienestar Universitario"
          className="mx-auto mb-4 size-20 min-[360px]:size-24 drop-shadow-md sm:size-28"
          draggable={false}
          src="/logo.svg"
        />
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground min-[360px]:text-3xl sm:text-4xl">
          Reserva tu espacio
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
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
          Sesión simulada con datos de ejemplo: no usa el backend ni pide código.
        </p>
      </motion.div>
    </motion.div>
  )
}
