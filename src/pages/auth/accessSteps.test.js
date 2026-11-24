import { describe, expect, it } from 'vitest'
import { resolveAccessProgress } from '@/pages/auth/accessSteps'

describe('resolveAccessProgress', () => {
  it('oculta Perfil cuando la cuenta ya tiene nombre', () => {
    const progress = resolveAccessProgress('/acceso', false)
    expect(progress.steps.map((step) => step.label)).toEqual(['Correo', 'Código'])
    expect(progress.current).toBe(0)
  })

  it('oculta Perfil mientras no se conoce si la cuenta necesita nombre', () => {
    const progress = resolveAccessProgress('/acceso')
    expect(progress.steps.map((step) => step.label)).toEqual(['Correo', 'Código'])
  })

  it('mantiene solo Correo y Código mientras se ingresa el código', () => {
    const progress = resolveAccessProgress('/acceso/codigo', false)
    expect(progress.steps.map((step) => step.label)).toEqual(['Correo', 'Código'])
    expect(progress.current).toBe(1)
  })

  it('muestra Perfil cuando la cuenta necesita nombre', () => {
    const progress = resolveAccessProgress('/acceso/nombre', true)
    expect(progress.steps.map((step) => step.label)).toEqual(['Correo', 'Código', 'Perfil'])
    expect(progress.current).toBe(2)
  })

  it('no muestra progreso fuera del flujo de acceso', () => {
    expect(resolveAccessProgress('/bienvenida', false)).toBeNull()
  })
})
