import { useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Field, { FieldDescription, FieldLabel } from '@/components/smoothui/field'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import { staggerChild, staggerParent } from '@/lib/anim'
import { useApp } from '@/store'

export default function FirstLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, setName } = useApp()
  const [name, setNameValue] = useState('')
  const [saving, setSaving] = useState(false)

  if (!session) return <Navigate to="/acceso" replace />
  if (session.name) return <Navigate to="/app/inicio" replace />

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setTimeout(() => {
      setName(name.trim())
      toast.success(`Hola, ${name.trim().split(' ')[0]}`, {
        description: 'Tu cuenta quedó creada.',
      })
      navigate(location.state?.from ?? '/app/inicio')
    }, 1200)
  }

  return (
    <motion.form className="space-y-8" onSubmit={submit} {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Antes de continuar
        </h1>
        <p className="text-muted-foreground">
          Necesitamos tu nombre para el comprobante de reserva.
        </p>
      </motion.div>

      <motion.div {...staggerChild}>
        <Field>
          <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
          <Input
            autoFocus
            className="h-12"
            id="name"
            onValueChange={setNameValue}
            placeholder="Tu nombre"
            value={name}
          />
          <FieldDescription>Tu cuenta se crea al completar este paso.</FieldDescription>
        </Field>
      </motion.div>

      <motion.div {...staggerChild}>
        <SmoothButton
          className="w-full"
          color="accent"
          disabled={!name.trim()}
          loading={saving}
          size="lg"
          suffix={<ArrowRight />}
          type="submit"
          variant="candy"
        >
          Continuar
        </SmoothButton>
      </motion.div>
    </motion.form>
  )
}
