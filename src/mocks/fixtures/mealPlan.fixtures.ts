import type {
    MealPlanResponse,
    MyMealPlanListResponse,
    MealPlanChatMessageListResponse,
    MealPlanInviteListResponse,
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
    pendingJoinRequests: [],
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
export const mockNearbyFriendMealPlans: NearbyFriendMealPlanSummary[] = []
export const mockMealPlanChatMessages: MealPlanChatMessageListResponse = []
