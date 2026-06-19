import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
    getMessaging,
    getToken,
    onMessage,
    type Messaging,
    isSupported
} from 'firebase/messaging'

export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? ''
}

const hasFirebaseConfig = () =>
    Boolean(
        firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.messagingSenderId &&
        firebaseConfig.appId
    )

let app: FirebaseApp | null = null
let messaging: Messaging | null = null

export const initializeFirebase = async (
    config = firebaseConfig
): Promise<FirebaseApp | null> => {
    if (app) return app
    if (!hasFirebaseConfig()) return null

    app = getApps().length > 0 ? getApps()[0] : initializeApp(config)

    if (await isSupported()) {
        messaging = getMessaging(app)
    }

    return app
}

export const getMessagingInstance = (): Messaging | null => messaging

export const getFCMToken = async (
    vapidKey?: string
): Promise<string | null> => {
    const appInstance = await initializeFirebase()
    if (!appInstance || !messaging || !vapidKey) return null

    try {
        const currentToken = await getToken(messaging, { vapidKey })
        return currentToken || null
    } catch (error) {
        console.warn('[push] FCM token registration failed', error)
        return null
    }
}

export const onForegroundMessage = async (
    callback: (payload: unknown) => void
) => {
    await initializeFirebase()
    if (!messaging) return () => {}
    return onMessage(messaging, payload => callback(payload))
}

export default app
