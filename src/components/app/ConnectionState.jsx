import Alert from '@/components/smoothui/alert'
import SmoothButton from '@/components/smoothui/smooth-button'
import Spinner from '@/components/smoothui/spinner'
import { errorMessage } from '@/lib/api'

/** Estado compartido de restauración de sesión y carga inicial. */
export default function ConnectionState({ error, onRetry, label = 'Cargando tu sesión', retryLabel = 'Reintentar conexión' }) {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center bg-background p-6">
      {error ? (
        <div className="max-w-lg space-y-4">
          <Alert title="No se pudo conectar con el servidor" variant="destructive">
            {errorMessage(error)}
          </Alert>
          <SmoothButton onClick={onRetry} variant="outline">{retryLabel}</SmoothButton>
        </div>
      ) : (
        <Spinner aria-label={label} className="text-accent-ink" size="lg" />
      )}
    </div>
  )
}
