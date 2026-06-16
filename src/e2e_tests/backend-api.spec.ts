import { test, expect } from '@playwright/test'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'

test.describe('MealPlan API contract smoke', () => {
    test('MealPlan endpoints are exposed from the shared contract', () => {
        expect(apiContract.mealPlans.create.path).toBe('/meal-plans')
        expect(apiContract.mealPlans.my.path).toBe('/meal-plans/me')
        expect(apiContract.mealPlans.detail.path).toBe('/meal-plans/:mealPlanId')
        expect(apiContract.mealPlans.invite.path).toBe('/meal-plans/:mealPlanId/invites')
        expect(apiContract.mealPlans.createShareLink.path).toBe('/meal-plans/:mealPlanId/share-links')
        expect(apiContract.mealPlans.nearbyFriends.path).toBe('/meal-plans/nearby-friends')
        expect(apiContract.mealPlans.confirm.path).toBe('/meal-plans/:mealPlanId/confirm')
    })
})
