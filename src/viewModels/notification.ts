import type { MealPlanNotification } from '@kimdaegyu/babmukdang-shared/domain'

export type MealPlanNotificationView = MealPlanNotification & {
    createdAtLabel?: string
}
