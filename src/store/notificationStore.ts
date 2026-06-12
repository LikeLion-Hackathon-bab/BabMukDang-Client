import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MatchingNotification } from '@kimdaegyu/babmukdang-shared/domain'

interface NotificationState {
    notifications: MatchingNotification[]
    latest: MatchingNotification | null
    addNotification: (notification: MatchingNotification) => void
    addNotifications: (notifications: MatchingNotification[]) => void
    markRead: (notification: MatchingNotification) => void
    removeNotification: (notificationId: string) => void
    clearLatest: () => void
}

const mergeNotifications = (
    current: MatchingNotification[],
    incoming: MatchingNotification[]
) => {
    const byId = new Map<string, MatchingNotification>()

    for (const notification of [...incoming, ...current]) {
        byId.set(notification.notificationId, notification)
    }

    return Array.from(byId.values()).sort(
        (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
    )
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        set => ({
            notifications: [],
            latest: null,
            addNotification: notification =>
                set(state => ({
                    notifications: mergeNotifications(state.notifications, [
                        notification
                    ]),
                    latest: notification
                })),
            addNotifications: notifications =>
                set(state => ({
                    notifications: mergeNotifications(
                        state.notifications,
                        notifications
                    )
                })),
            markRead: notification =>
                set(state => ({
                    notifications: mergeNotifications(state.notifications, [
                        notification
                    ])
                })),
            removeNotification: notificationId =>
                set(state => ({
                    notifications: state.notifications.filter(
                        notification =>
                            notification.notificationId !== notificationId
                    )
                })),
            clearLatest: () => set({ latest: null })
        }),
        {
            name: 'matching-notification-storage',
            partialize: state => ({ notifications: state.notifications })
        }
    )
)
