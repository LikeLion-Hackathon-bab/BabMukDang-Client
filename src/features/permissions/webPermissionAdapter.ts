import type { PermissionKind, PermissionStatus } from '@/apis/types'
import { locationRequestOptions } from './locationSyncPolicy'
import {
    PermissionRequestError,
    toPermissionSnapshot,
    type PermissionAdapter
} from './permissionAdapter'

type BrowserPermissionName = PermissionName | 'camera'

const mapBrowserPermissionState = (
    state: PermissionState | undefined
): PermissionStatus => {
    if (state === 'granted') return 'GRANTED'
    if (state === 'denied') return 'DENIED'
    if (state === 'prompt') return 'PROMPT'
    return 'UNKNOWN'
}

const queryPermission = async (kind: PermissionKind) => {
    if (typeof window === 'undefined' || !('permissions' in navigator)) {
        return toPermissionSnapshot({ kind, status: 'UNKNOWN' })
    }

    const name: BrowserPermissionName =
        kind === 'LOCATION'
            ? 'geolocation'
            : kind === 'CAMERA'
              ? 'camera'
              : 'notifications'

    try {
        const result = await navigator.permissions.query({
            name: name as PermissionName
        })
        const status = mapBrowserPermissionState(result.state)
        return toPermissionSnapshot({
            kind,
            status,
            canAskAgain: status !== 'DENIED'
        })
    } catch {
        return toPermissionSnapshot({ kind, status: 'UNKNOWN' })
    }
}

export const webPermissionAdapter: PermissionAdapter = {
    async getPermissionSnapshot(kind) {
        if (typeof window === 'undefined') {
            return toPermissionSnapshot({
                kind,
                status: 'UNSUPPORTED',
                canAskAgain: false
            })
        }

        if (kind === 'NOTIFICATION' && 'Notification' in window) {
            const status =
                Notification.permission === 'granted'
                    ? 'GRANTED'
                    : Notification.permission === 'denied'
                      ? 'DENIED'
                      : 'PROMPT'
            return toPermissionSnapshot({
                kind,
                status,
                canAskAgain: status !== 'DENIED'
            })
        }

        return queryPermission(kind)
    },

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return toPermissionSnapshot({
                kind: 'NOTIFICATION',
                status: 'UNSUPPORTED',
                canAskAgain: false
            })
        }
        const permission = await Notification.requestPermission()
        const status =
            permission === 'granted'
                ? 'GRANTED'
                : permission === 'denied'
                  ? 'DENIED'
                  : 'PROMPT'
        return toPermissionSnapshot({
            kind: 'NOTIFICATION',
            status,
            canAskAgain: status !== 'DENIED'
        })
    },

    async requestLocationPermission() {
        if (!navigator.geolocation) {
            return toPermissionSnapshot({
                kind: 'LOCATION',
                status: 'UNSUPPORTED',
                canAskAgain: false
            })
        }

        try {
            await this.getCurrentPosition()
            return toPermissionSnapshot({
                kind: 'LOCATION',
                status: 'GRANTED',
                canAskAgain: true
            })
        } catch (error) {
            const code =
                typeof error === 'object' && error !== null && 'code' in error
                    ? Number((error as { code?: number }).code)
                    : 0
            const denied = code === 1
            return toPermissionSnapshot({
                kind: 'LOCATION',
                status: denied ? 'DENIED' : 'UNKNOWN',
                canAskAgain: !denied
            })
        }
    },

    async requestCameraPermission() {
        if (!navigator.mediaDevices?.getUserMedia) {
            return toPermissionSnapshot({
                kind: 'CAMERA',
                status: 'UNSUPPORTED',
                canAskAgain: false
            })
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            })
            stream.getTracks().forEach(track => track.stop())
            return toPermissionSnapshot({
                kind: 'CAMERA',
                status: 'GRANTED',
                canAskAgain: true
            })
        } catch (error) {
            const denied =
                error instanceof DOMException &&
                ['NotAllowedError', 'PermissionDeniedError'].includes(
                    error.name
                )
            return toPermissionSnapshot({
                kind: 'CAMERA',
                status: denied ? 'DENIED' : 'UNKNOWN',
                canAskAgain: !denied
            })
        }
    },

    async getCurrentPosition() {
        if (!navigator.geolocation) {
            throw new PermissionRequestError(
                '현재 브라우저에서 위치 권한을 사용할 수 없습니다.',
                'UNSUPPORTED'
            )
        }

        const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    locationRequestOptions
                )
            }
        )

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
            capturedAt: new Date(position.timestamp).toISOString()
        }
    }
}
