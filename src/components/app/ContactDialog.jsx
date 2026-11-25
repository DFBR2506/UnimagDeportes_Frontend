import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MessageCircle, Send } from 'lucide-react'
import Dialog from '@/components/smoothui/dialog'
import Select from '@/components/smoothui/select'
import Textarea from '@/components/smoothui/textarea'
import Field, { FieldLabel } from '@/components/smoothui/field'
import SmoothButton from '@/components/smoothui/smooth-button'
import { toast } from '@/components/smoothui/toast'
import { EASE } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  { label: 'Consulta sobre una reserva', value: 'reserva' },
  { label: 'Reporte de un espacio', value: 'espacio' },
  { label: 'Sanción o suspensión', value: 'sancion' },
  { label: 'Otro asunto', value: 'otro' },
]

function ContactForm({ onSent }) {
  const [subject, setSubject] = useState('reserva')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      // UC12: el mensaje no se guarda; se envía por correo al área de deportes (OQ-10).
      const res = await api('/contact', {
        method: 'POST',
        body: {
          subject: SUBJECTS.find((s) => s.value === subject)?.label ?? 'Consulta',
          message: message.trim(),
        },
      })
      setMessage('')
      onSent()
      toast.success('Mensaje enviado', {
        description: res?.message ?? 'El área de deportes responderá a tu correo institucional.',
      })
    } catch (err) {
      toast.error('No se pudo enviar el mensaje', { description: errorMessage(err) })
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="space-y-5 pt-2" onSubmit={submit}>
      <Field>
        <FieldLabel>Asunto</FieldLabel>
        <Select aria-label="Asunto" onValueChange={setSubject} options={SUBJECTS} value={subject} />
      </Field>
      <Field>
        <FieldLabel htmlFor="mensaje">Mensaje</FieldLabel>
        <Textarea
          id="mensaje"
          onValueChange={setMessage}
          placeholder="Escribe tu mensaje…"
          rows={5}
          value={message}
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        El mensaje se envía al área de deportes y no se guarda en la plataforma.
      </p>
      <SmoothButton
        className="w-full"
        color="accent"
        disabled={!message.trim()}
        loading={sending}
        prefix={<Send />}
        type="submit"
        variant="candy"
      >
        Enviar mensaje
      </SmoothButton>
    </form>
  )
}

/** Botón flotante (abajo a la derecha) que abre el formulario de contacto en un modal; en móvil lo abre la barra inferior. */
export default function ContactFab({ open, onOpenChange }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Enlace de contacto de los correos (/app/contacto → inicio con el modal abierto).
  useEffect(() => {
    if (!location.state?.openContact) return
    onOpenChange(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate, onOpenChange])

  return (
    <>
      <motion.button
        aria-label="Contactar al administrador"
        className={cn(
          'group fixed right-5 bottom-5 z-40 hidden h-14 cursor-pointer items-center rounded-full bg-sidebar px-4 text-sidebar-foreground shadow-xl shadow-sidebar/25 ring-1 ring-white/10 transition-colors hover:bg-sidebar/90 focus-ring md:right-8 md:bottom-8 md:flex',
          open && 'pointer-events-none'
        )}
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
        onClick={() => onOpenChange(true)}
        type="button"
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative flex size-6 shrink-0 items-center justify-center">
          <MessageCircle className="size-6" />
          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-sidebar-primary ring-2 ring-sidebar" />
        </span>
        {/* El ancho se anima con CSS (sin `layout`, que deformaba la píldora). */}
        <span
          aria-hidden
          className="max-w-0 overflow-hidden pl-0 text-sm font-medium whitespace-nowrap opacity-0 transition-[max-width,opacity,padding] duration-300 ease-out group-hover:max-w-56 group-hover:pl-3 group-hover:opacity-100 group-focus-visible:max-w-56 group-focus-visible:pl-3 group-focus-visible:opacity-100"
        >
          Contactar al administrador
        </span>
      </motion.button>

      <Dialog
        className="sm:max-w-lg"
        description="Envía un mensaje al correo del área de deportes."
        onOpenChange={onOpenChange}
        open={open}
        title="Contactar administrador"
      >
        <ContactForm onSent={() => onOpenChange(false)} />
      </Dialog>
    </>
  )
}
