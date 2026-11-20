import {
    SwipeableCard,
    MealPlanNotificationCard,
    EmptyNotiView
} from '@/components'
import type { MealPlanNotificationView } from '@/viewModels'

const isExplicitDeleteModeEnabled = () => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('e2e-explicit-delete-mode') === 'true'
}

export function MealPlanNotificationList({
    notifications,
    onDeleteNotification,
    onNotificationClick
}: {
    notifications: MealPlanNotificationView[]
    onDeleteNotification: (id: string) => void
    onNotificationClick: (notification: MealPlanNotificationView) => void
}) {
    if (notifications.length === 0) {
        return <EmptyNotiView variant="mealPlan" />
    }
    return (
        <div className="flex flex-col">
            {notifications.map(notification => (
                <SwipeableCard
                    key={notification.notificationId}
                    explicitDeleteMode={isExplicitDeleteModeEnabled()}
                    deleteButtonTestId={`notification-delete-button-${notification.notificationId}`}
                    onDelete={() =>
                        onDeleteNotification(notification.notificationId)
                    }>
                    <MealPlanNotificationCard
                        notification={notification}
                        onClick={() => onNotificationClick(notification)}
                    />
                </SwipeableCard>
            ))}
        </div>
    )
}
