import { Capacitor } from '@capacitor/core'
import type {
    DevicePermissionSnapshot,
    PermissionKind,
    PermissionPlatform,
    PermissionStatus,
    UpdateMemberLocationRequest
} from '@/apis/types'
import { nativePermissionAdapter } from './nativePermissionAdapter'
import { webPermissionAdapter } from './webPermissionAdapter'

export class PermissionRequestError extends Error {
    constructor(
        message: string,
        public readonly status: PermissionStatus
    ) {
        super(message)
        this.name = 'PermissionRequestError'
    }
}

export interface PermissionAdapter {
    getPermissionSnapshot(
        kind: PermissionKind
    ): Promise<DevicePermissionSnapshot>
    requestNotificationPermission(): Promise<DevicePermissionSnapshot>
    requestLocationPermission(): Promise<DevicePermissionSnapshot>
    requestCameraPermission(): Promise<DevicePermissionSnapshot>
    getCurrentPosition(): Promise<UpdateMemberLocationRequest>
}

export const nowIso = () => new Date().toISOString()

export const detectPermissionPlatform = (): PermissionPlatform => {
    if (Capacitor.isNativePlatform()) {
        const platform = Capacitor.getPlatform()
        if (platform === 'ios') return 'IOS'
        if (platform === 'android') return 'ANDROID'
    }

    if (typeof window === 'undefined') return 'WEB'
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    if (isIOS) return 'IOS'
    if (isAndroid) return 'ANDROID'
    return 'WEB'
}

export const toPermissionSnapshot = ({
    kind,
    status,
    canAskAgain
}: {
    kind: PermissionKind
    status: PermissionStatus
    canAskAgain?: boolean
}): DevicePermissionSnapshot => ({
    kind,
    status,
    platform: detectPermissionPlatform(),
    canAskAgain,
    checkedAt: nowIso()
})

export const createPermissionAdapter = (): PermissionAdapter =>
    Capacitor.isNativePlatform()
        ? nativePermissionAdapter
        : webPermissionAdapter

export const permissionAdapter = createPermissionAdapter()
