import { describe, expect, it } from 'vitest'
import { shouldRefreshLocationSnapshot } from './locationSyncPolicy'
import type { MemberLocationSettingsResponse } from '@/apis/types'

const settings = (
    overrides: Partial<MemberLocationSettingsResponse> = {}
): MemberLocationSettingsResponse => ({
    locationConsentStatus: 'GRANTED',
    nearbyMealPlanExposureAllowed: true,
    mealSuggestionAllowed: true,
    lastKnownLocation: {
        latitude: 37.5665,
        longitude: 126.978,
        accuracyMeters: 20,
        capturedAt: '2026-06-17T09:55:00.000Z'
    },
    permissionSnapshot: null,
    updatedAt: '2026-06-17T09:55:00.000Z',
    ...overrides
})

describe('locationSyncPolicy', () => {
    it('refreshes when there is no saved location', () => {
        expect(
            shouldRefreshLocationSnapshot(
                settings({ lastKnownLocation: null }),
                Date.parse('2026-06-17T10:00:00.000Z')
            )
        ).toBe(true)
    })

    it('does not refresh when service consent or exposure toggle is disabled', () => {
        expect(
            shouldRefreshLocationSnapshot(
                settings({ locationConsentStatus: 'DENIED' }),
                Date.parse('2026-06-17T10:10:00.000Z')
            )
        ).toBe(false)
        expect(
            shouldRefreshLocationSnapshot(
                settings({ nearbyMealPlanExposureAllowed: false }),
                Date.parse('2026-06-17T10:10:00.000Z')
            )
        ).toBe(false)
    })

    it('refreshes stale snapshots older than max age', () => {
        expect(
            shouldRefreshLocationSnapshot(
                settings(),
                Date.parse('2026-06-17T10:01:00.000Z')
            )
        ).toBe(true)
    })
})
