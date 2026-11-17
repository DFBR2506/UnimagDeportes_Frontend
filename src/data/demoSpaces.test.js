import { describe, expect, it } from 'vitest'
import { DEMO_CATALOG_VERSION, DEMO_PANORAMAS, DEMO_SPACE_IDS, migrateDemoCatalog } from './demoSpaces'

describe('catálogo y archivos de panoramas demo', () => {
  it('asocia los cinco nombres acordados a IDs distintos y estables', () => {
    expect(Object.values(DEMO_PANORAMAS).sort()).toEqual([
      'futbol-11.png', 'futbol-5.png', 'multiple-1.png', 'multiple-2.png', 'tenis-1.png',
    ])
    expect(DEMO_SPACE_IDS.multiple2).toBe('a1b2c3d4-0003-4000-8000-000000000003')
    expect(new Set(Object.values(DEMO_SPACE_IDS)).size).toBe(5)
  })

  it('migra solo el catálogo afectado sin borrar referencias, ediciones ni otros datos', () => {
    const state = {
      spaces: [
        { id: DEMO_SPACE_IDS.multiple1, name: 'Cancha múltiple', capacity: 24, openingTime: '09:00', status: 'MAINTENANCE' },
        { id: DEMO_SPACE_IDS.multiple2, name: 'Cancha de tenis 2', capacity: 4, disciplines: ['TENNIS'] },
        { id: DEMO_SPACE_IDS.football5, name: 'Cancha fútbol 5', status: 'MAINTENANCE' },
        { id: 'custom', name: 'Mi espacio', disciplines: ['TENNIS'] },
      ],
      reservations: [{ id: 'reservation', spaceId: DEMO_SPACE_IDS.multiple2 }],
      blocks: [{ id: 'block', spaceId: DEMO_SPACE_IDS.multiple1 }],
      params: { weeklyHours: 8 },
    }
    const reservations = state.reservations
    const blocks = state.blocks

    expect(migrateDemoCatalog(state)).toBe(true)
    expect(state.catalogVersion).toBe(DEMO_CATALOG_VERSION)
    expect(state.spaces[0]).toMatchObject({ name: 'Cancha múltiple 1', capacity: 24, openingTime: '09:00', status: 'MAINTENANCE' })
    expect(state.spaces[1]).toMatchObject({ name: 'Cancha múltiple 2', capacity: 20, disciplines: ['FOOTBALL_5', 'BASKETBALL'] })
    expect(state.spaces[2].status).toBe('MAINTENANCE')
    expect(state.spaces[3]).toEqual({ id: 'custom', name: 'Mi espacio', disciplines: ['TENNIS'] })
    expect(state.reservations).toBe(reservations)
    expect(state.blocks).toBe(blocks)
    expect(state.params.weeklyHours).toBe(8)
  })

  it('se ejecuta una sola vez y respeta ediciones posteriores', () => {
    const state = { spaces: [{ id: DEMO_SPACE_IDS.multiple2, capacity: 30 }] }
    migrateDemoCatalog(state)
    state.spaces[0].name = 'Nombre editado por administrador'
    state.spaces[0].disciplines = ['BASKETBALL']

    expect(migrateDemoCatalog(state)).toBe(false)
    expect(state.spaces[0].name).toBe('Nombre editado por administrador')
    expect(state.spaces[0].capacity).toBe(30)
    expect(state.spaces[0].disciplines).toEqual(['BASKETBALL'])
  })
})
