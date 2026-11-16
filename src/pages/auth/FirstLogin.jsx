import { useState } from 'react'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Field, { FieldDescription, FieldLabel } from '@/components/smoothui/field'
import Input from '@/components/smoothui/input'
import SmoothButton from '@/components/smoothui/smooth-button'
import Spinner from '@/components/smoothui/spinner'
import { toast } from '@/components/smoothui/toast'
import { staggerChild, staggerParent } from '@/lib/anim'
import { errorMessage } from '@/lib/api'
import { useApp } from '@/store'

export default function FirstLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, me, completeProfile } = useApp()
  const [name, setNameValue] = useState('')
  const [saving, setSaving] = useState(false)

  if (!token) return <Navigate to="/acceso" replace />
  if (!me) {
    return (
      <div className="flex justify-center py-10">
        <Spinner aria-label="Cargando" size="lg" />
      </div>
    )
  }
  const home = me.role === 'ADMIN' ? '/admin' : '/app/inicio'
  if (!me.needsName) return <Navigate to={home} replace />

  const submit = async (e) => {
    e.preventDefault()
    const value = name.trim()
    if (!value) return
    setSaving(true)
    try {
      // RN-59: el nombre se pide una sola vez y aparece en el comprobante (RN-45).
      await completeProfile(value)
      toast.success(`Hola, ${value.split(' ')[0]}`, { description: 'Tu cuenta quedó lista.' })
      navigate(location.state?.from ?? home, { replace: true })
    } catch (err) {
      toast.error('No pudimos guardar tu nombre', { description: errorMessage(err) })
      setSaving(false)
    }
  }

  return (
    <motion.form className="space-y-8" onSubmit={submit} {...staggerParent}>
      <motion.div className="space-y-3" {...staggerChild}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
          <FieldDescription>{me.email}</FieldDescription>
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
