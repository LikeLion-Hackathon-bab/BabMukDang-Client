import type {
    FriendListItemResponse,
    MealGroupHistoryResponse,
    MealGroupPreferenceSummary,
    MealGroupResponse,
    MemberFoodPreference,
    ProfileDetailResponse,
    UploadProfileImageResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import {
    toMealGroupId,
    toMealPlanId,
    toMemberId
} from '@kimdaegyu/babmukdang-shared/domain'

export const E2E_PROFILE_IMAGE_PUT_URL =
    'https://s3.e2e.local/profile-image.jpg'
export const E2E_PROFILE_IMAGE_CDN_URL =
    'https://cdn.e2e.local/profile-image.jpg'

export const E2E_MEAL_GROUP_ID = toMealGroupId(
    '77777777-7777-4777-8777-777777777777'
)
export const E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID = toMealPlanId(
    '78787878-7878-4788-8788-787878787878'
)
export const E2E_GROUP_FRIEND_MEMBER_ID = toMemberId(2)
export const E2E_GROUP_NEW_MEMBER_ID = toMemberId(3)

const now = '2026-06-18T00:00:00.000Z'

export const profileDetailResponse = (
    overrides: Partial<ProfileDetailResponse> = {}
): ProfileDetailResponse => ({
    memberId: toMemberId(1),
    username: 'existingUser',
    profileImageUrl: null,
    bio: '기존 소개글입니다.',
    friendConunt: 3,
    completedPlans: 7,
    uncompletedPlans: 1,
    onboardingStatus: 'COMPLETED',
    onboardingCompletedAt: now,
    locationConsentStatus: 'GRANTED',
    nearbyMealPlanExposureAllowed: true,
    ...overrides
})

export const memberFoodPreferenceResponse = (
    overrides: Partial<MemberFoodPreference> = {}
): MemberFoodPreference => ({
    liked: [{ code: 'gukbap' as never, label: '국밥' as never }],
    disliked: [{ code: 'mala' as never, label: '마라탕' as never }],
    allergy: [{ code: 'peanut' as never, label: '땅콩' as never }],
    ...overrides
})

export const profilePresignResponse = (): UploadProfileImageResponse => ({
    key: 'profiles/e2e/profile-image.jpg',
    putUrl: E2E_PROFILE_IMAGE_PUT_URL,
    cdnUrl: E2E_PROFILE_IMAGE_CDN_URL
})

const groupOwner = {
    memberId: toMemberId(1),
    username: 'existingUser',
    profileImageUrl: null
}

const groupFriend = {
    memberId: E2E_GROUP_FRIEND_MEMBER_ID,
    username: '그룹친구',
    profileImageUrl: null
}

const groupNewMember = {
    memberId: E2E_GROUP_NEW_MEMBER_ID,
    username: '새그룹친구',
    profileImageUrl: null
}

export const friendListForMealGroupResponse = (): FriendListItemResponse[] => [
    {
        ...groupFriend,
        friendSince: now,
        mealAvailability: {
            isHungry: true,
            mealProposalAllowed: true,
            mealStatusExpiresAt: '2026-06-18T01:00:00.000Z',
            nearbyMealPlanExposureAllowed: true
        }
    },
    {
        ...groupNewMember,
        friendSince: now,
        mealAvailability: {
            isHungry: false,
            mealProposalAllowed: true,
            mealStatusExpiresAt: null,
            nearbyMealPlanExposureAllowed: true
        }
    }
]

export const mealGroupResponse = (
    overrides: Partial<MealGroupResponse> = {}
): MealGroupResponse => ({
    mealGroupId: E2E_MEAL_GROUP_ID,
    name: '문서 기반 E2E MealGroup',
    owner: groupOwner,
    profileImageUrl: 'https://cdn.e2e.local/groups/e2e.png',
    members: [
        {
            member: groupOwner,
            role: 'OWNER',
            joinedAt: now
        },
        {
            member: groupFriend,
            role: 'MEMBER',
            joinedAt: now
        }
    ],
    recentMealPlanIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
})

export const mealGroupWithNewMemberResponse = (): MealGroupResponse => {
    const group = mealGroupResponse()

    return mealGroupResponse({
        members: [
            ...group.members,
            {
                member: groupNewMember,
                role: 'MEMBER',
                joinedAt: '2026-06-18T00:05:00.000Z'
            }
        ],
        updatedAt: '2026-06-18T00:05:00.000Z'
    })
}

export const mealGroupWithTransferredOwnerResponse = (): MealGroupResponse =>
    mealGroupResponse({
        owner: groupFriend,
        members: [
            {
                member: groupOwner,
                role: 'MEMBER',
                joinedAt: now
            },
            {
                member: groupFriend,
                role: 'OWNER',
                joinedAt: now
            }
        ],
        updatedAt: '2026-06-18T00:10:00.000Z'
    })

export const mealGroupWithRecentMealPlanResponse = (): MealGroupResponse =>
    mealGroupResponse({
        recentMealPlanIds: [E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID],
        updatedAt: '2026-06-18T00:15:00.000Z'
    })

export const mealGroupHistoryResponse = (): MealGroupHistoryResponse => [
    {
        mealPlanId: E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID,
        group: 'UPCOMING',
        title: '문서 기반 E2E MealGroup 밥약',
        status: 'CONFIRMED',
        channels: ['FRIEND_INVITE'],
        participantCount: 2,
        selectedDate: '2026-06-19',
        selectedTime: '12:30',
        selectedAreaName: '서울시청',
        selectedRestaurantName: '문서식당',
        primaryAction: {
            label: '밥약 보기',
            href: `/meal-plans/${E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID}`
        },
        updatedAt: '2026-06-18T00:15:00.000Z'
    }
]

export const mealGroupPreferencesResponse = (): MealGroupPreferenceSummary => ({
    mealGroupId: E2E_MEAL_GROUP_ID,
    frequentMenuCategories: [{ label: '국밥', count: 2 }],
    frequentRestaurants: [{ restaurantName: '문서식당', count: 1 }],
    recentMenuCategories: ['국밥'],
    recommendationContext: {
        preferredMenuCategories: ['국밥'],
        excludedMenuCategories: ['마라탕'],
        candidateMenuCategories: ['국밥', '백반']
    }
})
