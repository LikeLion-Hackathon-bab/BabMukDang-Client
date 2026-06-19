import type {
    MealGroupResponse,
    MealGroupHistoryResponse,
    MealGroupPreferenceSummary
} from '@/apis'
import { domainId } from '@/domain/factories'

const now = '2026-06-17T09:00:00.000Z'
const owner = {
    memberId: domainId.member(1),
    username: '김대규',
    profileImageUrl: ''
}

export const mockMealGroupResponse: MealGroupResponse = {
    mealGroupId: domainId.mealGroup('33333333-3333-4333-8333-333333333333'),
    name: '점심 고정 멤버',
    owner,
    profileImageUrl: null,
    members: [
        { member: owner, role: 'OWNER', joinedAt: now },
        {
            member: {
                memberId: domainId.member(2),
                username: '서은우',
                profileImageUrl: ''
            },
            role: 'MEMBER',
            joinedAt: now
        }
    ],
    recentMealPlanIds: [
        domainId.mealPlan('11111111-1111-4111-8111-111111111111')
    ],
    createdAt: now,
    updatedAt: now
}

export const mockMealGroups: MealGroupResponse[] = [mockMealGroupResponse]
export const mockMealGroupHistory: MealGroupHistoryResponse = []
export const mockMealGroupPreferences: MealGroupPreferenceSummary = {
    mealGroupId: mockMealGroupResponse.mealGroupId,
    frequentMenuCategories: [{ label: '한식', count: 3 }],
    frequentRestaurants: [],
    recentMenuCategories: ['한식'],
    recommendationContext: {
        preferredMenuCategories: ['한식'],
        excludedMenuCategories: [],
        candidateMenuCategories: ['한식', '일식']
    }
}
