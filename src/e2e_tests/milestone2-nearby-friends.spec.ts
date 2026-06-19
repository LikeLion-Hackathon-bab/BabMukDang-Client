import { expect, test, type Page, type Route } from '@playwright/test'

const AUTH_STORAGE_KEY = 'auth-storage'

const apiSuccess = <T>(data: T, code = 200) => ({
    success: true,
    code,
    message: code === 201 ? 'Created' : 'OK',
    data
})

async function fulfillJson(route: Route, data: unknown, status = 200) {
    await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data)
    })
}

async function injectAccessToken(page: Page, accessToken = 'e2e-access-token') {
    await page.addInitScript(
        ({ key, token }) => {
            localStorage.setItem(
                key,
                JSON.stringify({
                    state: {
                        accessToken: token,
                        username: null,
                        userId: null,
                        profile: {
                            profileImageUrl: null,
                            userName: null,
                            bio: null,
                            meetingCount: null
                        }
                    },
                    version: 0
                })
            )
        },
        { key: AUTH_STORAGE_KEY, token: accessToken }
    )
}

async function installMilestone2ApiMocks(page: Page) {
    let joinRequestStatus: string | null = null

    await page.route('**/api/v1/members/me', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                memberId: 1,
                username: 'existingUser',
                profileImageUrl: null,
                onboardingStatus: 'COMPLETED',
                onboardingCompletedAt: '2026-06-17T00:00:00.000Z',
                locationConsentStatus: 'GRANTED',
                nearbyMealPlanExposureAllowed: true
            })
        )
    })

    await page.route('**/api/v1/members/me/location-settings', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                locationConsentStatus: 'GRANTED',
                nearbyMealPlanExposureAllowed: true,
                mealSuggestionAllowed: true,
                lastKnownLocation: {
                    latitude: 37.5665,
                    longitude: 126.978,
                    accuracyMeters: 20,
                    capturedAt: '2026-06-17T01:00:00.000Z'
                },
                permissionSnapshot: null,
                updatedAt: '2026-06-17T01:00:00.000Z'
            })
        )
    })

    await page.route('**/api/v1/meal-plans/nearby-friends', async route => {
        await fulfillJson(
            route,
            apiSuccess([
                {
                    mealPlanId: '33333333-3333-4333-8333-333333333333',
                    owner: {
                        memberId: 2,
                        username: '서은우',
                        profileImageUrl: null
                    },
                    title: '근처에서 같이 점심 먹을 친구',
                    participantCount: 1,
                    distanceMeters: 420,
                    exposedAt: '2026-06-17T01:00:00.000Z',
                    expiresAt: '2026-06-17T02:00:00.000Z',
                    joinRequestStatus
                }
            ])
        )
    })

    await page.route('**/api/v1/meal-plans/*/join-requests', async route => {
        joinRequestStatus = 'PENDING'
        await fulfillJson(
            route,
            apiSuccess(
                { entity: 'mealPlanJoinRequest', id: 'join-request-1' },
                201
            ),
            201
        )
    })
}

test.describe('Milestone 2 nearby friend meal plans', () => {
    test('근처 친구 밥약을 조회하고 참여 요청을 보낼 수 있다', async ({
        page
    }) => {
        await installMilestone2ApiMocks(page)
        await injectAccessToken(page)

        await page.goto('/meal-map')

        await expect(
            page.getByText('근처에서 같이 점심 먹을 친구')
        ).toBeVisible()
        await expect(page.getByText('서은우 · 420m · 1명')).toBeVisible()
        await page.getByRole('button', { name: '참여 요청' }).click()
    })
})

async function installJoinRequestOwnerMocks(page: Page) {
    let requestVisible = true
    const mealPlanId = '11111111-1111-4111-8111-111111111111'

    await page.route('**/api/v1/members/me', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                memberId: 1,
                username: 'ownerUser',
                profileImageUrl: null,
                onboardingStatus: 'COMPLETED',
                onboardingCompletedAt: '2026-06-17T00:00:00.000Z',
                locationConsentStatus: 'GRANTED',
                nearbyMealPlanExposureAllowed: true
            })
        )
    })

    await page.route('**/api/v1/members/me/location-settings', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                locationConsentStatus: 'GRANTED',
                nearbyMealPlanExposureAllowed: true,
                mealSuggestionAllowed: true,
                lastKnownLocation: null,
                permissionSnapshot: null,
                updatedAt: '2026-06-17T01:00:00.000Z'
            })
        )
    })

    await page.route(`**/api/v1/meal-plans/${mealPlanId}`, async route => {
        await fulfillJson(
            route,
            apiSuccess({
                mealPlanId,
                owner: {
                    memberId: 1,
                    username: 'ownerUser',
                    profileImageUrl: null
                },
                title: '오늘 점심 밥약',
                status: 'GATHERING',
                channels: ['OWNER_ONLY', 'NEARBY_FRIENDS'],
                participants: [
                    {
                        participantId: '21111111-1111-4111-8111-111111111111',
                        mealPlanId,
                        member: {
                            memberId: 1,
                            username: 'ownerUser',
                            profileImageUrl: null
                        },
                        guest: null,
                        role: 'OWNER',
                        status: 'JOINED',
                        source: 'OWNER',
                        joinedAt: '2026-06-17T01:00:00.000Z',
                        readyAt: null
                    }
                ],
                pendingInvites: [],
                pendingJoinRequests: requestVisible
                    ? [
                          {
                              joinRequestId:
                                  '44444444-4444-4444-8444-444444444444',
                              mealPlanId,
                              requester: {
                                  memberId: 3,
                                  username: '박지민',
                                  profileImageUrl: null
                              },
                              status: 'PENDING',
                              message: '근처라서 같이 먹고 싶어요.',
                              requestedAt: '2026-06-17T01:10:00.000Z',
                              respondedAt: null
                          }
                      ]
                    : [],
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
                    canReadyDecisionTask: true,
                    canRequestChange: false,
                    canReopenDecisionTask: true,
                    canConfirmDecisionSnapshot: true,
                    canConfirmMealPlan: false,
                    canCompleteMealPlan: false,
                    canRecordMealPlan: false,
                    canCancelMealPlan: true
                },
                viewerTaskReadyMap: {},
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
                createdAt: '2026-06-17T01:00:00.000Z',
                updatedAt: '2026-06-17T01:00:00.000Z'
            })
        )
    })

    await page.route(
        '**/api/v1/meal-plans/join-requests/*/accept',
        async route => {
            requestVisible = false
            await fulfillJson(
                route,
                apiSuccess({
                    mealPlanId,
                    owner: {
                        memberId: 1,
                        username: 'ownerUser',
                        profileImageUrl: null
                    },
                    title: '오늘 점심 밥약',
                    status: 'GATHERING',
                    channels: ['OWNER_ONLY', 'NEARBY_FRIENDS'],
                    participants: [],
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
                        canReadyDecisionTask: true,
                        canRequestChange: false,
                        canReopenDecisionTask: true,
                        canConfirmDecisionSnapshot: true,
                        canConfirmMealPlan: false,
                        canCompleteMealPlan: false,
                        canRecordMealPlan: false,
                        canCancelMealPlan: true
                    },
                    viewerTaskReadyMap: {},
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
                    createdAt: '2026-06-17T01:00:00.000Z',
                    updatedAt: '2026-06-17T01:11:00.000Z'
                })
            )
        }
    )
}

test.describe('Milestone 2 owner join request panel', () => {
    test('소유자는 근처 친구 참여 요청을 수락할 수 있다', async ({ page }) => {
        await installJoinRequestOwnerMocks(page)
        await injectAccessToken(page)

        await page.goto('/meal-plans/11111111-1111-4111-8111-111111111111')

        await expect(page.getByText('근처 친구 참여 요청')).toBeVisible()
        await expect(page.getByText('박지민')).toBeVisible()
        await page.getByRole('button', { name: '수락' }).click()
    })
})
