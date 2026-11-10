import { useState } from 'react'
import { motion } from 'motion/react'
import { Send } from 'lucide-react'
import Select from '@/components/smoothui/select'
import Textarea from '@/components/smoothui/textarea'
import Field, { FieldLabel } from '@/components/smoothui/field'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import PageHeader from '@/components/app/PageHeader'
import { EASE, staggerChild, staggerParent } from '@/lib/anim'

const SUBJECTS = [
  { label: 'Consulta sobre una reserva', value: 'reserva' },
  { label: 'Reporte de un espacio', value: 'espacio' },
  { label: 'Sanción o suspensión', value: 'sancion' },
  { label: 'Otro asunto', value: 'otro' },
]

export default function Contact() {
  const [subject, setSubject] = useState('reserva')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setMessage('')
      toast.success('Mensaje enviado', {
        description: 'El área de deportes responderá a tu correo institucional.',
      })
    }, 1500)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contactar administrador"
        subtitle="Envía un mensaje al correo del área de deportes."
      />

      <motion.form
        className="rounded-2xl border border-border bg-card p-7 shadow-xs md:p-9"
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <motion.div className="space-y-6" {...staggerParent}>
          <motion.div {...staggerChild}>
            <Field>
              <FieldLabel>Asunto</FieldLabel>
              <Select
                aria-label="Asunto"
                onValueChange={setSubject}
                options={SUBJECTS}
                value={subject}
              />
            </Field>
          </motion.div>

          <motion.div {...staggerChild}>
            <Field>
              <FieldLabel htmlFor="mensaje">Mensaje</FieldLabel>
              <Textarea
                id="mensaje"
                onValueChange={setMessage}
                placeholder="Escribe tu mensaje…"
                rows={6}
                value={message}
              />
            </Field>
          </motion.div>

          <motion.p className="text-xs text-muted-foreground" {...staggerChild}>
            El mensaje se envía al área de deportes y no se guarda en la plataforma.
          </motion.p>

          <motion.div {...staggerChild}>
            <SmoothButton
              color="accent"
              disabled={!message.trim()}
              loading={sending}
              prefix={<Send />}
              size="lg"
              type="submit"
              variant="candy"
            >
              Enviar mensaje
            </SmoothButton>
          </motion.div>
        </motion.div>
      </motion.form>
    </div>
  )
}
