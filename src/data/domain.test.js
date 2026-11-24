import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, mapRules } from '@/data/domain'

describe('mapRules', () => {
  it('aplica los máximos fijos cuando la API aún no los envía', () => {
    const rules = mapRules({
      reservation: { slotMinutes: 60, maxSlotsPerReservation: 2, maxAdvanceDays: 6 },
      quota: { weeklyHours: 4 },
      cancellation: { lateThresholdMinutes: 60 },
      checkIn: { opensMinutesBefore: 10, closesAtReservationEnd: false },
      reminder: {},
      sanctions: {},
    })
    expect(rules.cuotaDiariaHoras).toBe(2)
    expect(rules.checkinCierraMinDespues).toBe(60)
    expect(rules.checkinCierraAlFinal).toBe(false)
  })

  it('conserva los valores del backend cuando están presentes', () => {
    const rules = mapRules({
      reservation: {},
      quota: { weeklyHours: 8, dailyHours: 2 },
      cancellation: {},
      checkIn: { opensMinutesBefore: 5, closesAtReservationEnd: false, closesMinutesAfterEnd: 30 },
      reminder: {},
      sanctions: {},
    })
    expect(rules.cuotaSemanalHoras).toBe(8)
    expect(rules.cuotaDiariaHoras).toBe(2)
    expect(rules.checkinAntesMin).toBe(5)
    expect(rules.checkinCierraMinDespues).toBe(30)
  })

  it('DEFAULT_SETTINGS refleja los predeterminados del backend', () => {
    expect(DEFAULT_SETTINGS.cuotaDiariaHoras).toBe(2)
    expect(DEFAULT_SETTINGS.checkinCierraMinDespues).toBe(60)
    expect(DEFAULT_SETTINGS.checkinCierraAlFinal).toBe(false)
  })
})
