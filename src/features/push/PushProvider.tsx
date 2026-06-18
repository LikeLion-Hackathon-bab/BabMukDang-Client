import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBootstrap } from '@/contexts'
import { useQueryClient } from '@tanstack/react-query'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { onForegroundMessage } from '@/firebase'
import { queryKeys } from '@/apis'
import { useNotificationStore } from '@/store/notificationStore'
import {
    parseMealPlanPushPayload,
    toNotificationFromPushPayload
} from './pushPayload'
import {
    normalizePushDeepLink,
    savePendingPushDeepLink,
    consumePendingPushDeepLink
} from './pushClickRouter'

export function PushProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate()
    const { isAuthenticated } = useAppBootstrap()
    const queryClient = useQueryClient()
    const addNotification = useNotificationStore(state => state.addNotification)

    useEffect(() => {
        let unsubscribe: (() => void) | undefined
        onForegroundMessage(payload => {
            const parsed = parseMealPlanPushPayload(payload)
            if (!parsed) return
            addNotification(toNotificationFromPushPayload(parsed))
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all })
        }).then(fn => {
            unsubscribe = fn
        })

        return () => unsubscribe?.()
    }, [addNotification, queryClient])


    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return

        let removeReceived: (() => Promise<void>) | undefined
        let removeAction: (() => Promise<void>) | undefined

        PushNotifications.addListener('pushNotificationReceived', notification => {
            const parsed = parseMealPlanPushPayload(notification.data)
            if (!parsed) return
            addNotification(toNotificationFromPushPayload(parsed))
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all })
        }).then(handle => {
            removeReceived = () => handle.remove()
        })

        PushNotifications.addListener('pushNotificationActionPerformed', action => {
            const parsed = parseMealPlanPushPayload(action.notification.data)
            if (!parsed) return
            const normalized = normalizePushDeepLink(parsed.deepLink)
            savePendingPushDeepLink(normalized)
            navigate(normalized)
        }).then(handle => {
            removeAction = () => handle.remove()
        })

        return () => {
            removeReceived?.()
            removeAction?.()
        }
    }, [addNotification, navigate, queryClient])

    useEffect(() => {
        if (!isAuthenticated) return
        const pendingDeepLink = consumePendingPushDeepLink()
        if (pendingDeepLink) navigate(pendingDeepLink)
    }, [isAuthenticated, navigate])

    useEffect(() => {
        const onServiceWorkerMessage = (event: MessageEvent) => {
            if (event.data?.type !== 'BABMUKDANG_PUSH_CLICK') return
            const deepLink = event.data.deepLink
            if (typeof deepLink !== 'string') return
            const normalized = normalizePushDeepLink(deepLink)
            savePendingPushDeepLink(normalized)
            navigate(normalized)
        }

        navigator.serviceWorker?.addEventListener(
            'message',
            onServiceWorkerMessage
        )
        return () =>
            navigator.serviceWorker?.removeEventListener(
                'message',
                onServiceWorkerMessage
            )
    }, [navigate])

    return <>{children}</>
}
