import type { MemberLocationSettingsResponse } from '@/apis/types'

export const LOCATION_SYNC_MAX_AGE_MS = 5 * 60 * 1000

export const locationRequestOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10_000,
    maximumAge: 60_000
}

export const shouldRefreshLocationSnapshot = (
    settings: MemberLocationSettingsResponse | null | undefined,
    now = Date.now()
): boolean => {
    if (!settings) return true
    if (settings.locationConsentStatus !== 'GRANTED') return false
    if (!settings.nearbyMealPlanExposureAllowed) return false
    if (!settings.lastKnownLocation) return true
    const capturedAt = Date.parse(settings.lastKnownLocation.capturedAt)
    if (Number.isNaN(capturedAt)) return true
    return now - capturedAt > LOCATION_SYNC_MAX_AGE_MS
}
