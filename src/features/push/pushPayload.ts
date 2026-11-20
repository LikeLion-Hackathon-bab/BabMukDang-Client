import {
    MealPlanPushPayloadDataSchema,
    type MealPlanNotification,
    type MealPlanPushPayloadData
} from '@kimdaegyu/babmukdang-shared/domain'

export const parseMealPlanPushPayload = (
    payload: unknown
): MealPlanPushPayloadData | null => {
    const candidate =
        typeof payload === 'object' && payload !== null && 'data' in payload
            ? (payload as { data?: unknown }).data
            : payload

    const parsed = MealPlanPushPayloadDataSchema.safeParse(candidate)
    return parsed.success ? parsed.data : null
}

export const toNotificationFromPushPayload = (
    payload: MealPlanPushPayloadData
): MealPlanNotification => ({
    notificationId: payload.notificationId,
    kind: payload.kind,
    mealPlanId: payload.mealPlanId,
    deepLink: payload.deepLink,
    title: payload.title,
    message: payload.body,
    createdAt: new Date().toISOString(),
    readAt: null
})
