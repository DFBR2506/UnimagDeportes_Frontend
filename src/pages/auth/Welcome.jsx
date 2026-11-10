import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
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
  const { login, setName } = useApp()

  // Acceso MVP: entra directo con una sesión simulada, sin pasar por el código.
  const demo = (role) => {
    if (role === 'admin') {
      login('admin.deportes@unimagdalena.edu.co')
      setName('Equipo de Deportes')
      navigate('/admin')
    } else {
      login('maria.perez@unimagdalena.edu.co')
      setName('María Pérez')
      navigate('/app/inicio')
    }
  }

  return (
    <motion.div className="space-y-8" {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
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
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-xs"
            {...staggerChild}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
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
          onClick={() => navigate('/acceso')}
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
          <SmoothButton color="accent" onClick={() => demo('student')} prefix={<UserRound />} variant="soft">
            Entrar como estudiante
          </SmoothButton>
          <SmoothButton color="amber" onClick={() => demo('admin')} prefix={<ShieldCheck />} variant="soft">
            Entrar como administrador
          </SmoothButton>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Sesión simulada para la demo, sin código de acceso.
        </p>
      </motion.div>
    </motion.div>
  )
}
