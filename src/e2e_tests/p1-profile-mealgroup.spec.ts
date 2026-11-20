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
    installAuthenticatedBootstrapMocks
} from './helpers/auth'
import {
    E2E_MEAL_GROUP_ID,
    E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID,
    E2E_PROFILE_IMAGE_CDN_URL,
    E2E_PROFILE_IMAGE_PUT_URL,
    friendListForMealGroupResponse,
    mealGroupHistoryResponse,
    mealGroupPreferencesResponse,
    mealGroupResponse,
    mealGroupWithNewMemberResponse,
    memberFoodPreferenceResponse,
    profileDetailResponse,
    profilePresignResponse
} from './helpers/p1Fixtures'
import { mealPlanDetailResponse } from './helpers/mealPlanFixtures'

async function installP1BootstrapMocks(page: Page) {
    await installEventSourceNoop(page)
    await installAuthenticatedBootstrapMocks(page)
    await installCommonIdleApiMocks(page)
    await injectAccessToken(page)
}

test.describe('P1 Profile and MealGroup Client mock E2E', () => {
    test.beforeEach(async ({ page }) => {
        await installP1BootstrapMocks(page)
    })

    test('P1-E2E-002B 프로필 이미지 fake PUT, 프로필 수정, 음식 선호 수정 요청을 보낸다', async ({
        page
    }) => {
        let presignBody: Record<string, unknown> | undefined
        let s3PutCalled = false
        let profilePatchBody: Record<string, unknown> | undefined
        let preferencePatchBody: Record<string, unknown> | undefined

        await page.route('**/api/v1/members/1/profile', async route => {
            await fulfillJson(route, apiSuccess(profileDetailResponse()))
        })

        await page.route('**/api/v1/members/me/profile', async route => {
            if (route.request().method() === 'PATCH') {
                profilePatchBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillNoContent(route)
                return
            }

            await fulfillJson(route, apiSuccess(profileDetailResponse()))
        })

        await page.route('**/api/v1/preferences/me', async route => {
            if (route.request().method() === 'PATCH') {
                preferencePatchBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillNoContent(route)
                return
            }

            await fulfillJson(route, apiSuccess(memberFoodPreferenceResponse()))
        })

        await page.route('**/api/v1/uploads/presign-profile', async route => {
            presignBody = route.request().postDataJSON() as Record<
                string,
                unknown
            >
            await fulfillJson(
                route,
                apiSuccess(profilePresignResponse(), 201),
                201
            )
        })

        await page.route(E2E_PROFILE_IMAGE_PUT_URL, async route => {
            s3PutCalled = route.request().method() === 'PUT'
            await route.fulfill({
                status: 200,
                headers: { ETag: '"profile-e2e-etag"' },
                body: ''
            })
        })

        await page.goto('/profile-edit')
        await expect(page.getByTestId('profile-edit-name-input')).toHaveValue(
            'existingUser'
        )

        await page.getByTestId('profile-edit-name-input').fill('수정된대규')
        await page
            .getByTestId('profile-edit-bio-input')
            .fill('P1 프로필 수정 문구입니다.')
        await page
            .getByTestId('profile-edit-tag-input-favoriteFoodsInput')
            .fill('초밥')
        await page
            .getByTestId('profile-edit-tag-input-dislikedFoodsInput')
            .fill('민트초코')
        await page
            .getByTestId('profile-edit-tag-input-allergiesInput')
            .fill('새우')

        await page.getByTestId('profile-edit-image-input').setInputFiles({
            name: 'profile-e2e.png',
            mimeType: 'image/png',
            buffer: Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
                'base64'
            )
        })

        await page.getByTestId('profile-edit-save-button').click()

        await expect
            .poll(() => presignBody)
            .toEqual({ contentType: 'image/png' })
        await expect.poll(() => s3PutCalled).toBe(true)
        await expect
            .poll(() => profilePatchBody)
            .toEqual({
                username: '수정된대규',
                profileImageUrl: E2E_PROFILE_IMAGE_CDN_URL,
                bio: 'P1 프로필 수정 문구입니다.'
            })
        await expect
            .poll(() => preferencePatchBody)
            .toMatchObject({
                liked: [{ code: '초밥', label: '초밥' }],
                disliked: [{ code: '민트초코', label: '민트초코' }],
                allergy: [{ code: '새우', label: '새우' }]
            })
        await expect(page).toHaveURL(/\/profile$/)
    })

    test('P1-E2E-003B MealGroup 목록, 상세, 멤버 추가, 그룹 밥약 시작 요청을 보낸다', async ({
        page
    }) => {
        let groupState = mealGroupResponse()
        let addMemberBody: Record<string, unknown> | undefined
        let startMealPlanBody: Record<string, unknown> | undefined

        await page.route('**/api/v1/meal-groups', async route => {
            if (route.request().method() === 'GET') {
                await fulfillJson(route, apiSuccess([groupState]))
                return
            }

            await route.fallback()
        })

        await page.route(
            `**/api/v1/meal-groups/${E2E_MEAL_GROUP_ID}`,
            async route => {
                if (route.request().method() === 'GET') {
                    await fulfillJson(route, apiSuccess(groupState))
                    return
                }

                await route.fallback()
            }
        )

        await page.route(
            `**/api/v1/meal-groups/${E2E_MEAL_GROUP_ID}/history`,
            async route => {
                await fulfillJson(route, apiSuccess(mealGroupHistoryResponse()))
            }
        )

        await page.route(
            `**/api/v1/meal-groups/${E2E_MEAL_GROUP_ID}/preferences`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(mealGroupPreferencesResponse())
                )
            }
        )

        await page.route('**/api/v1/friends', async route => {
            await fulfillJson(
                route,
                apiSuccess(friendListForMealGroupResponse())
            )
        })

        await page.route(
            `**/api/v1/meal-groups/${E2E_MEAL_GROUP_ID}/members`,
            async route => {
                addMemberBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                groupState = mealGroupWithNewMemberResponse()
                await fulfillJson(route, apiSuccess(groupState, 201), 201)
            }
        )

        await page.route(
            `**/api/v1/meal-groups/${E2E_MEAL_GROUP_ID}/meal-plans`,
            async route => {
                startMealPlanBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                groupState = mealGroupResponse({
                    recentMealPlanIds: [E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID]
                })
                await fulfillJson(
                    route,
                    apiSuccess(
                        { mealPlanId: E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID },
                        201
                    ),
                    201
                )
            }
        )

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess(
                        mealPlanDetailResponse({
                            mealPlanId: E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID,
                            title: '문서 기반 E2E MealGroup 밥약'
                        })
                    )
                )
            }
        )

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID}/chat/messages`,
            async route => {
                await fulfillJson(route, apiSuccess([]))
            }
        )

        await page.goto('/meal-groups')
        await expect(page.getByText('반복 식사 그룹')).toBeVisible()
        await expect(page.getByText('문서 기반 E2E MealGroup')).toBeVisible()

        await page.getByTestId(`meal-group-card-${E2E_MEAL_GROUP_ID}`).click()
        await expect(page).toHaveURL(
            new RegExp(`/meal-groups/${E2E_MEAL_GROUP_ID}$`)
        )
        await expect(
            page.getByRole('heading', { name: '멤버 관리' })
        ).toBeVisible()
        await expect(page.getByText('그룹 취향 요약')).toBeVisible()
        await expect(page.getByText('국밥 2회')).toBeVisible()

        await page
            .getByTestId('meal-group-member-select')
            .selectOption(String(3))
        await page.getByTestId('meal-group-member-add-button').click()
        await expect
            .poll(() => addMemberBody)
            .toEqual({ memberId: 3, role: 'MEMBER' })
        await expect(page.getByText('새그룹친구')).toBeVisible()

        await page
            .getByTestId('meal-group-start-title-input')
            .fill('문서 기반 E2E MealGroup 밥약')
        await page.getByTestId('meal-group-start-button').click()
        await expect
            .poll(() => startMealPlanBody)
            .toEqual({
                title: '문서 기반 E2E MealGroup 밥약'
            })
        await expect(page).toHaveURL(
            new RegExp(`/meal-plans/${E2E_MEAL_GROUP_STARTED_MEAL_PLAN_ID}$`)
        )
        await expect(
            page.getByRole('heading', { name: '문서 기반 E2E MealGroup 밥약' })
        ).toBeVisible()
    })
})
