import { describe, expect, it } from 'vitest'
import {
    buildPathFromActivity,
    getParentPathByPath,
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

    it('maps the removed meal map URL to the meal plan tab for compatibility', () => {
        expect(resolvePathToActivity('/meal-map')?.route.name).toBe(
            'MeetingActivity'
        )
    })

    it('resolves decision sub routes instead of falling back to root', () => {
        const mealPlanId = '11111111-1111-4111-8111-111111111111'

        expect(
            resolvePathToActivity(`/meal-plans/${mealPlanId}/decision/chat`)
                ?.route.name
        ).toBe('MealPlanDecisionChatActivity')
        expect(
            resolvePathToActivity(`/meal-plans/${mealPlanId}/decision/date`)
                ?.route.name
        ).toBe('MealPlanDecisionDateActivity')
        expect(
            resolvePathToActivity(`/meal-plans/${mealPlanId}/decision/final`)
                ?.route.name
        ).toBe('MealPlanDecisionFinalActivity')
        expect(
            resolvePathToActivity(`/meal-plans/${mealPlanId}/decision/unknown`)
                ?.route.name
        ).toBe('MealPlanDecisionSubActivity')
    })

    it('provides hierarchy fallback paths for refreshed decision routes', () => {
        const mealPlanId = '11111111-1111-4111-8111-111111111111'

        expect(
            getParentPathByPath(`/meal-plans/${mealPlanId}/decision/chat`)
        ).toBe(`/meal-plans/${mealPlanId}/decision`)
        expect(getParentPathByPath(`/meal-plans/${mealPlanId}/decision`)).toBe(
            `/meal-plans/${mealPlanId}`
        )
        expect(getParentPathByPath(`/meal-plans/${mealPlanId}`)).toBe(
            '/meeting'
        )
    })
})
