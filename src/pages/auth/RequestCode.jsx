import { useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import Alert from '@/components/smoothui/alert'
import Field, { FieldDescription, FieldLabel } from '@/components/smoothui/field'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import { staggerChild, staggerParent } from '@/lib/anim'
import { errorMessage } from '@/lib/api'
import { useApp } from '@/store'

const DOMAIN = '@unimagdalena.edu.co'

export default function RequestCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const { me, requestCode, sessionNotice } = useApp()
  const from = location.state?.from

  if (me && !me.needsName) {
    return <Navigate to={from ?? (me.role === 'ADMIN' ? '/admin' : '/app/inicio')} replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value) return
    // RN-50: el dominio se valida antes de enviar nada (y el servidor lo vuelve a validar).
    if (!value.endsWith(DOMAIN)) {
      navigate('/acceso/no-permitido', { state: { email: value, from } })
      return
    }
    setSending(true)
    try {
      await requestCode(value)
      toast.success('Código enviado', { description: `Revisa ${value}. Vence en 15 minutos.` })
      navigate('/acceso/codigo', { state: { email: value, from } })
    } catch (err) {
      if (err.code === 'INVALID_EMAIL_DOMAIN') {
        navigate('/acceso/no-permitido', { state: { email: value, from } })
      } else if (err.code === 'RESEND_TOO_SOON') {
        // Ya hay un código vigente para este correo: se puede usar.
        toast('Ya te enviamos un código', { description: errorMessage(err) })
        navigate('/acceso/codigo', {
          state: { email: value, from, resendIn: err.details.retryAfterSeconds },
        })
      } else {
        toast.error('No pudimos enviar el código', { description: errorMessage(err) })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.form className="space-y-6 sm:space-y-8" onSubmit={submit} {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground min-[360px]:text-3xl sm:text-4xl">
          Iniciar sesión
        </h1>
        <p className="text-muted-foreground">
          Usa tu correo institucional para recibir un código.
        </p>
      </motion.div>

      {sessionNotice === 'expired' && (
        <motion.div className="text-left" {...staggerChild}>
          <Alert title="Tu sesión venció" variant="warning">
            Inicia sesión de nuevo para volver a donde estabas.
          </Alert>
        </motion.div>
      )}

      <motion.div {...staggerChild}>
        <Field>
          <FieldLabel htmlFor="email">Correo institucional</FieldLabel>
          <Input
            autoComplete="email"
            autoFocus
            className="h-12"
            id="email"
            onValueChange={setEmail}
            placeholder={`nombre${DOMAIN}`}
            type="email"
            value={email}
          />
          <FieldDescription>Solo se acepta el dominio {DOMAIN}</FieldDescription>
        </Field>
      </motion.div>

      <motion.div className="space-y-4" {...staggerChild}>
        <SmoothButton
          className="w-full"
          color="accent"
          disabled={!email.trim()}
          loading={sending}
          size="lg"
          suffix={<Send />}
          type="submit"
          variant="candy"
        >
          Solicitar código
        </SmoothButton>
        <p className="text-center text-xs text-muted-foreground">
          No necesitas contraseña ni registro previo.
        </p>
      </motion.div>
    </motion.form>
  )
}
