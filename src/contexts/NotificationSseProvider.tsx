import React, { useEffect } from 'react'
import type { MatchingNotification } from '@kimdaegyu/babmukdang-shared/domain'
import { API_BASE_URL } from '@/apis/baseUrl'
import { notificationApi } from '@/apis/notification.api'
import { useAuthStore, useNotificationStore } from '@/store'

const parseNotification = (raw: string): MatchingNotification | null => {
    try {
        return JSON.parse(raw) as MatchingNotification
    } catch {
        return null
    }
}

export function NotificationSseProvider({
    children
}: {
    children: React.ReactNode
}) {
    const accessToken = useAuthStore(state => state.accessToken)
    const latest = useNotificationStore(state => state.latest)
    const addNotification = useNotificationStore(state => state.addNotification)
    const addNotifications = useNotificationStore(
        state => state.addNotifications
    )
    const clearLatest = useNotificationStore(state => state.clearLatest)

    useEffect(() => {
        if (!accessToken) return

        notificationApi
            .getAll()
            .then(addNotifications)
            .catch(() => {
                // 초기 inbox 동기화 실패는 SSE 재연결로 회복한다.
            })

        const source = new EventSource(
            `${API_BASE_URL}/sse/notifications?token=${encodeURIComponent(accessToken)}`,
            { withCredentials: true }
        )

        source.addEventListener('matching-notification', event => {
            const notification = parseNotification((event as MessageEvent).data)
            if (notification) {
                addNotification(notification)
            }
        })

        return () => {
            source.close()
        }
    }, [accessToken, addNotification, addNotifications])

    useEffect(() => {
        if (!latest) return
        const timer = window.setTimeout(clearLatest, 4500)
        return () => window.clearTimeout(timer)
    }, [latest, clearLatest])

    return (
        <>
            {children}
            {latest && (
                <div className="fixed top-20 left-1/2 z-50 w-[calc(100%-40px)] max-w-390 -translate-x-1/2 rounded-20 bg-gray-8 px-18 py-14 text-white shadow-lg">
                    <p className="text-body1-semibold">{latest.title}</p>
                    <p className="text-caption-medium mt-4 text-gray-2">
                        {latest.message}
                    </p>
                </div>
            )}
        </>
    )
}
