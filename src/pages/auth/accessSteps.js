/** Pasos del acceso (UC01); «Perfil» solo aplica cuando falta el nombre (RN-59). */
const EMAIL_STEP = { label: 'Correo', paths: ['/acceso', '/acceso/no-permitido'] }
const CODE_STEP = { label: 'Código', paths: ['/acceso/codigo'] }
const PROFILE_STEP = { label: 'Perfil', paths: ['/acceso/nombre'] }

/**
 * Pasos visibles del acceso según la ruta y si la cuenta ya tiene nombre.
 * Devuelve `null` fuera del flujo de acceso.
 */
export function resolveAccessProgress(pathname, needsName = false) {
  // El backend no revela si la cuenta existe hasta verificar el código, así que
  // «Perfil» solo se anuncia cuando la cuenta realmente lo necesita.
  const steps = needsName ? [EMAIL_STEP, CODE_STEP, PROFILE_STEP] : [EMAIL_STEP, CODE_STEP]
  const current = steps.findIndex((step) => step.paths.includes(pathname))
  return current < 0 ? null : { steps, current }
}
