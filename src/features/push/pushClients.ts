import { Capacitor } from '@capacitor/core'
import {
    PushNotifications,
    type Token as NativePushToken
} from '@capacitor/push-notifications'
import type {
    PushPermissionStatus,
    PushPlatform,
    RegisterPushTokenRequest
} from '@kimdaegyu/babmukdang-shared/domain'
import { firebaseConfig, getFCMToken, initializeFirebase } from '@/firebase'
import { getOrCreateDeviceId } from './deviceId'

export type PushTokenRegistration = RegisterPushTokenRequest

type ForegroundMessageUnsubscribe = () => void

export interface PushClient {
    platform: PushPlatform
    getPermissionStatus: () => Promise<PushPermissionStatus>
    getTokenIfPermissionGranted: () => Promise<PushTokenRegistration | null>
    requestToken: () => Promise<PushTokenRegistration | null>
    onForegroundMessage?: (
        callback: (payload: unknown) => void
    ) => ForegroundMessageUnsubscribe
}

const toWebPermissionStatus = (): PushPermissionStatus => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'UNKNOWN'
    }
    if (Notification.permission === 'granted') return 'GRANTED'
    if (Notification.permission === 'denied') return 'DENIED'
    return 'PROMPT'
}

const appVersion = import.meta.env.VITE_APP_VERSION ?? 'web-dev'
const buildNumber = import.meta.env.VITE_BUILD_NUMBER ?? undefined

const registerWebPushServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return undefined
    try {
        return navigator.serviceWorker.register('/firebase-messaging-sw.js')
    } catch (error) {
        console.warn('[push] service worker registration failed', error)
        return undefined
    }
}

export const webPushClient: PushClient = {
    platform: 'WEB',
    getPermissionStatus: async () => toWebPermissionStatus(),
    getTokenIfPermissionGranted: async () => {
        if (toWebPermissionStatus() !== 'GRANTED') return null
        await registerWebPushServiceWorker()
        await initializeFirebase(firebaseConfig)
        const token = await getFCMToken(import.meta.env.VITE_FIREBASE_VAPID_KEY)
        if (!token) return null
        return {
            provider: 'FCM',
            platform: 'WEB',
            token,
            deviceId: getOrCreateDeviceId(),
            appVersion,
            buildNumber,
            permissionStatus: 'GRANTED'
        }
    },
    requestToken: async () => {
        if (!('Notification' in window)) return null
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return null
        return webPushClient.getTokenIfPermissionGranted()
    }
}

const toNativePermissionStatus = async (): Promise<PushPermissionStatus> => {
    const status = await PushNotifications.checkPermissions()
    if (status.receive === 'granted') return 'GRANTED'
    if (status.receive === 'denied') return 'DENIED'
    return 'PROMPT'
}

const getNativePlatform = (): PushPlatform =>
    Capacitor.getPlatform() === 'ios' ? 'IOS' : 'ANDROID'

const getNativeToken = async (): Promise<string | null> => {
    const permission = await toNativePermissionStatus()
    if (permission !== 'GRANTED') return null

    return new Promise(resolve => {
        let resolved = false
        const timeout = window.setTimeout(() => {
            if (!resolved) {
                resolved = true
                resolve(null)
            }
        }, 8000)

        PushNotifications.addListener(
            'registration',
            (token: NativePushToken) => {
                if (resolved) return
                resolved = true
                window.clearTimeout(timeout)
                resolve(token.value)
            }
        )

        PushNotifications.addListener('registrationError', () => {
            if (resolved) return
            resolved = true
            window.clearTimeout(timeout)
            resolve(null)
        })

        PushNotifications.register()
    })
}

export const nativePushClient: PushClient = {
    platform: getNativePlatform(),
    getPermissionStatus: toNativePermissionStatus,
    getTokenIfPermissionGranted: async () => {
        const token = await getNativeToken()
        if (!token) return null
        return {
            provider: 'FCM',
            platform: getNativePlatform(),
            token,
            deviceId: getOrCreateDeviceId(),
            appVersion,
            buildNumber,
            permissionStatus: 'GRANTED'
        }
    },
    requestToken: async () => {
        const permission = await PushNotifications.requestPermissions()
        if (permission.receive !== 'granted') return null
        return nativePushClient.getTokenIfPermissionGranted()
    }
}

export const createPushClient = (): PushClient => {
    if (Capacitor.isNativePlatform()) {
        return nativePushClient
    }
    return webPushClient
}
