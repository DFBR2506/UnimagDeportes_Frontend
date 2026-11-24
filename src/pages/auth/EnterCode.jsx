import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import CodeInput from '@/components/app/CodeInput'
import { staggerChild, staggerParent } from '@/lib/anim'
import { errorMessage } from '@/lib/api'
import { useApp } from '@/store'

const RESEND_SECONDS = 60 // RN-53

export default function EnterCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyCode, requestCode } = useApp()
  const [code, setCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState(null)
  const [resendIn, setResendIn] = useState(location.state?.resendIn ?? RESEND_SECONDS)

  const email = location.state?.email
  const from = location.state?.from

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  if (!email) return <Navigate to="/acceso" replace />

  const validate = async (value = code) => {
    if (value.length !== 6 || validating) return
    setValidating(true)
    setError(null)
    try {
      // RN-54: código correcto → token de 24 h.
      const user = await verifyCode(email, value)
      // RN-59: en el primer inicio se solicita el nombre.
      if (user.needsName) {
        navigate('/acceso/nombre', { replace: true, state: { from } })
      } else {
        navigate(from ?? (user.role === 'ADMIN' ? '/admin' : '/app/inicio'), { replace: true })
      }
    } catch (err) {
      const left = err.details?.attemptsRemaining
      setError(
        left != null
          ? `${errorMessage(err)} Te quedan ${left} intento${left === 1 ? '' : 's'}.`
          : errorMessage(err)
      )
      setCode('')
      setValidating(false)
    }
  }

  const resend = async () => {
    try {
      await requestCode(email)
      setResendIn(RESEND_SECONDS)
      setCode('')
      setError(null)
      toast.success('Código nuevo enviado', {
        description: 'El código anterior quedó invalidado.',
      })
    } catch (err) {
      if (err.details?.retryAfterSeconds) setResendIn(err.details.retryAfterSeconds)
      toast.error('No pudimos enviar otro código', { description: errorMessage(err) })
    }
  }

  return (
    <motion.div className="space-y-6 sm:space-y-8" {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground min-[360px]:text-3xl sm:text-4xl">
          Ingresa tu código
        </h1>
        <p className="text-muted-foreground">
          Lo enviamos a{' '}
          <span className="block font-medium break-all text-foreground sm:inline">{email}</span>
        </p>
      </motion.div>

      <motion.div className="space-y-3" {...staggerChild}>
        <p className="text-sm font-medium text-foreground">Código de acceso</p>
        <CodeInput
          aria-describedby="otp-help"
          aria-label="Código de acceso de 6 dígitos"
          invalid={Boolean(error)}
          onChange={(v) => {
            setCode(v)
            if (error) setError(null)
          }}
          onComplete={validate}
          value={code}
        />
        {error && (
          <p className="text-sm text-destructive-ink" role="alert">
            {error}
          </p>
        )}
      </motion.div>

      <motion.div className="space-y-3" {...staggerChild}>
        <SmoothButton
          className="w-full max-sm:px-4"
          color="accent"
          disabled={code.length !== 6}
          loading={validating}
          onClick={() => validate()}
          size="lg"
          suffix={<ShieldCheck />}
          variant="candy"
        >
          Validar código
        </SmoothButton>
        <SmoothButton
          className="w-full max-sm:px-4"
          color="accent"
          disabled={resendIn > 0}
          onClick={resend}
          size="lg"
          variant="soft"
        >
          {resendIn > 0 ? `Solicitar un código nuevo (${resendIn} s)` : 'Solicitar un código nuevo'}
        </SmoothButton>
      </motion.div>

      <motion.div
        id="otp-help"
        className="space-y-1 text-center text-xs text-muted-foreground"
        {...staggerChild}
      >
        <p>Código de 6 dígitos · Vigencia: 15 minutos</p>
        <p>Máximo 5 intentos. Espera 60 s entre solicitudes.</p>
      </motion.div>
    </motion.div>
  )
}
