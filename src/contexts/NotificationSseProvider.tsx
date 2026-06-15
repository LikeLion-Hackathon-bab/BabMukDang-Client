import React, { useEffect } from 'react'
import {
    CACHE_INVALIDATION_SSE_EVENT,
    CacheInvalidationEventSchema,
    type MatchingNotification
} from '@kimdaegyu/babmukdang-shared/domain'
import { useQueryClient } from '@tanstack/react-query'
import { API_BASE_URL } from '@/apis/baseUrl'
import { useGetNotifications } from '@/apis/notification.api'
import { useAuthStore, useNotificationStore } from '@/store'
import { invalidateFromCacheEvent } from '@/apis/cacheInvalidation'

const parseNotification = (raw: string): MatchingNotification | null => {
    try {
        return JSON.parse(raw) as MatchingNotification
    } catch {
        return null
    }
}

const parseCacheInvalidationEvent = (raw: string) => {
    try {
        return CacheInvalidationEventSchema.parse(JSON.parse(raw))
    } catch (error) {
        console.warn('캐시 무효화 SSE 이벤트 파싱 실패', error)
        return null
    }
}

export function NotificationSseProvider({
    children
}: {
    children: React.ReactNode
}) {
    const accessToken = useAuthStore(state => state.accessToken)
    const queryClient = useQueryClient()
    const latest = useNotificationStore(state => state.latest)
    const addNotification = useNotificationStore(state => state.addNotification)
    const addNotifications = useNotificationStore(
        state => state.addNotifications
    )
    const { data: notifications } = useGetNotifications()
    const clearLatest = useNotificationStore(state => state.clearLatest)

    useEffect(() => {
        addNotifications(notifications ?? [])
    }, [addNotifications, notifications])

    useEffect(() => {
        if (!accessToken) return

        const source = new EventSource(
            `${API_BASE_URL}/sse/notifications?token=${encodeURIComponent(accessToken)}`,
            { withCredentials: true }
        )

        source.onopen = () => {
            console.info('SSE 알림 스트림이 연결되었습니다.')
        }

        source.onerror = error => {
            console.warn('SSE 알림 스트림 연결 오류', error)
        }

        source.addEventListener('matching-notification', event => {
            const notification = parseNotification((event as MessageEvent).data)
            if (notification) {
                addNotification(notification)
            }
        })

        source.addEventListener(CACHE_INVALIDATION_SSE_EVENT, event => {
            const cacheEvent = parseCacheInvalidationEvent(
                (event as MessageEvent).data
            )
            if (cacheEvent) {
                invalidateFromCacheEvent(queryClient, cacheEvent)
            }
        })

        return () => {
            source.close()
        }
    }, [accessToken, addNotification, queryClient])

    useEffect(() => {
        if (!latest) return
        const timer = window.setTimeout(clearLatest, 4500)
        return () => window.clearTimeout(timer)
    }, [latest, clearLatest])

    return (
        <>
            {children}
            {latest && (
                <div className="rounded-20 bg-gray-8 fixed top-20 left-1/2 z-50 w-[calc(100%-40px)] max-w-390 -translate-x-1/2 px-18 py-14 text-white shadow-lg">
                    <p className="text-body1-semibold">{latest.title}</p>
                    <p className="text-caption-medium text-gray-2 mt-4">
                        {latest.message}
                    </p>
                </div>
            )}
        </>
    )
}
