import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Download, ExternalLink, Printer } from 'lucide-react'
import Select from '@/components/smoothui/select'
import Field, { FieldLabel } from '@/components/smoothui/field'
import SmoothButton from '@/components/smoothui/smooth-button'
import Alert from '@/components/smoothui/alert'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import useAdminSpaces from '@/lib/useAdminSpaces'
import { EASE } from '@/lib/anim'
import { api, errorMessage } from '@/lib/api'

/**
 * Hoja de impresión: solo el nombre de la cancha y el QR. Va en un portal directo en
 * <body> para que el CSS de impresión oculte toda la app (topbar, controles, textos).
 */
function PrintSheet({ name, qrUrl }) {
  if (!qrUrl) return null
  return createPortal(
    <div className="print-sheet">
      <h1>{name}</h1>
      <img alt={`Código QR de ${name}`} className="print-sheet-qr" src={qrUrl} />
    </div>,
    document.body
  )
}

export default function AdminQR() {
  const { spaces, loaded } = useAdminSpaces()
  const [spaceId, setSpaceId] = useState(null)
  const [qr, setQr] = useState({ id: null, url: null, error: null })

  const activeId = spaceId ?? spaces[0]?.id
  const space = spaces.find((s) => s.id === activeId)

  // GET /admin/spaces/{id}/qr → SVG (ZXing) con el enlace fijo /checkin/{id} (RN-31, RN-32).
  useEffect(() => {
    if (!activeId) return
    let url = null
    let alive = true
    api(`/admin/spaces/${activeId}/qr`, { as: 'blob' })
      .then((blob) => {
        url = URL.createObjectURL(new Blob([blob], { type: 'image/svg+xml' }))
        if (alive) setQr({ id: activeId, url, error: null })
      })
      .catch((error) => alive && setQr({ id: activeId, url: null, error }))
    return () => {
      alive = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [activeId])

  const ready = qr.id === activeId
  const fileName = `qr-${(space?.name ?? 'espacio').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.svg`

  return (
    <div className="space-y-8">
      <PrintSheet name={space?.name} qrUrl={ready ? qr.url : null} />
      <PageHeader
        title="Generar QR del espacio"
        subtitle="El QR contiene únicamente el enlace fijo del espacio."
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <motion.section
          className="rounded-2xl border border-border bg-card p-7 shadow-xs lg:col-span-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        >
          <div className="max-w-xs">
            <Field>
              <FieldLabel>Espacio</FieldLabel>
              <Select
                aria-label="Espacio"
                onValueChange={setSpaceId}
                options={spaces.map((s) => ({ label: s.name, value: s.id }))}
                placeholder={loaded ? 'Sin espacios' : 'Cargando…'}
                value={activeId ?? ''}
              />
            </Field>
          </div>

          {space && (
            <>
              <h2 className="mt-6 font-display text-2xl font-bold text-card-foreground">{space.name}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                Enlace:{' '}
                <Link
                  className="inline-flex items-center gap-1 font-medium text-accent-ink hover:underline"
                  to={`/checkin/${space.id}`}
                >
                  /checkin/{space.id.slice(0, 8)}…
                  <ExternalLink className="size-3.5" />
                </Link>
              </p>
            </>
          )}

          <div className="mt-6 w-fit rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="size-52 md:size-60">
              {ready && qr.url ? (
                <motion.img
                  key={qr.url}
                  alt={`Código QR de ${space?.name}`}
                  className="size-full"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  src={qr.url}
                />
              ) : ready && qr.error ? (
                <div className="flex size-full items-center justify-center text-center text-sm text-muted-foreground">
                  QR no disponible
                </div>
              ) : (
                <Skeleton className="size-full" />
              )}
            </div>
          </div>

          {ready && qr.error && (
            <Alert
              className="mt-5"
              title={
                qr.error.code === 'QR_NOT_CONFIGURED' ? 'Falta configurar el origen del frontend' : 'No se pudo generar el QR'
              }
              variant="warning"
            >
              {qr.error.code === 'QR_NOT_CONFIGURED'
                ? 'Define APP_CHECKIN_FRONTEND_ORIGIN en el backend con la URL pública de esta aplicación.'
                : errorMessage(qr.error)}
            </Alert>
          )}
        </motion.section>

        <motion.section
          className="h-fit rounded-2xl bg-sidebar p-7 text-sidebar-foreground shadow-lg lg:col-span-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
        >
          <h2 className="font-display text-lg font-semibold">Uso del QR</h2>
          <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/80">
            Identifica el espacio, no al usuario. La sesión vigente identifica a la persona que hace el
            check-in. Imprime el código y fíjalo en la entrada del espacio; es estático y siempre lleva al
            mismo enlace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SmoothButton
              color="amber"
              disabled={!ready || !qr.url}
              onClick={() => window.print()}
              prefix={<Printer />}
              variant="solid"
            >
              Imprimir QR
            </SmoothButton>
            {ready && qr.url && (
              <SmoothButton
                asChild
                className="text-white hover:bg-white/10"
                prefix={<Download />}
                variant="ghost"
              >
                <a download={fileName} href={qr.url}>
                  Descargar SVG
                </a>
              </SmoothButton>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
