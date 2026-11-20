import { describe, expect, it } from 'vitest'
import {
    getMealPlanLiveActivityBehavior,
    getMealPlanNotificationPriority,
    shouldShowForegroundToast
} from '@kimdaegyu/babmukdang-shared/domain'

describe('notification priority policy', () => {
    it('uses one policy for Home, inbox, FCM and Live Activity priorities', () => {
        expect(
            getMealPlanNotificationPriority('MEAL_PLAN_JOIN_REQUESTED', 'HOME')
        ).toBeLessThan(
            getMealPlanNotificationPriority(
                'MEAL_PLAN_PARTICIPANT_JOINED',
                'HOME'
            )
        )
        expect(
            getMealPlanNotificationPriority('MEAL_PLAN_LOCKED', 'FCM_PUSH')
        ).toBeLessThan(
            getMealPlanNotificationPriority(
                'MEAL_PLAN_PARTICIPANT_JOINED',
                'FCM_PUSH'
            )
        )
        expect(
            getMealPlanNotificationPriority('MEAL_PLAN_LOCKED', 'LIVE_ACTIVITY')
        ).toBeLessThan(
            getMealPlanNotificationPriority(
                'MEAL_PLAN_RECORD_NEEDED',
                'LIVE_ACTIVITY'
            )
        )
    })

    it('exposes live activity behavior and foreground toast policy', () => {
        expect(getMealPlanLiveActivityBehavior('MEAL_PLAN_LOCKED')).toBe(
            'START_OR_UPDATE'
        )
        expect(getMealPlanLiveActivityBehavior('MEAL_PLAN_RECORD_NEEDED')).toBe(
            'END'
        )
        expect(shouldShowForegroundToast('MEAL_PLAN_INVITE_RECEIVED')).toBe(
            true
        )
    })
})
