import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MealPlanNotification } from '@kimdaegyu/babmukdang-shared/domain'

interface NotificationState {
    notifications: MealPlanNotification[]
    latest: MealPlanNotification | null
    addNotification: (notification: MealPlanNotification) => void
    addNotifications: (notifications: MealPlanNotification[]) => void
    markRead: (notification: MealPlanNotification) => void
    removeNotification: (notificationId: string) => void
    clearLatest: () => void
}

const mergeNotifications = (
    current: MealPlanNotification[],
    incoming: MealPlanNotification[]
) => {
    const byId = new Map<string, MealPlanNotification>()

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
            name: 'meal-plan-notification-storage',
            partialize: state => ({ notifications: state.notifications })
        }
    )
)
