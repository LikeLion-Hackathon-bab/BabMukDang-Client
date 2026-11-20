import { expect, test, type Page } from '@playwright/test'
import {
    apiSuccess,
    fulfillJson,
    fulfillNoContent,
    installCommonIdleApiMocks,
    installEventSourceNoop
} from './helpers/apiMock'
import {
    injectAccessToken,
    installAuthenticatedBootstrapMocks,
    locationSettingsResponse
} from './helpers/auth'
import {
    E2E_INVITE_ID,
    E2E_JOIN_REQUEST_ID,
    E2E_MEAL_PLAN_ID,
    friendMealStatusResponse,
    friendSearchResponse,
    mealPlanDetailResponse,
    mealPlanDetailWithFriendResponse,
    mealPlanDetailWithJoinRequestResponse,
    nearbyExposureAllowedEligibilityResponse,
    nearbyExposureBlockedEligibilityResponse,
    nearbyExposureResultResponse,
    receivedInviteResponse,
    sendInviteResponse,
    sentInviteResponse
} from './helpers/mealPlanFixtures'

async function installBrowserGeolocationMock(page: Page) {
    await page.context().grantPermissions(['geolocation'])
    await page.context().setGeolocation({
        latitude: 37.5665,
        longitude: 126.978,
        accuracy: 20
    })

    await page.addInitScript(() => {
        const position: GeolocationPosition = {
            coords: {
                latitude: 37.5665,
                longitude: 126.978,
                accuracy: 20,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
                toJSON: () => ({
                    latitude: 37.5665,
                    longitude: 126.978,
                    accuracy: 20,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                })
            },
            timestamp: Date.parse('2026-06-18T00:00:00.000Z'),
            toJSON: () => ({
                coords: {
                    latitude: 37.5665,
                    longitude: 126.978,
                    accuracy: 20,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: Date.parse('2026-06-18T00:00:00.000Z')
            })
        }

        Object.defineProperty(navigator, 'geolocation', {
            configurable: true,
            value: {
                getCurrentPosition: (success: PositionCallback) => {
                    window.setTimeout(() => success(position), 0)
                },
                watchPosition: (success: PositionCallback) => {
                    window.setTimeout(() => success(position), 0)
                    return 1
                },
                clearWatch: () => undefined
            }
        })
    })
}

async function installInviteAndNearbyBaseMocks(page: Page) {
    await installBrowserGeolocationMock(page)
    await installEventSourceNoop(page)
    await installAuthenticatedBootstrapMocks(page)
    await installCommonIdleApiMocks(page)
    await injectAccessToken(page)

    await page.route('**/api/v1/friends/me/meals**', async route => {
        await fulfillJson(route, apiSuccess(friendMealStatusResponse()))
    })

    await page.route('**/api/v1/friends/search**', async route => {
        await fulfillJson(route, apiSuccess(friendSearchResponse()))
    })

    await page.route('**/api/v1/meal-plans/invites/received', async route => {
        await fulfillJson(route, apiSuccess(receivedInviteResponse()))
    })

    await page.route('**/api/v1/meal-plans/invites/sent', async route => {
        await fulfillJson(route, apiSuccess(sentInviteResponse()))
    })

    await page.route('**/api/v1/members/me/location-consent', async route => {
        await fulfillJson(route, locationSettingsResponse())
    })

    await page.route('**/api/v1/members/me/location', async route => {
        await fulfillJson(route, locationSettingsResponse())
    })

    await page.route('**/api/v1/meal-plans/*/chat/messages', async route => {
        await fulfillJson(route, apiSuccess([]))
    })
}

test.describe('P0 MealPlan invite and nearby E2E', () => {
    test.beforeEach(async ({ page }) => {
        await installInviteAndNearbyBaseMocks(page)
    })

    test('P0-E2E-002C owner와 participant 권한 UI가 다르다', async ({
        page
    }) => {
        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(mealPlanDetailWithFriendResponse())
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}`)

        await expect(
            page.getByRole('heading', { name: '친구 초대' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: '링크 공유' })
        ).toBeVisible()
        await expect(
            page.getByRole('heading', { name: '근처 친구에게 열기' })
        ).toBeVisible()

        await page.unroute(`**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`)
        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess({
                        ...mealPlanDetailWithFriendResponse(),
                        viewerRole: 'FRIEND',
                        viewerPermissions: {
                            ...mealPlanDetailResponse().viewerPermissions,
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
                        }
                    })
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}?role=participant`)

        await expect(page.getByRole('heading', { name: '채팅' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Ready' })).toBeVisible()
        await expect(
            page.getByRole('heading', { name: '친구 초대' })
        ).toHaveCount(0)
        await expect(
            page.getByRole('heading', { name: '링크 공유' })
        ).toHaveCount(0)
        await expect(
            page.getByRole('heading', { name: '근처 친구에게 열기' })
        ).toHaveCount(0)
    })

    test('P0-E2E-003A owner가 친구를 초대한다', async ({ page }) => {
        let capturedBody: Record<string, unknown> | undefined

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(route, apiSuccess(mealPlanDetailResponse()))
            }
        )

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/invites`,
            async route => {
                capturedBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillJson(
                    route,
                    apiSuccess(sendInviteResponse(), 201),
                    201
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}`)
        await page
            .getByPlaceholder('초대 메시지')
            .fill('문서 시나리오 초대입니다.')
        await page.getByPlaceholder('닉네임이나 handle 검색').fill('초대')
        await page.getByRole('button', { name: /초대친구/ }).click()

        await expect
            .poll(() => capturedBody)
            .toEqual({
                inviteeId: 2,
                message: '문서 시나리오 초대입니다.'
            })
    })

    test('P0-E2E-003B 친구가 초대를 수락하면 MealPlan 상세로 이동한다', async ({
        page
    }) => {
        await page.route(
            `**/api/v1/meal-plans/invites/${E2E_INVITE_ID}/accept`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(mealPlanDetailWithFriendResponse())
                )
            }
        )

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(mealPlanDetailWithFriendResponse())
                )
            }
        )

        await page.goto('/friend')
        await expect(page.getByText('existingUser님의 밥약 초대')).toBeVisible()
        await page
            .getByTestId(`meal-plan-invite-accept-${E2E_INVITE_ID}`)
            .click()

        await expect(page).toHaveURL(
            new RegExp(`/meal-plans/${E2E_MEAL_PLAN_ID}$`)
        )
        await expect(
            page.getByRole('heading', { name: '참여자 2명' })
        ).toBeVisible()
        await expect(page.getByText('초대친구')).toBeVisible()
    })

    test('P0-E2E-003C 친구가 초대를 거절한다', async ({ page }) => {
        let declined = false

        await page.route(
            `**/api/v1/meal-plans/invites/${E2E_INVITE_ID}/decline`,
            async route => {
                declined = true
                await fulfillNoContent(route)
            }
        )

        await page.goto('/friend')
        await expect(page.getByText('문서 시나리오 초대입니다.')).toBeVisible()
        await page
            .getByTestId(`meal-plan-invite-decline-${E2E_INVITE_ID}`)
            .click()

        await expect.poll(() => declined).toBe(true)
    })

    test('P0-E2E-004A 위치 동의가 없으면 근처 노출할 수 없다', async ({
        page
    }) => {
        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(route, apiSuccess(mealPlanDetailResponse()))
            }
        )

        await page.route(
            '**/api/v1/meal-plans/nearby-friends/eligibility',
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(nearbyExposureBlockedEligibilityResponse())
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}`)

        await expect(
            page.getByRole('heading', { name: '근처 친구에게 열기' })
        ).toBeVisible()
        await expect(page.getByText('시작 전에 필요한 항목')).toBeVisible()
        await expect(
            page.getByText('서비스 위치 동의가 필요합니다.')
        ).toBeVisible()
    })

    test('P0-E2E-004B owner가 근처 친구에게 밥약을 노출한다', async ({
        page
    }) => {
        let capturedBody: Record<string, unknown> | undefined

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(route, apiSuccess(mealPlanDetailResponse()))
            }
        )

        await page.route(
            '**/api/v1/meal-plans/nearby-friends/eligibility',
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(nearbyExposureAllowedEligibilityResponse())
                )
            }
        )

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/nearby-friends/expose`,
            async route => {
                capturedBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillJson(
                    route,
                    apiSuccess(nearbyExposureResultResponse(), 201),
                    201
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}`)
        await page.getByRole('button', { name: '권한 확인 후 시작' }).click()

        await expect(
            page.getByText('1명의 친구에게 밥약이 노출됐습니다.')
        ).toBeVisible()
        await expect(
            page.getByText('제외된 친구 1명: 공복 상태 아님 1명')
        ).toBeVisible()
        await expect.poll(() => capturedBody).toEqual({ radiusMeters: 1000 })
    })

    test('P0-E2E-004C owner가 근처 친구 참여 요청을 수락한다', async ({
        page
    }) => {
        let accepted = false

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(mealPlanDetailWithJoinRequestResponse())
                )
            }
        )

        await page.route(
            `**/api/v1/meal-plans/join-requests/${E2E_JOIN_REQUEST_ID}/accept`,
            async route => {
                accepted = true
                await fulfillJson(
                    route,
                    apiSuccess(mealPlanDetailWithFriendResponse())
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}`)
        await expect(
            page.getByRole('heading', { name: '근처 친구 참여 요청' })
        ).toBeVisible()
        await expect(
            page.getByText('근처에 있어서 같이 먹고 싶어요.')
        ).toBeVisible()
        await page
            .getByTestId(`meal-plan-join-request-accept-${E2E_JOIN_REQUEST_ID}`)
            .click()

        await expect.poll(() => accepted).toBe(true)
    })
})
