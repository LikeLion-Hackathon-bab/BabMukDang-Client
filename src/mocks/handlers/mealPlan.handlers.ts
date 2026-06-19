import { http } from 'msw'
import { API_BASE_URL } from '@/apis/baseUrl'
import {
    mockMealPlanChatMessages,
    mockMealPlanInvites,
    mockMealPlanResponse,
    mockMyMealPlans,
    mockHomeMealPlanDashboard,
    mockMealMap,
    mockNearbyFriendMealPlans
} from '@/mocks/fixtures'

import { apiSuccess } from './response'

const BASE_URL = API_BASE_URL

export const mealPlanHandlers = [
    http.get(`${BASE_URL}/meal-plans/me`, () => apiSuccess(mockMyMealPlans)),
    http.get(`${BASE_URL}/meal-plans/home-dashboard`, () =>
        apiSuccess(mockHomeMealPlanDashboard)
    ),
    http.get(`${BASE_URL}/meal-plans/map`, () => apiSuccess(mockMealMap)),
    http.post(`${BASE_URL}/meal-plans`, async () =>
        apiSuccess({ mealPlanId: mockMealPlanResponse.mealPlanId })
    ),
    http.get(`${BASE_URL}/meal-plans/nearby-friends/eligibility`, () =>
        apiSuccess({
            canExpose: true,
            locationConsentStatus: 'GRANTED',
            nearbyMealPlanExposureAllowed: true,
            mealSuggestionAllowed: true,
            hasLastKnownLocation: true,
            missingRequirements: []
        })
    ),
    http.get(`${BASE_URL}/meal-plans/nearby-friends`, () =>
        apiSuccess(mockNearbyFriendMealPlans)
    ),
    http.post(
        `${BASE_URL}/meal-plans/:mealPlanId/nearby-friends/expose`,
        ({ params }) =>
            apiSuccess({
                mealPlanId: String(params.mealPlanId),
                exposureBatchId: '33333333-3333-4333-8333-333333333399',
                exposedFriendCount: 1,
                rejectedFriendCount: 2,
                notificationStatus: 'SENT',
                rejectionSummary: [
                    { reason: 'OUT_OF_RADIUS', count: 1 },
                    { reason: 'NOT_HUNGRY', count: 1 }
                ]
            })
    ),
    http.delete(
        `${BASE_URL}/meal-plans/:mealPlanId/nearby-friends/expose`,
        () => apiSuccess(null)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/join-requests`, () =>
        apiSuccess({
            entity: 'mealPlanJoinRequest',
            id: 'mock-join-request-id'
        })
    ),
    http.post(`${BASE_URL}/meal-plans/join-requests/:requestId/accept`, () =>
        apiSuccess({
            ...mockMealPlanResponse,
            pendingJoinRequests: [],
            participants: [
                ...mockMealPlanResponse.participants,
                {
                    participantId:
                        '23333333-3333-4333-8333-333333333333' as never,
                    mealPlanId: mockMealPlanResponse.mealPlanId,
                    member:
                        mockMealPlanResponse.pendingJoinRequests[0]
                            ?.requester ?? null,
                    guest: null,
                    role: 'FRIEND',
                    status: 'JOINED',
                    source: 'NEARBY_FRIENDS',
                    joinedAt: '2026-06-17T09:10:00.000Z',
                    readyAt: null
                }
            ]
        })
    ),
    http.post(`${BASE_URL}/meal-plans/join-requests/:requestId/reject`, () =>
        apiSuccess(null)
    ),
    http.get(`${BASE_URL}/meal-plans/invites/received`, () =>
        apiSuccess(mockMealPlanInvites)
    ),
    http.get(`${BASE_URL}/meal-plans/invites/sent`, () =>
        apiSuccess(mockMealPlanInvites)
    ),
    http.get(`${BASE_URL}/meal-plans/:mealPlanId`, () =>
        apiSuccess(mockMealPlanResponse)
    ),
    http.patch(`${BASE_URL}/meal-plans/:mealPlanId/context`, () =>
        apiSuccess(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/cancel`, () =>
        apiSuccess({ ...mockMealPlanResponse, status: 'CANCELLED' })
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/complete`, () =>
        apiSuccess({ ...mockMealPlanResponse, status: 'COMPLETED' })
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/recorded`, () =>
        apiSuccess({ ...mockMealPlanResponse, status: 'RECORDED' })
    ),
    http.post(
        `${BASE_URL}/meal-plans/:mealPlanId/participants/:participantId/remove`,
        () => apiSuccess(mockMealPlanResponse)
    ),
    http.get(`${BASE_URL}/meal-plans/:mealPlanId/chat/messages`, () =>
        apiSuccess(mockMealPlanChatMessages)
    ),
    http.get(`${BASE_URL}/meal-plans/:mealPlanId/decision-progress`, () =>
        apiSuccess(mockMealPlanResponse.decisionProgress)
    ),
    http.post(
        `${BASE_URL}/meal-plans/:mealPlanId/decision-tasks/:taskKey/ready`,
        () => apiSuccess(mockMealPlanResponse)
    ),
    http.post(
        `${BASE_URL}/meal-plans/:mealPlanId/decision-tasks/:taskKey/reopen`,
        () => apiSuccess(mockMealPlanResponse)
    ),
    http.post(
        `${BASE_URL}/meal-plans/:mealPlanId/decision-snapshots/:snapshotId/confirm`,
        () => apiSuccess(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/stages/:stageId/votes`, () =>
        apiSuccess(mockMealPlanResponse)
    ),
    http.post(
        `${BASE_URL}/meal-plans/:mealPlanId/stages/:stageId/complete`,
        () => apiSuccess(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plan-links/:token/join`, () =>
        apiSuccess({
            mealPlanId: mockMealPlanResponse.mealPlanId,
            guestId: 'guest-1',
            sessionToken: 'mock-guest-session-token'
        })
    ),
    http.get(`${BASE_URL}/meal-plan-links/:token`, () =>
        apiSuccess({
            mealPlanId: mockMealPlanResponse.mealPlanId,
            token: 'mock-share-token',
            title: mockMealPlanResponse.title ?? '밥약',
            ownerName: mockMealPlanResponse.owner.username,
            participantCount: mockMealPlanResponse.participants.length,
            expiresAt: '2026-06-30T00:00:00.000Z',
            guestJoinEnabled: true
        })
    ),
    http.get(`${BASE_URL}/meal-plan-links/:token/session`, () =>
        apiSuccess({
            mealPlan: {
                ...mockMealPlanResponse,
                viewerRole: 'GUEST',
                viewerPermissions: {
                    ...mockMealPlanResponse.viewerPermissions,
                    canInviteFriends: false,
                    canManageParticipants: false,
                    canCreateShareLink: false,
                    canExposeNearbyFriends: false,
                    canReopenDecisionTask: false,
                    canConfirmDecisionSnapshot: false,
                    canConfirmMealPlan: false,
                    canCancelMealPlan: false
                }
            },
            token: 'mock-share-token',
            guestId: 'guest-1',
            nickname: '게스트',
            sessionToken: 'mock-guest-session-token'
        })
    ),
    http.get(`${BASE_URL}/meal-plan-links/:token/chat/messages`, () =>
        apiSuccess(mockMealPlanChatMessages)
    )
]
