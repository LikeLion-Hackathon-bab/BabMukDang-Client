import { expect, test, type Page, type Route } from '@playwright/test'

const AUTH_STORAGE_KEY = 'auth-storage'

const apiSuccess = <T,>(data: T, code = 200) => ({
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
                        profile: null
                    },
                    version: 0
                })
            )
        },
        { key: AUTH_STORAGE_KEY, token: accessToken }
    )
}

async function installBaseMocks(page: Page) {
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
}

async function installHomeMocks(page: Page) {
    await page.route('**/api/v1/articles/home**', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                items: [],
                meta: {
                    page: 0,
                    size: 20,
                    totalItems: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                }
            })
        )
    })

    await page.route('**/api/v1/meal-plans/home-dashboard', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                generatedAt: '2026-06-17T01:00:00.000Z',
                inProgress: [],
                today: [],
                recordNeeded: [],
                pendingJoinRequests: [
                    {
                        joinRequestId: '44444444-4444-4444-8444-444444444444',
                        mealPlanId: '11111111-1111-4111-8111-111111111111',
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
                ],
                unreadNotifications: [],
                nextActions: [
                    {
                        actionId: 'join-request:44444444-4444-4444-8444-444444444444',
                        kind: 'RESPOND_JOIN_REQUEST',
                        priority: 10,
                        title: '박지민님의 참여 요청',
                        description: '근처 친구가 밥약에 참여하고 싶어합니다.',
                        primaryAction: {
                            label: '요청 확인하기',
                            href: '/meal-plans/11111111-1111-4111-8111-111111111111'
                        },
                        mealPlan: null,
                        joinRequest: null,
                        notification: null
                    }
                ]
            })
        )
    })
}

async function installMapMocks(page: Page) {
    await page.route('**/api/v1/meal-plans/map**', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                generatedAt: '2026-06-17T01:00:00.000Z',
                center: { lat: 37.5665, lng: 126.978, source: 'LAST_KNOWN_LOCATION' },
                layers: {
                    myMealPlanPlaces: [
                        {
                            markerId: 'my-meal-plan:11111111-1111-4111-8111-111111111111',
                            layer: 'MY_MEAL_PLAN_PLACE',
                            lat: 37.5665,
                            lng: 126.978,
                            title: '오늘 점심 밥약',
                            subtitle: '서울시청 근처',
                            href: '/meal-plans/11111111-1111-4111-8111-111111111111',
                            mealPlanId: '11111111-1111-4111-8111-111111111111',
                            articleId: null,
                            restaurant: null,
                            distanceMeters: null,
                            updatedAt: '2026-06-17T01:00:00.000Z',
                            metadata: { ownerId: 1, status: 'DECIDING', participantCount: 2, source: 'selectedArea' }
                        }
                    ],
                    nearbyFriendMealPlans: [],
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
                            articleId: 1,
                            restaurant: null,
                            distanceMeters: 420,
                            updatedAt: '2026-06-17T01:00:00.000Z',
                            metadata: { authorId: 2, authorName: '서은우', imageUrl: null, mealDate: '2026-06-17' }
                        }
                    ],
                    restaurantCandidates: [
                        {
                            markerId: 'restaurant-candidate:1',
                            layer: 'RESTAURANT_CANDIDATE',
                            lat: 37.5649,
                            lng: 126.981,
                            title: '시청 돈까스',
                            subtitle: '오늘 점심 밥약 후보',
                            href: '/meal-plans/11111111-1111-4111-8111-111111111111/decision',
                            mealPlanId: '11111111-1111-4111-8111-111111111111',
                            articleId: null,
                            restaurant: {
                                restaurantId: 'restaurant-2',
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
                            updatedAt: '2026-06-17T01:00:00.000Z',
                            metadata: { stageId: '55555555-5555-4555-8555-555555555555', ownerId: 1, status: 'DECIDING', source: 'search', stageStatus: 'OPEN', canVote: true, canCompleteStage: true, completionBlockedReason: null }
                        }
                    ]
                }
            })
        )
    })

    await page.route('**/api/v1/meal-plans/nearby-friends', async route => {
        await fulfillJson(route, apiSuccess([]))
    })

    await page.route('**/api/v1/meal-plans/*/stages/*/votes', async route => {
        await fulfillJson(route, apiSuccess({}))
    })

    await page.route('**/api/v1/meal-plans/*/stages/*/complete', async route => {
        await fulfillJson(route, apiSuccess({}))
    })
}

test.describe('Milestone 3 Home and Map aggregation', () => {
    test('Home은 서버 aggregation 기반 다음 행동을 보여준다', async ({ page }) => {
        await installBaseMocks(page)
        await installHomeMocks(page)
        await injectAccessToken(page)

        await page.goto('/home')

        await expect(page.getByText('박지민님의 참여 요청')).toBeVisible()
        await expect(page.getByRole('link', { name: '요청 확인하기' })).toBeVisible()
    })

    test('밥지도는 내 밥약, 식당 후보, 친구 기록 layer를 보여준다', async ({ page }) => {
        await installBaseMocks(page)
        await installMapMocks(page)
        await injectAccessToken(page)

        await page.goto('/meal-map')

        await expect(page.getByText('오늘 점심 밥약')).toBeVisible()
        await expect(page.getByText('시청 돈까스')).toBeVisible()
        await expect(page.getByText('을지로 국밥')).toBeVisible()
        await expect(page.getByText('지도')).toBeVisible()
        await expect(page.getByRole('button', { name: '식당 후보 투표' })).toBeVisible()
    })
})
