import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/apis/baseUrl'
import {
    mockMealPlanChatMessages,
    mockMealPlanInvites,
    mockMealPlanResponse,
    mockMyMealPlans,
    mockNearbyFriendMealPlans
} from '@/mocks/fixtures'

const BASE_URL = API_BASE_URL

export const mealPlanHandlers = [
    http.get(`${BASE_URL}/meal-plans/me`, () => HttpResponse.json(mockMyMealPlans)),
    http.post(`${BASE_URL}/meal-plans`, async () =>
        HttpResponse.json({ mealPlanId: mockMealPlanResponse.mealPlanId })
    ),
    http.get(`${BASE_URL}/meal-plans/nearby-friends`, () =>
        HttpResponse.json(mockNearbyFriendMealPlans)
    ),
    http.get(`${BASE_URL}/meal-plans/invites/received`, () =>
        HttpResponse.json(mockMealPlanInvites)
    ),
    http.get(`${BASE_URL}/meal-plans/invites/sent`, () =>
        HttpResponse.json(mockMealPlanInvites)
    ),
    http.get(`${BASE_URL}/meal-plans/:mealPlanId`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.patch(`${BASE_URL}/meal-plans/:mealPlanId/context`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/cancel`, () =>
        HttpResponse.json({ ...mockMealPlanResponse, status: 'CANCELLED' })
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/complete`, () =>
        HttpResponse.json({ ...mockMealPlanResponse, status: 'COMPLETED' })
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/recorded`, () =>
        HttpResponse.json({ ...mockMealPlanResponse, status: 'RECORDED' })
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/participants/:participantId/remove`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.get(`${BASE_URL}/meal-plans/:mealPlanId/chat/messages`, () =>
        HttpResponse.json(mockMealPlanChatMessages)
    ),
    http.get(`${BASE_URL}/meal-plans/:mealPlanId/decision-progress`, () =>
        HttpResponse.json(mockMealPlanResponse.decisionProgress)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/decision-tasks/:taskKey/ready`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/decision-tasks/:taskKey/reopen`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/decision-snapshots/:snapshotId/confirm`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/stages/:stageId/votes`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plans/:mealPlanId/stages/:stageId/complete`, () =>
        HttpResponse.json(mockMealPlanResponse)
    ),
    http.post(`${BASE_URL}/meal-plan-links/:token/join`, () =>
        HttpResponse.json({
            mealPlanId: mockMealPlanResponse.mealPlanId,
            guestId: 'guest-1',
            sessionToken: 'mock-guest-session-token'
        })
    ),
    http.get(`${BASE_URL}/meal-plan-links/:token`, () =>
        HttpResponse.json({
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
        HttpResponse.json({
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
        HttpResponse.json(mockMealPlanChatMessages)
    )
]
