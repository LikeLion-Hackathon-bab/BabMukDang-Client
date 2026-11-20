import type {
    MemberLocationSettingsResponse,
    UpdateMemberLocationRequest
} from '@/apis/types'
import { shouldRefreshLocationSnapshot } from './locationSyncPolicy'
import { type PermissionAdapter } from './permissionAdapter'

export type LocationSyncReason =
    | 'NO_SETTINGS'
    | 'SERVICE_CONSENT_NOT_GRANTED'
    | 'NEARBY_EXPOSURE_DISABLED'
    | 'LOCATION_FRESH'
    | 'DEVICE_PERMISSION_NOT_GRANTED'
    | 'SYNCED'
    | 'FAILED'

export type LocationSyncResult = {
    refreshed: boolean
    reason: LocationSyncReason
    location?: UpdateMemberLocationRequest
    error?: Error
}

export type LocationSyncServiceOptions = {
    now?: number
    force?: boolean
}

export class LocationSyncService {
    constructor(private readonly adapter: PermissionAdapter) {}

    async syncIfNeeded({
        settings,
        updateLocation,
        options
    }: {
        settings: MemberLocationSettingsResponse | null | undefined
        updateLocation: (
            location: UpdateMemberLocationRequest
        ) => Promise<MemberLocationSettingsResponse>
        options?: LocationSyncServiceOptions
    }): Promise<LocationSyncResult> {
        const stale = options?.force
            ? true
            : shouldRefreshLocationSnapshot(settings, options?.now)

        if (!settings) return { refreshed: false, reason: 'NO_SETTINGS' }
        if (settings.locationConsentStatus !== 'GRANTED') {
            return { refreshed: false, reason: 'SERVICE_CONSENT_NOT_GRANTED' }
        }
        if (!settings.nearbyMealPlanExposureAllowed) {
            return { refreshed: false, reason: 'NEARBY_EXPOSURE_DISABLED' }
        }
        if (!stale) return { refreshed: false, reason: 'LOCATION_FRESH' }

        const permission = await this.adapter.getPermissionSnapshot('LOCATION')
        if (permission.status !== 'GRANTED') {
            return { refreshed: false, reason: 'DEVICE_PERMISSION_NOT_GRANTED' }
        }

        try {
            const location = await this.adapter.getCurrentPosition()
            await updateLocation(location)
            return { refreshed: true, reason: 'SYNCED', location }
        } catch (error) {
            return {
                refreshed: false,
                reason: 'FAILED',
                error:
                    error instanceof Error
                        ? error
                        : new Error('Location sync failed')
            }
        }
    }
}
