import {
    FoodCodeSchema,
    FoodLabelSchema,
    FoodSchema,
    type Food,
    toArticleId,
    toCommentId,
    toCouponId,
    toFriendRequestId,
    toMealGroupId,
    toMealPlanChangeRequestId,
    toMealPlanId,
    toMealPlanInviteId,
    toMealPlanJoinRequestId,
    toMealPlanShareLinkToken,
    toMemberId,
    toRestaurantId,
    toSubscriptionId
} from '@kimdaegyu/babmukdang-shared/domain'

/**
 * Client-side domain value factories.
 *
 * Shared domain IDs are branded primitive values, so mocks, stories, URL params,
 * and form state must pass through this boundary before they become API DTOs.
 */
export const domainId = {
    member: toMemberId,
    article: toArticleId,
    comment: toCommentId,
    mealPlan: toMealPlanId,
    mealPlanInvite: toMealPlanInviteId,
    mealPlanJoinRequest: toMealPlanJoinRequestId,
    mealPlanChangeRequest: toMealPlanChangeRequestId,
    mealPlanShareToken: toMealPlanShareLinkToken,
    mealGroup: toMealGroupId,
    restaurant: toRestaurantId,
    coupon: toCouponId,
    subscription: toSubscriptionId,
    friendRequest: toFriendRequestId
}

export const domainFood = (code: string, label: string): Food =>
    FoodSchema.parse({
        code: FoodCodeSchema.parse(code),
        label: FoodLabelSchema.parse(label)
    })
