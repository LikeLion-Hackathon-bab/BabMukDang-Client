import type {
    ArticleDetailResponse,
    CreatedEntityIdResponse,
    ExposeMealPlanToNearbyFriendsResponse,
    HomeMealPlanDashboardResponse,
    JoinMealPlanGuestResponse,
    MealPlanDecisionCandidate,
    MealPlanDecisionProgress,
    MealPlanDecisionStageResponse,
    MealPlanGuestSessionResponse,
    MealPlanInviteListResponse,
    MealPlanJoinRequestSummary,
    MealPlanNotification,
    MealPlanResponse,
    MealPlanSharePreviewResponse,
    MyMealPlanListResponse,
    NearbyFriendExposureEligibility,
    NearbyFriendMealPlanSummary,
    PageArticleSummaryResponse,
    SendMealPlanInviteResponse,
    UploadArticleImageResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import {
    toArticleId,
    toCommentId,
    toMealPlanId,
    toMealPlanInviteId,
    toMealPlanJoinRequestId,
    toMealPlanNearbyFriendExposureBatchId,
    toMealPlanShareLinkToken,
    toMemberId,
    toRestaurantId
} from '@kimdaegyu/babmukdang-shared/domain'

const mealPlanId = toMealPlanId('11111111-1111-4111-8111-111111111111')
const ownerParticipantId = '21111111-1111-4111-8111-111111111111' as never
const friendParticipantId = '22222222-2222-4222-8222-222222222222' as never
const chatRoomId = '33333333-3333-4333-8333-333333333333' as never

export const E2E_MEAL_PLAN_ID = mealPlanId
export const E2E_SHARE_TOKEN = toMealPlanShareLinkToken('share-token-e2e')
export const E2E_GUEST_SESSION_TOKEN = 'guest-session-token-e2e'
export const E2E_INVITE_ID = toMealPlanInviteId(
    '88888888-8888-4888-8888-888888888888'
)
export const E2E_JOIN_REQUEST_ID = toMealPlanJoinRequestId(
    '99999999-9999-4999-8999-999999999999'
)
export const E2E_STAGE_ID = '55555555-5555-4555-8555-555555555555' as never
export const E2E_SNAPSHOT_ID = '66666666-6666-4666-8666-666666666666'
export const E2E_FRIEND_MEMBER_ID = toMemberId(2)
export const E2E_ARTICLE_ID = toArticleId(101)
export const E2E_NOTIFICATION_ID = '44444444-4444-4444-8444-444444444444'
export const E2E_ARTICLE_PUT_URL = 'https://s3.e2e.local/article-image.jpg'
export const E2E_ARTICLE_CDN_URL = 'https://cdn.e2e.local/article-image.jpg'

const owner = {
    memberId: toMemberId(1),
    username: 'existingUser',
    profileImageUrl: null
}

const friend = {
    memberId: E2E_FRIEND_MEMBER_ID,
    username: '초대친구',
    profileImageUrl: null
}

const restaurant = {
    restaurantId: toRestaurantId('restaurant-e2e'),
    placeName: '문서식당',
    categoryName: '한식',
    categoryGroupName: '음식점',
    distance: undefined,
    roadAddressName: '서울 중구 세종대로',
    addressName: '서울 중구',
    phone: null,
    placeUrl: null,
    lat: 37.5665,
    lng: 126.978
}

export const myMealPlanListResponse = (): MyMealPlanListResponse => ({
    deciding: [
        {
            mealPlanId,
            group: 'DECIDING',
            title: '문서 기반 E2E 점심 밥약',
            status: 'DECIDING',
            channels: ['OWNER_ONLY', 'LINK_GUEST'],
            participantCount: 1,
            selectedDate: '2026-06-19',
            selectedTime: '12:30',
            selectedAreaName: '서울시청',
            selectedRestaurantName: null,
            primaryAction: {
                label: '이어 정하기',
                href: `/meal-plans/${mealPlanId}/decision`
            },
            updatedAt: '2026-06-18T00:00:00.000Z'
        }
    ],
    upcoming: [
        {
            mealPlanId: toMealPlanId('22222222-2222-4222-8222-222222222222'),
            group: 'UPCOMING',
            title: '확정된 저녁 밥약',
            status: 'CONFIRMED',
            channels: ['FRIEND_INVITE'],
            participantCount: 2,
            selectedDate: '2026-06-20',
            selectedTime: '19:00',
            selectedAreaName: '성수동',
            selectedRestaurantName: '성수 국밥',
            primaryAction: {
                label: '밥약 보기',
                href: '/meal-plans/22222222-2222-4222-8222-222222222222'
            },
            updatedAt: '2026-06-18T00:10:00.000Z'
        }
    ],
    recordNeeded: [],
    past: []
})

export const mealPlanDetailResponse = (
    overrides: Partial<MealPlanResponse> = {}
): MealPlanResponse => ({
    mealPlanId,
    owner,
    title: '문서 기반 E2E 점심 밥약',
    status: 'DECIDING',
    channels: ['OWNER_ONLY', 'LINK_GUEST'],
    participants: [
        {
            participantId: ownerParticipantId,
            mealPlanId,
            member: owner,
            guest: null,
            role: 'OWNER',
            status: 'JOINED',
            source: 'OWNER',
            joinedAt: '2026-06-18T00:00:00.000Z',
            readyAt: null
        }
    ],
    pendingInvites: [],
    pendingJoinRequests: [],
    decisionStages: [],
    decisionProgress: null,
    viewerRole: 'OWNER',
    viewerParticipantStatus: 'JOINED',
    viewerPermissions: {
        canView: true,
        canInviteFriends: true,
        canManageParticipants: true,
        canCreateShareLink: true,
        canExposeNearbyFriends: true,
        canVote: true,
        canChat: false,
        canReadyMealPlan: true,
        canRequestChange: false,
        canReopenDecisionTask: true,
        canConfirmDecisionSnapshot: true,
        canConfirmMealPlan: false,
        canCompleteMealPlan: false,
        canRecordMealPlan: false,
        canCancelMealPlan: true
    },
    selectedDate: '2026-06-19',
    selectedTime: '12:30',
    selectedArea: {
        locationId: 'manual:서울시청' as never,
        placeName: '서울시청',
        lat: 37.5665 as never,
        lng: 126.978 as never,
        address: '서울 중구 세종대로',
        source: 'manual',
        createdAt: '2026-06-18T00:00:00.000Z'
    },
    selectedRestaurant: null,
    selectedMenuCategory: null,
    chatRoom: null,
    confirmedAt: null,
    lockedAt: null,
    completedAt: null,
    recordedAt: null,
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
    ...overrides
})

export const sharePreviewResponse = (): MealPlanSharePreviewResponse => ({
    token: E2E_SHARE_TOKEN,
    mealPlanId,
    title: '문서 기반 E2E 점심 밥약',
    ownerName: 'existingUser',
    participantCount: 1,
    guestJoinEnabled: true,
    expiresAt: '2026-06-25T00:00:00.000Z'
})

export const joinGuestResponse = (): JoinMealPlanGuestResponse => ({
    sessionToken: E2E_GUEST_SESSION_TOKEN,
    mealPlanId,
    guestId: 'guest-e2e'
})

export const guestSessionResponse = (): MealPlanGuestSessionResponse => ({
    token: E2E_SHARE_TOKEN,
    guestId: 'guest-e2e',
    nickname: '게스트대규',
    sessionToken: E2E_GUEST_SESSION_TOKEN,
    mealPlan: mealPlanDetailResponse({
        viewerRole: 'GUEST',
        viewerPermissions: {
            canView: true,
            canInviteFriends: false,
            canManageParticipants: false,
            canCreateShareLink: false,
            canExposeNearbyFriends: false,
            canVote: true,
            canChat: true,
            canReadyMealPlan: true,
            canRequestChange: false,
            canReopenDecisionTask: false,
            canConfirmDecisionSnapshot: false,
            canConfirmMealPlan: false,
            canCompleteMealPlan: false,
            canRecordMealPlan: false,
            canCancelMealPlan: false
        }
    })
})

export const friendMealStatusResponse = () => [
    {
        friendMemberId: Number(E2E_FRIEND_MEMBER_ID),
        memberId: Number(E2E_FRIEND_MEMBER_ID),
        username: '초대친구',
        userName: '초대친구',
        profileImageUrl: null,
        hungry: true,
        label: '공복이에요'
    }
]

export const friendSearchResponse = () => [
    {
        memberId: Number(E2E_FRIEND_MEMBER_ID),
        username: '초대친구',
        nickname: '초대친구',
        handle: 'invite-friend',
        profileImageUrl: null,
        friendStatus: '친구',
        isFriend: true,
        canInviteToMealPlan: true
    }
]

export const receivedInviteResponse = (
    status:
        | 'PENDING'
        | 'ACCEPTED'
        | 'DECLINED'
        | 'CANCELLED'
        | 'EXPIRED' = 'PENDING'
): MealPlanInviteListResponse => [
    {
        inviteId: E2E_INVITE_ID,
        mealPlanId,
        status,
        message: '문서 시나리오 초대입니다.',
        inviter: owner,
        invitee: friend,
        createdAt: '2026-06-18T00:00:00.000Z',
        respondedAt: null
    }
]

export const sentInviteResponse = (
    status:
        | 'PENDING'
        | 'ACCEPTED'
        | 'DECLINED'
        | 'CANCELLED'
        | 'EXPIRED' = 'PENDING'
): MealPlanInviteListResponse => [
    {
        inviteId: E2E_INVITE_ID,
        mealPlanId,
        status,
        message: '문서 시나리오 초대입니다.',
        inviter: owner,
        invitee: friend,
        createdAt: '2026-06-18T00:00:00.000Z',
        respondedAt: null
    }
]

export const sendInviteResponse = (): SendMealPlanInviteResponse => ({
    inviteId: E2E_INVITE_ID
})

export const mealPlanDetailWithFriendResponse = (): MealPlanResponse =>
    mealPlanDetailResponse({
        channels: ['FRIEND_INVITE', 'NEARBY_FRIENDS', 'LINK_GUEST'],
        participants: [
            ...mealPlanDetailResponse().participants,
            {
                participantId: friendParticipantId,
                mealPlanId,
                member: friend,
                guest: null,
                role: 'FRIEND',
                status: 'JOINED',
                source: 'FRIEND_INVITE',
                joinedAt: '2026-06-18T00:05:00.000Z',
                readyAt: null
            }
        ],
        chatRoom: {
            chatRoomId,
            mealPlanId,
            messageCount: 0,
            lastMessageAt: null,
            createdAt: '2026-06-18T00:05:00.000Z'
        },
        viewerPermissions: {
            ...mealPlanDetailResponse().viewerPermissions,
            canChat: true
        }
    })

export const mealPlanDetailAsParticipantResponse = (): MealPlanResponse => {
    const detailWithFriend = mealPlanDetailWithFriendResponse()

    return mealPlanDetailResponse({
        viewerRole: 'FRIEND',
        viewerPermissions: {
            canView: true,
            canInviteFriends: false,
            canManageParticipants: false,
            canCreateShareLink: false,
            canExposeNearbyFriends: false,
            canVote: true,
            canChat: true,
            canReadyMealPlan: true,
            canRequestChange: true,
            canReopenDecisionTask: false,
            canConfirmDecisionSnapshot: false,
            canConfirmMealPlan: false,
            canCompleteMealPlan: false,
            canRecordMealPlan: false,
            canCancelMealPlan: false
        },
        participants: detailWithFriend.participants,
        chatRoom: detailWithFriend.chatRoom
    })
}

export const pendingJoinRequestResponse = (): MealPlanJoinRequestSummary => ({
    joinRequestId: E2E_JOIN_REQUEST_ID,
    mealPlanId,
    requester: {
        memberId: E2E_FRIEND_MEMBER_ID,
        username: '근처친구',
        profileImageUrl: null
    },
    status: 'PENDING',
    message: '근처에 있어서 같이 먹고 싶어요.',
    requestedAt: '2026-06-18T00:15:00.000Z',
    respondedAt: null
})

export const mealPlanDetailWithJoinRequestResponse = (): MealPlanResponse =>
    mealPlanDetailResponse({
        channels: ['NEARBY_FRIENDS'],
        pendingJoinRequests: [pendingJoinRequestResponse()]
    })

export const nearbyExposureBlockedEligibilityResponse =
    (): NearbyFriendExposureEligibility => ({
        canExpose: false,
        locationConsentStatus: 'DENIED',
        nearbyMealPlanExposureAllowed: false,
        mealSuggestionAllowed: false,
        hasLastKnownLocation: false,
        missingRequirements: [
            'SERVICE_LOCATION_CONSENT',
            'LAST_KNOWN_LOCATION',
            'MEAL_SUGGESTION_TOGGLE'
        ]
    })

export const nearbyExposureAllowedEligibilityResponse =
    (): NearbyFriendExposureEligibility => ({
        canExpose: true,
        locationConsentStatus: 'GRANTED',
        nearbyMealPlanExposureAllowed: true,
        mealSuggestionAllowed: true,
        hasLastKnownLocation: true,
        missingRequirements: []
    })

export const nearbyExposureResultResponse =
    (): ExposeMealPlanToNearbyFriendsResponse => ({
        exposureBatchId: toMealPlanNearbyFriendExposureBatchId(
            'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
        ),
        mealPlanId,
        exposedFriendCount: 1,
        rejectedFriendCount: 1,
        notificationStatus: 'PARTIAL',
        rejectionSummary: [{ reason: 'NOT_HUNGRY', count: 1 }]
    })

export const nearbyFriendMealPlansResponse =
    (): NearbyFriendMealPlanSummary[] => [
        {
            mealPlanId,
            title: '문서 기반 E2E 점심 밥약',
            owner,
            participantCount: 1,
            distanceMeters: 320,
            exposedAt: '2026-06-18T00:00:00.000Z',
            expiresAt: '2026-06-18T01:00:00.000Z',
            joinRequestStatus: null
        }
    ]

export const menuCandidate: MealPlanDecisionCandidate = {
    stageType: 'MENU',
    value: {
        menuCandidateId: 'manual:kimchi-jjigae' as never,
        menu: {
            code: 'kimchi-jjigae' as never,
            label: '김치찌개' as never
        },
        source: 'manual-search',
        score: 90,
        imageUrl: null,
        image: null,
        createdAt: '2026-06-18T00:00:00.000Z'
    }
}

export const recentMenuCandidate: MealPlanDecisionCandidate = {
    stageType: 'MENU',
    value: {
        menuCandidateId: 'recent-menu:ramen' as never,
        menu: {
            code: 'ramen' as never,
            label: '라멘' as never
        },
        source: 'recent-menu',
        score: 42,
        imageUrl: '/images/food/ramen-thumb.webp',
        image: {
            src: '/images/food/ramen-thumb.webp',
            aspectRatio: 1
        },
        createdAt: '2026-06-18T00:00:00.000Z'
    }
}

export const areaCandidate: MealPlanDecisionCandidate = {
    stageType: 'AREA',
    value: {
        locationId: 'manual:cityhall' as never,
        placeName: '서울시청',
        lat: 37.5665 as never,
        lng: 126.978 as never,
        address: '서울 중구 세종대로',
        source: 'manual',
        createdAt: '2026-06-18T00:00:00.000Z'
    }
}

export const decisionStageResponse = (
    overrides: Partial<MealPlanDecisionStageResponse> = {}
): MealPlanDecisionStageResponse => ({
    stageId: E2E_STAGE_ID,
    stageType: 'MENU',
    status: 'OPEN',
    candidates: [menuCandidate, recentMenuCandidate],
    votes: [],
    selectedCandidate: null,
    metadata: null,
    openedAt: '2026-06-18T00:00:00.000Z',
    completedAt: null,
    reopenedAt: null,
    ...overrides
})

export const decisionProgressResponse = (): MealPlanDecisionProgress => ({
    mealPlanId,
    status: 'DECIDING',
    version: 1,
    updatedAt: '2026-06-18T00:00:00.000Z',
    tasks: [
        {
            taskKey: 'MENU_PICK',
            status: 'OPEN',
            blockers: [],
            updatedAt: '2026-06-18T00:00:00.000Z'
        },
        {
            taskKey: 'LOCATION_CANDIDATE',
            status: 'LOCKED',
            blockers: ['MENU_PICK'],
            updatedAt: '2026-06-18T00:00:00.000Z'
        }
    ],
    provisional: {
        menu: menuCandidate
    },
    final: {},
    snapshots: [
        {
            snapshotId: E2E_SNAPSHOT_ID,
            mealPlanId,
            field: 'menu',
            value: menuCandidate,
            status: 'PROVISIONAL',
            reason: 'TOP_PICKED_MENU',
            score: null,
            sourceEvent: 'vote:menu',
            sourceActorType: 'MEMBER',
            sourceMemberId: toMemberId(1),
            sourceGuestId: null,
            sourceParticipantId: ownerParticipantId,
            sourceVersion: 1,
            dependencyHash: 'hash-e2e',
            dependencyFields: ['menu'],
            createdAt: '2026-06-18T00:00:00.000Z',
            staleAt: null
        }
    ]
})

export const mealPlanDecisionDetailResponse = (
    overrides: Partial<MealPlanResponse> = {}
): MealPlanResponse => {
    const detailWithFriend = mealPlanDetailWithFriendResponse()

    return mealPlanDetailResponse({
        participants: detailWithFriend.participants,
        decisionStages: [decisionStageResponse()],
        decisionProgress: decisionProgressResponse(),
        viewerPermissions: {
            ...mealPlanDetailResponse().viewerPermissions,
            canChat: true,
            canConfirmMealPlan: true
        },
        ...overrides
    })
}

export const confirmedDecisionDetailResponse = (): MealPlanResponse =>
    mealPlanDecisionDetailResponse({
        status: 'READY',
        participants: mealPlanDetailWithFriendResponse().participants.map(
            participant => ({
                ...participant,
                status: 'READY',
                readyAt: '2026-06-18T00:30:00.000Z'
            })
        ),
        decisionStages: [
            decisionStageResponse({
                status: 'COMPLETED',
                selectedCandidate: menuCandidate,
                completedAt: '2026-06-18T00:20:00.000Z'
            })
        ],
        decisionProgress: {
            ...decisionProgressResponse(),
            tasks: [
                {
                    taskKey: 'MENU_PICK',
                    status: 'RESOLVED',
                    blockers: [],
                    updatedAt: '2026-06-18T00:30:00.000Z'
                }
            ],
            final: { menu: menuCandidate }
        }
    })

export const articleDetailResponse = (
    overrides: Partial<ArticleDetailResponse> = {}
): ArticleDetailResponse => ({
    articleId: E2E_ARTICLE_ID,
    author: owner,
    imageUrl: 'https://example.com/e2e-article.jpg',
    mealDate: '2026-06-18',
    restaurant,
    mealPlanId: null,
    expiresAt: '2026-06-25T00:00:00.000Z',
    taggedMembers: [],
    likeCount: 1,
    likedByMe: false,
    commentCount: 1,
    comments: [
        {
            commentId: toCommentId(501),
            author: owner,
            parentCommentId: null,
            content: '기존 댓글입니다.',
            createdAt: '2026-06-18T00:00:00.000Z',
            updatedAt: '2026-06-18T00:00:00.000Z'
        }
    ],
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
    ...overrides
})

export const articleCreatedResponse = (): CreatedEntityIdResponse => ({
    entity: 'article',
    id: E2E_ARTICLE_ID
})

export const commentCreatedResponse = (): CreatedEntityIdResponse => ({
    entity: 'comment',
    id: toCommentId(777)
})

export const articlePresignResponse = (): UploadArticleImageResponse => ({
    key: 'articles/e2e/article-image.jpg',
    putUrl: E2E_ARTICLE_PUT_URL,
    cdnUrl: E2E_ARTICLE_CDN_URL
})

export const homeArticlesWithCreatedArticleResponse =
    (): PageArticleSummaryResponse => ({
        items: [
            articleDetailResponse({
                imageUrl: E2E_ARTICLE_CDN_URL,
                mealPlanId
            })
        ],
        meta: {
            page: 0,
            size: 20,
            totalItems: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
        }
    })

export const notificationResponse = (): MealPlanNotification => ({
    notificationId: E2E_NOTIFICATION_ID,
    kind: 'MEAL_PLAN_INVITE_RECEIVED',
    mealPlanId,
    title: '밥약 초대가 도착했습니다',
    message: 'existingUser님이 문서 기반 E2E 점심 밥약에 초대했습니다.',
    deepLink: `/meal-plans/${mealPlanId}`,
    readAt: null,
    createdAt: '2026-06-18T00:00:00.000Z'
})

export const homeDashboardResponse = (): HomeMealPlanDashboardResponse => ({
    generatedAt: '2026-06-18T00:00:00.000Z',
    inProgress: [],
    today: [],
    recordNeeded: [],
    pendingJoinRequests: [],
    unreadNotifications: [notificationResponse()],
    nextActions: []
})
