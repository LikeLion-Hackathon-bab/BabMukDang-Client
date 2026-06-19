import { expect, test, type Page } from '@playwright/test'
import {
    apiSuccess,
    fulfillJson,
    installCommonIdleApiMocks,
    installEventSourceNoop
} from './helpers/apiMock'
import {
    injectAccessToken,
    installAuthenticatedBootstrapMocks
} from './helpers/auth'
import {
    E2E_GROUP_FRIEND_MEMBER_ID,
    E2E_MEAL_GROUP_ID,
    friendListForMealGroupResponse,
    mealGroupHistoryResponse,
    mealGroupPreferencesResponse,
    mealGroupResponse,
    mealGroupWithTransferredOwnerResponse
} from './helpers/p1Fixtures'

async function installP1BootstrapMocks(page: Page) {
    await installEventSourceNoop(page)
    await installAuthenticatedBootstrapMocks(page)
    await installCommonIdleApiMocks(page)
    await injectAccessToken(page)
}

test.describe('P1 MealGroup owner transfer Client mock E2E', () => {
    test.beforeEach(async ({ page }) => {
        await installP1BootstrapMocks(page)
    })

    test('P1-E2E-003C owner 이전 후 현재 사용자의 owner 전용 UI가 사라진다', async ({
        page
    }) => {
        let groupState = mealGroupResponse()
        let transferBody: Record<string, unknown> | undefined

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
            `**/api/v1/meal-groups/${E2E_MEAL_GROUP_ID}/members/${E2E_GROUP_FRIEND_MEMBER_ID}/role`,
            async route => {
                transferBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                groupState = mealGroupWithTransferredOwnerResponse()
                await fulfillJson(route, apiSuccess(groupState))
            }
        )

        await page.goto(`/meal-groups/${E2E_MEAL_GROUP_ID}`)
        await expect(
            page.getByRole('heading', { name: '멤버 관리' })
        ).toBeVisible()
        await expect(
            page.getByTestId(
                `meal-group-member-transfer-owner-${E2E_GROUP_FRIEND_MEMBER_ID}`
            )
        ).toBeVisible()
        await expect(
            page.getByTestId('meal-group-member-add-button')
        ).toBeVisible()

        await page
            .getByTestId(
                `meal-group-member-transfer-owner-${E2E_GROUP_FRIEND_MEMBER_ID}`
            )
            .click()
        await expect.poll(() => transferBody).toEqual({ role: 'OWNER' })

        await expect(
            page.getByTestId(
                `meal-group-member-row-${E2E_GROUP_FRIEND_MEMBER_ID}`
            )
        ).toContainText('그룹친구')
        await expect(
            page.getByTestId(
                `meal-group-member-row-${E2E_GROUP_FRIEND_MEMBER_ID}`
            )
        ).toContainText('소유자')
        await expect(
            page.getByTestId(
                `meal-group-member-transfer-owner-${E2E_GROUP_FRIEND_MEMBER_ID}`
            )
        ).toHaveCount(0)
        await expect(
            page.getByTestId(
                `meal-group-member-remove-${E2E_GROUP_FRIEND_MEMBER_ID}`
            )
        ).toHaveCount(0)
        await expect(
            page.getByTestId('meal-group-member-add-button')
        ).toHaveCount(0)
    })
})
