import { describe, expect, it } from 'vitest'
import {
    buildPathFromActivity,
    getRouteByActivityName,
    resolvePathToActivity
} from './routes'

describe('Stackflow route bridge', () => {
    it('resolves deep links into a typed Stackflow activity and params', () => {
        const target = resolvePathToActivity(
            '/meal-plans/11111111-1111-4111-8111-111111111111/decision?from=push'
        )

        expect(target?.route.name).toBe('MealPlanDecisionActivity')
        expect(target?.params).toMatchObject({
            mealPlanId: '11111111-1111-4111-8111-111111111111',
            from: 'push'
        })
    })

    it('rebuilds activity params as a shareable route', () => {
        const route = getRouteByActivityName('MealPlanGuestJoinActivity')
        expect(route).toBeDefined()
        expect(
            buildPathFromActivity(route!, {
                token: 'guest-token',
                source: 'notification'
            })
        ).toBe('/meal-plan-links/guest-token/join?source=notification')
    })

    it('keeps the legacy meal-plan list URL mapped to the meeting activity', () => {
        expect(resolvePathToActivity('/meal-plans')?.route.name).toBe(
            'MeetingActivity'
        )
    })
})
