/** En móvil, cada pantalla abre arriba: la barra inferior permite cambiar de sección desde cualquier punto de la página. */
export const resetMobileScroll = () => {
  if (window.matchMedia('(max-width: 1023px)').matches) window.scrollTo({ top: 0, behavior: 'instant' })
}
