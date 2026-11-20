import type { MealGroupResponse } from '@kimdaegyu/babmukdang-shared/domain'

export interface MealGroupCardView {
    mealGroupId: string
    name: string
    ownerName: string
    memberCount: number
    profileImageUrl: string | null
    recentMealPlanCount: number
    updatedAt: string
}

export const mapMealGroup = (group: MealGroupResponse): MealGroupCardView => ({
    mealGroupId: group.mealGroupId,
    name: group.name,
    ownerName: group.owner.username,
    memberCount: group.members.length,
    profileImageUrl: group.profileImageUrl,
    recentMealPlanCount: group.recentMealPlanIds.length,
    updatedAt: group.updatedAt
})
