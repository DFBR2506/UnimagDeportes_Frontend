import { useEffect, useState } from 'react'
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

  const sendCode = async () => {
    setSending(true)
    setError(null)
    try {
      await api('/auth/reauth/code', { method: 'POST' })
      setNotice(`Enviamos un código a ${email ?? 'tu correo institucional'}.`)
    } catch (err) {
      // RESEND_TOO_SOON: el código anterior sigue vigente.
      if (err.code === 'RESEND_TOO_SOON') {
        setNotice(`Usa el código que ya enviamos. Podrás pedir otro en ${err.details.retryAfterSeconds ?? 60} s.`)
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (!open) return
    setCode('')
    setError(null)
    setNotice(null)
    sendCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const verify = async (value = code) => {
    if (value.length !== 6) return
    setVerifying(true)
    setError(null)
    try {
      const res = await api('/auth/reauth/verify', { method: 'POST', body: { code: value } })
      onSuccess(res.token)
    } catch (err) {
      const left = err.details?.attemptsRemaining
      setError(left != null ? `${errorMessage(err)} Te quedan ${left} intentos.` : errorMessage(err))
      setCode('')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Dialog
      className="sm:max-w-md"
      description="Por seguridad, confirma tu identidad para continuar con esta acción."
      onOpenChange={(next) => !next && onCancel()}
      open={open}
      title="Confirma que eres tú"
    >
      <div className="space-y-5 pt-2 text-center">
        <p className="text-sm text-muted-foreground">{sending ? 'Enviando código…' : notice}</p>
        <CodeInput invalid={Boolean(error)} onChange={setCode} onComplete={verify} value={code} />
        {error && <p className="text-sm text-destructive-ink">{error}</p>}
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
          <SmoothButton disabled={sending} onClick={sendCode} variant="ghost">
            Enviar otro código
          </SmoothButton>
        </div>
      </div>
    </Dialog>
  )
}
