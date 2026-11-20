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
    E2E_MEAL_PLAN_ID,
    E2E_SNAPSHOT_ID,
    E2E_STAGE_ID,
    confirmedDecisionDetailResponse,
    mealPlanDecisionDetailResponse
} from './helpers/mealPlanFixtures'

async function installDecisionMocks(page: Page) {
    await installEventSourceNoop(page)
    await installAuthenticatedBootstrapMocks(page)
    await installCommonIdleApiMocks(page)
    await injectAccessToken(page)

    await page.route(
        `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
        async route => {
            await fulfillJson(route, apiSuccess(mealPlanDecisionDetailResponse()))
        }
    )
    await page.route(
        `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/chat/messages`,
        async route => {
            await fulfillJson(route, apiSuccess([]))
        }
    )
}

test.describe('P0 MealPlan decision E2E', () => {
    test.beforeEach(async ({ page }) => {
        await installDecisionMocks(page)
    })

    test('P0-E2E-006A 메뉴 후보 투표는 REST endpoint를 호출하지 않는다', async ({ page }) => {
        let restVoteRequestCount = 0
        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/stages/${E2E_STAGE_ID}/votes`,
            async route => {
                restVoteRequestCount += 1
                await route.abort()
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision/menu`)
        await expect(page.getByRole('heading', { name: '메뉴' })).toBeVisible()
        await page.getByRole('button', { name: '선택' }).first().click()
        await page.waitForTimeout(100)

        expect(restVoteRequestCount).toBe(0)
    })

    test('P0-E2E-006B stage vote는 persistent 후보 추가 sheet와 header 투표 버튼을 사용한다', async ({ page }) => {
        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision/menu`)

        await expect(page.getByRole('button', { name: '후보별 친구 투표' })).toBeVisible()
        await expect(page.getByRole('button', { name: '밥약 채팅' })).toBeVisible()
        await expect(page.getByText('메뉴 후보 추가')).toBeVisible()
        await page.getByRole('button', { name: '메뉴 후보 추가 열기' }).click()
        await expect(page.getByRole('button', { name: '음식 검색' })).toBeVisible()
        await expect(page.getByRole('button', { name: '최근 먹은 메뉴' })).toBeVisible()
        await page.getByRole('button', { name: '최근 먹은 메뉴' }).click()
        await expect(page.getByRole('button', { name: '선호 메뉴로 추가' })).toBeVisible()
        await expect(page.getByRole('button', { name: '불호 메뉴로 추가' })).toBeVisible()
        await expect(page.getByRole('button', { name: '투표 후보로 추가' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Ready', exact: true })).toHaveCount(0)
        await expect(page.getByRole('button', { name: '후보 추가', exact: true })).toHaveCount(0)
    })

    test('P0-E2E-006C 지역 후보 sheet는 지도/검색 탭을 제공한다', async ({ page }) => {
        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision/area`)

        await expect(page.getByText('지역 후보 추가')).toBeVisible()
        await expect(
            page.getByRole('button', { name: '지도에서 마커로 추가' })
        ).toBeVisible()
        await expect(
            page.getByRole('button', { name: '검색해서 추가' })
        ).toBeVisible()
    })

    test('P0-E2E-006D owner가 snapshot을 확인해 final 후보로 승격한다', async ({ page }) => {
        let confirmedSnapshotBody: Record<string, unknown> | undefined
        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/decision-snapshots/${E2E_SNAPSHOT_ID}/confirm`,
            async route => {
                confirmedSnapshotBody = route.request().postDataJSON() as Record<string, unknown>
                await fulfillJson(route, apiSuccess(confirmedDecisionDetailResponse()))
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision`)
        await expect(page.getByText('소유자 확정 후보')).toBeVisible()
        await page.getByRole('button', { name: '이 값 확정' }).click()
        await expect.poll(() => confirmedSnapshotBody).toEqual({
            snapshotId: E2E_SNAPSHOT_ID
        })
    })
})
