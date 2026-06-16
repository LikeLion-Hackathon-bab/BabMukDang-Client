import {
    SwipeableCard,
    MealPlanNotificationCard,
    EmptyNotiView
} from '@/components'
import type { MealPlanNotificationView } from '@/viewModels'

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
