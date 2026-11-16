/** Error con la forma común de la API: { code, message, details }. */
export class ApiError extends Error {
  constructor(status, { code, message, details } = {}) {
    super(message || 'No pudimos completar la solicitud.')
    this.status = status
    this.code = code ?? (status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR')
    this.details = details ?? {}
  }
}
