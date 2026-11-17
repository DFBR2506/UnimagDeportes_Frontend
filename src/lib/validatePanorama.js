import { ApiError } from '@/lib/apiError'

export const MAX_PANORAMA_BYTES = 30 * 1024 * 1024
export const MAX_PANORAMA_WIDTH = 4096
export const PANORAMA_ACCEPT = 'image/jpeg,image/png,image/webp'

const invalid = (message) => new ApiError(422, { code: 'INVALID_PANORAMA', message })

function hasSupportedSignature(bytes) {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, i) => bytes[i] === byte)
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  return jpeg || png || webp
}

function readImage(blob, signal) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    const cleanup = () => {
      image.onload = null
      image.onerror = null
      signal?.removeEventListener('abort', abort)
      URL.revokeObjectURL(url)
    }
    const abort = () => {
      cleanup()
      image.src = ''
      reject(signal.reason ?? new DOMException('Carga cancelada.', 'AbortError'))
    }

    image.onload = () => {
      cleanup()
      resolve(image)
    }
    image.onerror = () => {
      cleanup()
      reject(invalid('El archivo no se puede leer como imagen. Usa un panorama PNG, JPG/JPEG o WebP válido.'))
    }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) abort()
    else image.src = url
  })
}

async function loadPanorama(blob, signal) {
  signal?.throwIfAborted()
  if (!(blob instanceof Blob) || !blob.size) throw invalid('El panorama está vacío o no es una imagen.')
  if (blob.size > MAX_PANORAMA_BYTES) throw invalid('El panorama supera el máximo de 30 MiB.')

  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer())
  signal?.throwIfAborted()
  if (!hasSupportedSignature(bytes)) throw invalid('Usa un panorama PNG, JPG/JPEG o WebP. No se admiten SVG ni documentos HTML.')

  const image = await readImage(blob, signal)
  signal?.throwIfAborted()
  if (!image.naturalWidth || !image.naturalHeight) {
    throw invalid('El panorama no tiene dimensiones válidas.')
  }
  return image
}

/** Comprueba el archivo sin imponer una proporción ni modificarlo. PREVIEW no pasa por aquí. */
export async function validatePanorama(blob, { signal } = {}) {
  const image = await loadPanorama(blob, signal)
  return { width: image.naturalWidth, height: image.naturalHeight }
}

function encodeCanvas(canvas, signal) {
  return new Promise((resolve, reject) => {
    const cleanup = () => signal?.removeEventListener('abort', abort)
    const abort = () => {
      cleanup()
      reject(signal.reason ?? new DOMException('Adaptación cancelada.', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) {
      abort()
      return
    }

    try {
      // PNG conserva la transparencia y no añade pérdidas de compresión al estirado.
      canvas.toBlob((blob) => {
        cleanup()
        if (signal?.aborted) return
        if (blob) resolve(blob)
        else reject(invalid('No se pudo adaptar el panorama a 2:1. Vuelve a intentar.'))
      }, 'image/png')
    } catch {
      cleanup()
      reject(invalid('No se pudo adaptar el panorama a 2:1 en este navegador.'))
    }
  })
}

/** Adapta todo el encuadre a 2:1 en memoria, sin recortar ni sobrescribir el original. */
export async function normalizePanorama(blob, { signal } = {}) {
  const image = await loadPanorama(blob, signal)
  // Ancho par para lograr 2:1 exacto incluso con dimensiones impares o imágenes de 1 px.
  const width = Math.min(MAX_PANORAMA_WIDTH, Math.max(2, image.naturalWidth - image.naturalWidth % 2))
  const height = width / 2
  if (image.naturalWidth === width && image.naturalHeight === height) return blob

  const canvas = document.createElement('canvas')
  try {
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw invalid('Este navegador no permite adaptar imágenes al visor 360°.')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, width, height)
    signal?.throwIfAborted()
    const normalized = await encodeCanvas(canvas, signal)
    signal?.throwIfAborted()
    return normalized
  } finally {
    // Libera el búfer del lienzo también al cancelar o fallar la codificación.
    canvas.width = 0
    canvas.height = 0
  }
}
