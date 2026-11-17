import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_PANORAMA_BYTES, MAX_PANORAMA_WIDTH, normalizePanorama, validatePanorama } from './validatePanorama'

const jpeg = () => new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0, 0])], { type: 'image/jpeg' })
let width
let height
let decodeError
let decodePending
let lastImage
let canvas
let context
let normalizedBlob
let encodedDimensions

beforeEach(() => {
  width = 4096
  height = 2048
  decodeError = false
  decodePending = false
  normalizedBlob = new Blob(['normalized-png'], { type: 'image/png' })
  encodedDimensions = []
  context = { drawImage: vi.fn() }
  canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback) => {
      encodedDimensions.push({ width: canvas.width, height: canvas.height })
      queueMicrotask(() => callback(normalizedBlob))
    }),
  }
  vi.stubGlobal('document', { createElement: vi.fn(() => canvas) })
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:validation')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.stubGlobal('Image', class {
    constructor() { lastImage = this }
    get naturalWidth() { return width }
    get naturalHeight() { return height }
    set src(value) {
      if (value && !decodePending) queueMicrotask(() => decodeError ? this.onerror?.() : this.onload?.())
    }
  })
})

afterEach(() => vi.unstubAllGlobals())

describe('validación exclusiva de panoramas', () => {
  it.each([
    ['JPG', [0xff, 0xd8, 0xff]],
    ['PNG', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    ['WebP', [...new TextEncoder().encode('RIFF0000WEBP')]],
  ])('admite %s decodificable y completo 2:1', async (_format, bytes) => {
    expect(await validatePanorama(new Blob([new Uint8Array(bytes)]))).toEqual({ width: 4096, height: 2048 })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:validation')
  })

  it.each(['<!doctype html>', '<svg xmlns="http://www.w3.org/2000/svg"/>', 'invalid'])('rechaza contenido no compatible aunque finja ser JPG: %s', async (content) => {
    await expect(validatePanorama(new Blob([content], { type: 'image/jpeg' }))).rejects.toMatchObject({ code: 'INVALID_PANORAMA' })
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('rechaza archivos vacíos y mayores de 30 MiB antes de decodificar', async () => {
    await expect(validatePanorama(new Blob())).rejects.toMatchObject({ code: 'INVALID_PANORAMA' })
    const oversized = jpeg()
    Object.defineProperty(oversized, 'size', { value: MAX_PANORAMA_BYTES + 1 })
    await expect(validatePanorama(oversized)).rejects.toThrow('30 MiB')
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('acepta proporciones distintas de 2:1 sin modificar el archivo seleccionado', async () => {
    width = 3000
    expect(await validatePanorama(jpeg())).toEqual({ width: 3000, height: 2048 })
    expect(document.createElement).not.toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:validation')
  })

  it('sigue rechazando imágenes sin dimensiones válidas', async () => {
    height = 0
    await expect(validatePanorama(jpeg())).rejects.toThrow('dimensiones válidas')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:validation')
  })

  it('rechaza archivos dañados y libera la URL temporal', async () => {
    decodeError = true
    await expect(validatePanorama(jpeg())).rejects.toThrow('no se puede leer')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:validation')
  })

  it('una solicitud ya cancelada no comienza la decodificación', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(validatePanorama(jpeg(), { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it('cancela también durante la decodificación y libera los recursos', async () => {
    decodePending = true
    const controller = new AbortController()
    const pending = validatePanorama(jpeg(), { signal: controller.signal })
    await vi.waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(lastImage.onload).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:validation')
  })
})

describe('normalización del panorama solo para visualizarlo', () => {
  it('no recodifica una imagen ya 2:1 que cabe en el límite', async () => {
    const original = jpeg()
    expect(await normalizePanorama(original)).toBe(original)
    expect(document.createElement).not.toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:validation')
  })

  it.each([
    [3000, 2000, 3000, 1500],
    [3000, 1000, 3000, 1500],
    [1000, 2500, 1000, 500],
    [3001, 1700, 3000, 1500],
    [1, 1, 2, 1],
    [7166, 1939, 4096, 2048],
    [8192, 4096, 4096, 2048],
  ])('adapta %i × %i a %i × %i usando todo el encuadre', async (sourceWidth, sourceHeight, targetWidth, targetHeight) => {
    width = sourceWidth
    height = sourceHeight
    const original = jpeg()
    const contents = await original.arrayBuffer()

    expect(await normalizePanorama(original)).toBe(normalizedBlob)
    expect(context.drawImage).toHaveBeenCalledExactlyOnceWith(lastImage, 0, 0, targetWidth, targetHeight)
    expect(encodedDimensions).toEqual([{ width: targetWidth, height: targetHeight }])
    expect(targetWidth / targetHeight).toBe(2)
    expect(targetWidth).toBeLessThanOrEqual(MAX_PANORAMA_WIDTH)
    expect(context.imageSmoothingQuality).toBe('high')
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
    expect(await original.arrayBuffer()).toEqual(contents)
  })

  it('no procesa archivos dañados o de formato no permitido', async () => {
    await expect(normalizePanorama(new Blob(['<html/>']))).rejects.toMatchObject({ code: 'INVALID_PANORAMA' })
    decodeError = true
    await expect(normalizePanorama(jpeg())).rejects.toMatchObject({ code: 'INVALID_PANORAMA' })
    expect(document.createElement).not.toHaveBeenCalled()
  })

  it('libera el lienzo si el navegador no ofrece un contexto 2D', async () => {
    width = 3000
    canvas.getContext.mockReturnValue(null)
    await expect(normalizePanorama(jpeg())).rejects.toThrow('no permite adaptar imágenes')
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
  })

  it('maneja y limpia una codificación que devuelve un resultado vacío', async () => {
    width = 3000
    normalizedBlob = null
    await expect(normalizePanorama(jpeg())).rejects.toThrow('No se pudo adaptar')
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
  })

  it('maneja y limpia una excepción del codificador del navegador', async () => {
    width = 3000
    canvas.toBlob.mockImplementation(() => { throw new Error('encoding failed') })
    await expect(normalizePanorama(jpeg())).rejects.toThrow('No se pudo adaptar')
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
  })

  it('no comienza una normalización ya cancelada', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(normalizePanorama(jpeg(), { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
    expect(document.createElement).not.toHaveBeenCalled()
  })

  it('cancela durante la codificación sin entregar un resultado tardío ni retener el lienzo', async () => {
    width = 3000
    let finishEncoding
    canvas.toBlob.mockImplementation((callback) => { finishEncoding = callback })
    const controller = new AbortController()
    const pending = normalizePanorama(jpeg(), { signal: controller.signal })
    await vi.waitFor(() => expect(canvas.toBlob).toHaveBeenCalled())
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
    finishEncoding(normalizedBlob)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:validation')
  })
})
