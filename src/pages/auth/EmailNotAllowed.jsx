import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MailX, RotateCcw } from 'lucide-react'
import Alert from '@/components/smoothui/alert'
import SmoothButton from '@/components/smoothui/smooth-button'
import { staggerChild, staggerParent } from '@/lib/anim'

export default function EmailNotAllowed() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  return (
    <motion.div className="space-y-8" {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Correo no permitido
        </h1>
        <p className="text-muted-foreground">No pudimos solicitar el código.</p>
      </motion.div>

      <motion.div {...staggerChild}>
        <Alert
          icon={<MailX className="size-4" />}
          title={email ? `${email} no pertenece al dominio institucional` : 'Dominio no institucional'}
          variant="destructive"
        >
          Usa un correo terminado en @unimagdalena.edu.co.
        </Alert>
      </motion.div>

      <motion.div className="space-y-4" {...staggerChild}>
        <SmoothButton
          className="w-full"
          color="accent"
          onClick={() => navigate('/acceso', { state: { from: location.state?.from } })}
          prefix={<RotateCcw />}
          size="lg"
          variant="candy"
        >
          Volver a intentar
        </SmoothButton>
        <p className="text-center text-xs text-muted-foreground">No se envió ningún correo.</p>
      </motion.div>
    </motion.div>
  )
}
