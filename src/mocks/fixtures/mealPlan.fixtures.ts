import type {
    MealPlanResponse,
    MyMealPlanListResponse,
    MealPlanChatMessageListResponse,
    MealPlanInviteListResponse,
    HomeMealPlanDashboardResponse,
    MealMapResponse,
    NearbyFriendMealPlanSummary
} from '@/apis'
import { domainId } from '@/domain/factories'

const now = '2026-06-17T09:00:00.000Z'

const member = (memberId: number, username: string) => ({
    memberId: domainId.member(memberId),
    username,
    profileImageUrl: ''
})

export const mockMealPlanResponse: MealPlanResponse = {
    mealPlanId: domainId.mealPlan('11111111-1111-4111-8111-111111111111'),
    owner: member(1, '김대규'),
    title: '오늘 점심 밥약',
    status: 'DECIDING',
    channels: ['OWNER_ONLY', 'FRIEND_INVITE', 'LINK_GUEST'],
    participants: [
        {
            participantId: '21111111-1111-4111-8111-111111111111' as never,
            mealPlanId: domainId.mealPlan('11111111-1111-4111-8111-111111111111'),
            member: member(1, '김대규'),
            guest: null,
            role: 'OWNER',
            status: 'JOINED',
            source: 'OWNER',
            joinedAt: now,
            readyAt: null
        },
        {
            participantId: '22222222-2222-4222-8222-222222222222' as never,
            mealPlanId: domainId.mealPlan('11111111-1111-4111-8111-111111111111'),
            member: member(2, '서은우'),
            guest: null,
            role: 'FRIEND',
            status: 'JOINED',
            source: 'FRIEND_INVITE',
            joinedAt: now,
            readyAt: null
        }
    ],
    pendingInvites: [],
    pendingJoinRequests: [
        {
            joinRequestId: domainId.mealPlanJoinRequest('44444444-4444-4444-8444-444444444444'),
            mealPlanId: domainId.mealPlan('11111111-1111-4111-8111-111111111111'),
            requester: member(3, '박지민'),
            status: 'PENDING',
            message: '근처라서 같이 먹고 싶어요.',
            requestedAt: now,
            respondedAt: null
        }
    ],
    decisionStages: [],
    decisionProgress: {
        mealPlanId: domainId.mealPlan('11111111-1111-4111-8111-111111111111'),
        tasks: [],
        provisional: {},
        final: {},
        snapshots: [],
        version: 1,
        updatedAt: now
    } as never,
    viewerRole: 'OWNER',
    viewerParticipantStatus: 'JOINED',
    viewerPermissions: {
        canView: true,
        canInviteFriends: true,
        canManageParticipants: true,
        canCreateShareLink: true,
        canExposeNearbyFriends: true,
        canVote: true,
        canChat: true,
        canReadyMealPlan: true,
        canReadyDecisionTask: true,
        canRequestChange: true,
        canReopenDecisionTask: true,
        canConfirmDecisionSnapshot: true,
        canConfirmMealPlan: true,
        canCompleteMealPlan: false,
        canRecordMealPlan: false,
        canCancelMealPlan: true
    },
    viewerTaskReadyMap: {} as never,
    selectedDate: null,
    selectedTime: null,
    selectedArea: null,
    selectedRestaurant: null,
    selectedMenuCategory: null,
    chatRoom: null,
    confirmedAt: null,
    lockedAt: null,
    completedAt: null,
    recordedAt: null,
    createdAt: now,
    updatedAt: now
}

export const mockMyMealPlans: MyMealPlanListResponse = {
    deciding: [
        {
            mealPlanId: mockMealPlanResponse.mealPlanId,
            group: 'DECIDING',
            title: '오늘 점심 밥약',
            status: 'DECIDING',
            channels: ['FRIEND_INVITE'],
            participantCount: 2,
            selectedDate: null,
            selectedTime: null,
            selectedAreaName: null,
            selectedRestaurantName: null,
            primaryAction: {
                label: '결정하러 가기',
                href: `/meal-plans/${mockMealPlanResponse.mealPlanId}/decision`
            },
            updatedAt: now
        }
    ],
    upcoming: [],
    recordNeeded: [],
    past: []
}

export const mockMealPlanInvites: MealPlanInviteListResponse = []
export const mockNearbyFriendMealPlans: NearbyFriendMealPlanSummary[] = [
    {
        mealPlanId: domainId.mealPlan('33333333-3333-4333-8333-333333333333'),
        owner: member(2, '서은우'),
        title: '근처에서 같이 점심 먹을 친구',
        participantCount: 1,
        distanceMeters: 420,
        exposedAt: now,
        expiresAt: '2026-06-17T10:00:00.000Z',
        joinRequestStatus: null
    }
]
export const mockMealPlanChatMessages: MealPlanChatMessageListResponse = []


export const mockHomeMealPlanDashboard: HomeMealPlanDashboardResponse = {
    generatedAt: now,
    inProgress: mockMyMealPlans.deciding,
    today: [],
    recordNeeded: mockMyMealPlans.recordNeeded,
    pendingJoinRequests: mockMealPlanResponse.pendingJoinRequests,
    unreadNotifications: [],
    nextActions: [
        {
            actionId: `join-request:${mockMealPlanResponse.pendingJoinRequests[0].joinRequestId}`,
            kind: 'RESPOND_JOIN_REQUEST',
            priority: 10,
            title: '박지민님의 참여 요청',
            description: '근처 친구가 밥약에 참여하고 싶어합니다.',
            primaryAction: {
                label: '요청 확인하기',
                href: `/meal-plans/${mockMealPlanResponse.mealPlanId}`
            },
            mealPlan: null,
            joinRequest: mockMealPlanResponse.pendingJoinRequests[0],
            notification: null
        },
        {
            actionId: `continue:${mockMyMealPlans.deciding[0].mealPlanId}`,
            kind: 'CONTINUE_DECISION',
            priority: 70,
            title: '정하는 중인 밥약',
            description: '오늘 점심 밥약의 시간, 장소, 메뉴 결정을 이어가세요.',
            primaryAction: mockMyMealPlans.deciding[0].primaryAction,
            mealPlan: mockMyMealPlans.deciding[0],
            joinRequest: null,
            notification: null
        }
    ]
}

export const mockMealMap: MealMapResponse = {
    generatedAt: now,
    center: {
        lat: 37.5665,
        lng: 126.978,
        source: 'LAST_KNOWN_LOCATION'
    },
    layers: {
        myMealPlanPlaces: [
            {
                markerId: 'my-meal-plan:11111111-1111-4111-8111-111111111111',
                layer: 'MY_MEAL_PLAN_PLACE',
                lat: 37.5665,
                lng: 126.978,
                title: '오늘 점심 밥약',
                subtitle: '서울시청 근처',
                href: `/meal-plans/${mockMealPlanResponse.mealPlanId}`,
                mealPlanId: mockMealPlanResponse.mealPlanId,
                articleId: null,
                restaurant: null,
                distanceMeters: null,
                updatedAt: now,
                metadata: { ownerId: member(1, '김대규').memberId, status: 'DECIDING', participantCount: 2, source: 'selectedArea' }
            }
        ],
        nearbyFriendMealPlans: [
            {
                markerId: 'nearby-friend-meal-plan:33333333-3333-4333-8333-333333333333',
                layer: 'NEARBY_FRIEND_MEAL_PLAN',
                lat: 37.5651,
                lng: 126.9895,
                title: '근처에서 같이 점심 먹을 친구',
                subtitle: '서은우 · 1명',
                href: '/meal-plans/33333333-3333-4333-8333-333333333333',
                mealPlanId: domainId.mealPlan('33333333-3333-4333-8333-333333333333'),
                articleId: null,
                restaurant: null,
                distanceMeters: 420,
                updatedAt: now,
                metadata: { ownerId: member(2, '서은우').memberId, ownerName: '서은우', participantCount: 1, expiresAt: '2026-06-17T10:00:00.000Z', source: 'ownerLastKnownLocation' }
            }
        ],
        friendRecordLocations: [
            {
                markerId: 'friend-record:1',
                layer: 'FRIEND_RECORD_LOCATION',
                lat: 37.5701,
                lng: 126.9821,
                title: '을지로 국밥',
                subtitle: '서은우님의 밥 기록',
                href: '/post/1',
                mealPlanId: null,
                articleId: domainId.article(1),
                restaurant: {
                    restaurantId: domainId.restaurant('restaurant-1'),
                    placeName: '을지로 국밥',
                    categoryName: '한식',
                    categoryGroupName: '음식점',
                    distance: '420',
                    roadAddressName: '서울 중구 을지로',
                    addressName: '서울 중구',
                    phone: null,
                    placeUrl: null,
                    lat: 37.5701,
                    lng: 126.9821
                },
                distanceMeters: 420,
                updatedAt: now,
                metadata: { authorId: member(2, '서은우').memberId, authorName: '서은우', imageUrl: null, mealDate: '2026-06-17' }
            }
        ],
        restaurantCandidates: [
            {
                markerId: 'restaurant-candidate:11111111-1111-4111-8111-111111111111:restaurant-2',
                layer: 'RESTAURANT_CANDIDATE',
                lat: 37.5649,
                lng: 126.981,
                title: '시청 돈까스',
                subtitle: '오늘 점심 밥약 후보',
                href: `/meal-plans/${mockMealPlanResponse.mealPlanId}/decision`,
                mealPlanId: mockMealPlanResponse.mealPlanId,
                articleId: null,
                restaurant: {
                    restaurantId: domainId.restaurant('restaurant-2'),
                    placeName: '시청 돈까스',
                    categoryName: '일식 돈까스',
                    categoryGroupName: '음식점',
                    distance: '260',
                    roadAddressName: '서울 중구 세종대로',
                    addressName: '서울 중구',
                    phone: null,
                    placeUrl: null,
                    lat: 37.5649,
                    lng: 126.981
                },
                distanceMeters: 260,
                updatedAt: now,
                metadata: { stageId: '55555555-5555-4555-8555-555555555555' as never, ownerId: member(1, '김대규').memberId, status: 'DECIDING', source: 'search', stageStatus: 'OPEN', canVote: true, canCompleteStage: true, completionBlockedReason: null }
            }
        ]
    }
}
