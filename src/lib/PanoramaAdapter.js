import { EquirectangularAdapter } from '@photo-sphere-viewer/core'

/** La textura ya es una esfera completa: los GPano de recorte no deben reinterpretarla. */
export default class PanoramaAdapter extends EquirectangularAdapter {
  cancelled = false

  constructor(viewer) {
    super(viewer, { useXmpData: false })
  }

  cancel() {
    this.cancelled = true
  }

  async loadTexture(panorama, loader = true, panoData) {
    if (this.cancelled) throw new DOMException('Carga del panorama cancelada.', 'AbortError')
    const texture = await super.loadTexture(panorama, loader, panoData, false)
    if (this.cancelled) {
      this.disposeTexture(texture)
      throw new DOMException('Carga del panorama cancelada.', 'AbortError')
    }
    return texture
  }

  destroy() {
    this.cancel()
    super.destroy()
  }
}
