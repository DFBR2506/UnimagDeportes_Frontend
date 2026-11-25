import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Dialog from '@/components/smoothui/dialog'
import SmoothButton from '@/components/smoothui/smooth-button'
import CodeInput from '@/components/app/CodeInput'
import { api, errorMessage } from '@/lib/api'

/**
 * Reautenticación del Administrador (D-21): las acciones sensibles
 * (bloqueos y reglas) exigen un código reciente enviado al correo.
 */
export default function ReauthDialog({ open, email, onSuccess, onCancel }) {
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const request = useRef(null)
  const verifyPending = useRef(false)
  const sendPending = useRef(false)

  const sendCode = async (signal = request.current?.signal) => {
    if (!signal || signal.aborted || sendPending.current) return
    sendPending.current = true
    setSending(true)
    setError(null)
    try {
      await api('/auth/reauth/code', { method: 'POST', signal })
      if (signal.aborted) return
      setNotice(`Enviamos un código a ${email ?? 'tu correo institucional'}.`)
    } catch (err) {
      if (signal.aborted) return
      // RESEND_TOO_SOON: el código anterior sigue vigente.
      if (err.code === 'RESEND_TOO_SOON') {
        setNotice(`Usa el código que ya enviamos. Podrás pedir otro en ${err.details.retryAfterSeconds ?? 60} s.`)
      } else {
        setError(errorMessage(err))
      }
    } finally {
      if (!signal.aborted) {
        sendPending.current = false
        setSending(false)
      }
    }
  }

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    request.current = controller
    verifyPending.current = false
    sendPending.current = false
    setVerifying(false)
    setCode('')
    setError(null)
    setNotice(null)
    sendCode(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const verify = async (value = code) => {
    const signal = request.current?.signal
    if (value.length !== 6 || !signal || signal.aborted || verifyPending.current) return
    verifyPending.current = true
    setVerifying(true)
    setError(null)
    try {
      const res = await api('/auth/reauth/verify', { method: 'POST', body: { code: value }, signal })
      if (signal.aborted) return
      onSuccess(res.token)
    } catch (err) {
      if (signal.aborted) return
      const left = err.details?.attemptsRemaining
      setError(left != null ? `${errorMessage(err)} Te quedan ${left} intentos.` : errorMessage(err))
      setCode('')
    } finally {
      if (!signal.aborted) {
        verifyPending.current = false
        setVerifying(false)
      }
    }
  }

  return (
    <Dialog
      className="sm:max-w-md"
      description="Por seguridad, confirma tu identidad para continuar con esta acción."
      onOpenChange={(next) => {
        if (!next) {
          request.current?.abort()
          onCancel()
        }
      }}
      open={open}
      title="Confirma que eres tú"
    >
      <div className="space-y-5 pt-2 text-center">
        <p aria-live="polite" className="text-sm text-muted-foreground">{sending ? 'Enviando código…' : notice}</p>
        <CodeInput aria-label="Código de reautenticación" invalid={Boolean(error)} onChange={setCode} onComplete={verify} value={code} />
        {error && <p role="alert" className="text-sm text-destructive-ink">{error}</p>}
        <div className="flex flex-col gap-2">
          <SmoothButton
            color="accent"
            disabled={code.length !== 6}
            loading={verifying}
            onClick={() => verify()}
            suffix={<ShieldCheck />}
            variant="candy"
          >
            Confirmar
          </SmoothButton>
          <SmoothButton disabled={sending || verifying} onClick={() => sendCode()} variant="ghost">
            Enviar otro código
          </SmoothButton>
        </div>
      </div>
    </Dialog>
  )
}
