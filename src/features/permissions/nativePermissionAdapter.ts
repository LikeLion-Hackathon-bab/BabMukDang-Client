import { Camera } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { PushNotifications } from '@capacitor/push-notifications'
import type { PermissionKind, PermissionStatus } from '@/apis/types'
import {
    PermissionRequestError,
    toPermissionSnapshot,
    type PermissionAdapter
} from './permissionAdapter'

const mapNativePermission = (
    value: string | undefined,
    fallback: PermissionStatus = 'UNKNOWN'
): PermissionStatus => {
    if (value === 'granted') return 'GRANTED'
    if (value === 'denied') return 'DENIED'
    if (value === 'prompt') return 'PROMPT'
    if (value === 'prompt-with-rationale') return 'PROMPT'
    if (value === 'limited') return 'LIMITED'
    return fallback
}

const canAskAgain = (status: PermissionStatus) =>
    status !== 'DENIED' && status !== 'UNSUPPORTED'

export const nativePermissionAdapter: PermissionAdapter = {
    async getPermissionSnapshot(kind: PermissionKind) {
        if (kind === 'LOCATION') {
            const permissions = await Geolocation.checkPermissions()
            const status = mapNativePermission(permissions.location)
            return toPermissionSnapshot({
                kind,
                status,
                canAskAgain: canAskAgain(status)
            })
        }

        if (kind === 'CAMERA') {
            const permissions = await Camera.checkPermissions()
            const status = mapNativePermission(permissions.camera)
            return toPermissionSnapshot({
                kind,
                status,
                canAskAgain: canAskAgain(status)
            })
        }

        const permissions = await PushNotifications.checkPermissions()
        const status = mapNativePermission(permissions.receive)
        return toPermissionSnapshot({
            kind,
            status,
            canAskAgain: canAskAgain(status)
        })
    },

    async requestNotificationPermission() {
        const permissions = await PushNotifications.requestPermissions()
        const status = mapNativePermission(permissions.receive)
        return toPermissionSnapshot({
            kind: 'NOTIFICATION',
            status,
            canAskAgain: canAskAgain(status)
        })
    },

    async requestLocationPermission() {
        const permissions = await Geolocation.requestPermissions()
        const status = mapNativePermission(permissions.location)
        return toPermissionSnapshot({
            kind: 'LOCATION',
            status,
            canAskAgain: canAskAgain(status)
        })
    },

    async requestCameraPermission() {
        const permissions = await Camera.requestPermissions({
            permissions: ['camera']
        })
        const status = mapNativePermission(permissions.camera)
        return toPermissionSnapshot({
            kind: 'CAMERA',
            status,
            canAskAgain: canAskAgain(status)
        })
    },

    async getCurrentPosition() {
        try {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10_000,
                maximumAge: 60_000
            })
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracyMeters: position.coords.accuracy ?? undefined,
                capturedAt: new Date(position.timestamp).toISOString()
            }
        } catch (error) {
            throw new PermissionRequestError(
                error instanceof Error
                    ? error.message
                    : '현재 기기 위치를 가져오지 못했습니다.',
                'UNKNOWN'
            )
        }
    }
}
