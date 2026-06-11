import {
    FoodCodeSchema,
    FoodLabelSchema,
    FoodSchema,
    LocationIdSchema,
    type Food,
    type LocationId,
    toArticleId,
    toCommentId,
    toCouponId,
    toFriendRequestId,
    toInvitationId,
    toMemberId,
    toPlanId,
    toRecruitId,
    toRestaurantId,
    toRoomId,
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
    recruit: toRecruitId,
    invitation: toInvitationId,
    room: toRoomId,
    restaurant: toRestaurantId,
    coupon: toCouponId,
    subscription: toSubscriptionId,
    friendRequest: toFriendRequestId,
    plan: toPlanId,
    location: (value: string): LocationId => LocationIdSchema.parse(value)
}

export const domainFood = (code: string, label: string): Food =>
    FoodSchema.parse({
        code: FoodCodeSchema.parse(code),
        label: FoodLabelSchema.parse(label)
    })
