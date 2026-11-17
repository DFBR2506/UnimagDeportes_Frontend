// Se conservan los IDs originales para no romper reservas y bloqueos de la demo.
export const DEMO_SPACE_IDS = {
  multiple1: 'a1b2c3d4-0001-4000-8000-000000000001',
  tennis1: 'a1b2c3d4-0002-4000-8000-000000000002',
  multiple2: 'a1b2c3d4-0003-4000-8000-000000000003',
  football5: 'a1b2c3d4-0004-4000-8000-000000000004',
  football11: 'a1b2c3d4-0005-4000-8000-000000000005',
}

export const DEMO_CATALOG_VERSION = 2

export const DEMO_PANORAMAS = {
  [DEMO_SPACE_IDS.multiple1]: 'multiple-1.png',
  [DEMO_SPACE_IDS.multiple2]: 'multiple-2.png',
  [DEMO_SPACE_IDS.tennis1]: 'tenis-1.png',
  [DEMO_SPACE_IDS.football5]: 'futbol-5.png',
  [DEMO_SPACE_IDS.football11]: 'futbol-11.png',
}

/** Migración única: no restablece estados, horarios, reservas ni espacios personalizados. */
export function migrateDemoCatalog(state) {
  if ((state.catalogVersion ?? 1) >= DEMO_CATALOG_VERSION) return false

  for (const space of state.spaces) {
    if (space.id === DEMO_SPACE_IDS.multiple1) space.name = 'Cancha múltiple 1'
    if (space.id === DEMO_SPACE_IDS.multiple2) {
      space.name = 'Cancha múltiple 2'
      space.disciplines = ['FOOTBALL_5', 'BASKETBALL']
      if (space.capacity === 4) space.capacity = 20
    }
  }

  state.catalogVersion = DEMO_CATALOG_VERSION
  return true
}
