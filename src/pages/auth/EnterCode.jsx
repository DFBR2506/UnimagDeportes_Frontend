import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import OTPField from '@/components/smoothui/otp-field'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import { staggerChild, staggerParent } from '@/lib/anim'
import { useApp } from '@/store'

const RESEND_SECONDS = 60

export default function EnterCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, session } = useApp()
  const [code, setCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)

  const email = location.state?.email

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  if (!email) return <Navigate to="/acceso" replace />

  const validate = () => {
    setValidating(true)
    // RN-51/54: código correcto → token de 24 h (simulado).
    setTimeout(() => {
      login(email)
      const from = location.state?.from
      // RN-59: en el primer inicio se solicita el nombre.
      navigate(session?.name ? (from ?? '/app/inicio') : '/acceso/nombre', {
        state: { from },
      })
    }, 1500)
  }

  const resend = () => {
    setResendIn(RESEND_SECONDS)
    setCode('')
    toast.success('Código nuevo enviado', {
      description: 'El código anterior quedó invalidado.',
    })
  }

  return (
    <motion.div className="space-y-8" {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Ingresa tu código
        </h1>
        <p className="text-muted-foreground">
          Revisa tu correo institucional: <span className="font-medium text-foreground">{email}</span>
        </p>
      </motion.div>

      <motion.div {...staggerChild}>
        <OTPField
          aria-label="Código de acceso"
          label="Código de acceso"
          length={6}
          onValueChange={setCode}
          value={code}
        />
      </motion.div>

      <motion.div className="space-y-3" {...staggerChild}>
        <SmoothButton
          className="w-full"
          color="accent"
          disabled={code.length !== 6}
          loading={validating}
          onClick={validate}
          size="lg"
          suffix={<ShieldCheck />}
          variant="candy"
        >
          Validar código
        </SmoothButton>
        <SmoothButton
          className="w-full"
          color="accent"
          disabled={resendIn > 0}
          onClick={resend}
          size="lg"
          variant="soft"
        >
          {resendIn > 0 ? `Solicitar un código nuevo (${resendIn} s)` : 'Solicitar un código nuevo'}
        </SmoothButton>
      </motion.div>

      <motion.div className="space-y-1 text-center text-xs text-muted-foreground" {...staggerChild}>
        <p>Código de 6 dígitos · Vigencia: 10 minutos</p>
        <p>Máximo 5 intentos. Espera 60 s entre solicitudes.</p>
      </motion.div>
    </motion.div>
  )
}
