import { useState } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import Field, { FieldDescription, FieldLabel } from '@/components/smoothui/field'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import { staggerChild, staggerParent } from '@/lib/anim'

const DOMAIN = '@unimagdalena.edu.co'

export default function RequestCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value) return
    // RN-50: validar dominio antes de enviar nada.
    if (!value.endsWith(DOMAIN)) {
      navigate('/acceso/no-permitido', { state: { email: value, from: location.state?.from } })
      return
    }
    setSending(true)
    setTimeout(() => {
      toast.success('Código enviado', {
        description: `Revisa ${value}. Vigencia: 10 minutos.`,
      })
      navigate('/acceso/codigo', { state: { email: value, from: location.state?.from } })
    }, 1400)
  }

  return (
    <motion.form className="space-y-8" onSubmit={submit} {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Iniciar sesión
        </h1>
        <p className="text-muted-foreground">
          Usa tu correo institucional para recibir un código.
        </p>
      </motion.div>

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
