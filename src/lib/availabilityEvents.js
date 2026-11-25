const listeners = new Set()

/** Invalidación local; cada vista vuelve a consultar su fuente autoritativa. */
export const notifyAvailabilityChanged = (spaceId) => {
  listeners.forEach((listener) => listener(spaceId))
}

export const onAvailabilityChanged = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
