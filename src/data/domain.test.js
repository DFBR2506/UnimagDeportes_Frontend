import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, mapCheckinEligible, mapRules } from '@/data/domain'

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

describe('mapCheckinEligible', () => {
  it('convierte los instantes del DTO a la forma que usan las pantallas', () => {
    const item = mapCheckinEligible({
      reservationId: 'res-1',
      spaceId: 'sp-1',
      startAt: '2026-11-24T14:00:00-05:00',
      endAt: '2026-11-24T16:00:00-05:00',
      opensAt: '2026-11-24T13:50:00-05:00',
      closesAt: '2026-11-24T17:00:00-05:00',
    })
    expect(item).toEqual({
      id: 'res-1',
      spaceId: 'sp-1',
      date: '2026-11-24',
      startHour: 14,
      hours: 2,
      startAt: '2026-11-24T14:00:00-05:00',
      endAt: '2026-11-24T16:00:00-05:00',
      opensAt: '2026-11-24T13:50:00-05:00',
      closesAt: '2026-11-24T17:00:00-05:00',
    })
  })
})
