import { describe, expect, it } from 'vitest'
import {
    parseMealPlanPushPayload,
    toNotificationFromPushPayload
} from './pushPayload'

describe('pushPayload', () => {
    it('parses canonical data payload and maps it to notification store shape', () => {
        const parsed = parseMealPlanPushPayload({
            data: {
                schemaVersion: '2026-06-17',
                notificationId: '90000000-0000-4000-8000-000000000001',
                kind: 'MEAL_PLAN_CONFIRMED',
                mealPlanId: '11111111-1111-4111-8111-111111111111',
                deepLink: '/meal-plans/11111111-1111-4111-8111-111111111111',
                title: '확정',
                body: '밥약이 확정됐습니다.',
                fcmPriority: '12',
                liveActivityPriority: '12',
                liveActivityBehavior: 'START_OR_UPDATE'
            }
        })

        expect(parsed?.notificationId).toBe(
            '90000000-0000-4000-8000-000000000001'
        )
        expect(parsed?.fcmPriority).toBe(12)
        expect(parsed && toNotificationFromPushPayload(parsed)).toMatchObject({
            notificationId: '90000000-0000-4000-8000-000000000001',
            message: '밥약이 확정됐습니다.',
            readAt: null
        })
    })

    it('rejects stale or incomplete payloads', () => {
        expect(parseMealPlanPushPayload({ schemaVersion: 'old' })).toBeNull()
        expect(parseMealPlanPushPayload({})).toBeNull()
    })
})
