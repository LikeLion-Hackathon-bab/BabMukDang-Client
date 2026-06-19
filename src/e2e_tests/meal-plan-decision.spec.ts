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
    decisionProgressResponse,
    mealPlanDecisionDetailResponse,
    menuCandidate
} from './helpers/mealPlanFixtures'

async function installDecisionMocks(page: Page) {
    await installEventSourceNoop(page)
    await installAuthenticatedBootstrapMocks(page)
    await installCommonIdleApiMocks(page)
    await injectAccessToken(page)

    await page.route(
        `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
        async route => {
            await fulfillJson(
                route,
                apiSuccess(mealPlanDecisionDetailResponse())
            )
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

    test('P0-E2E-006A 참여자가 후보에 vote한다', async ({ page }) => {
        let capturedBody: Record<string, unknown> | undefined

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/stages/${E2E_STAGE_ID}/votes`,
            async route => {
                capturedBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillJson(
                    route,
                    apiSuccess(
                        mealPlanDecisionDetailResponse({
                            decisionStages: [
                                {
                                    ...mealPlanDecisionDetailResponse()
                                        .decisionStages[0],
                                    votes: [
                                        {
                                            voteId: '77777777-7777-4777-8777-777777777777' as never,
                                            voterId: 1 as never,
                                            guestId: null,
                                            voteType: 'PICK',
                                            candidate: menuCandidate,
                                            createdAt:
                                                '2026-06-18T00:30:00.000Z'
                                        }
                                    ]
                                }
                            ]
                        })
                    )
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision`)
        await expect(page.getByRole('heading', { name: '메뉴' })).toBeVisible()
        await page.getByRole('button', { name: '선택' }).first().click()

        await expect
            .poll(() => capturedBody)
            .toMatchObject({
                voteType: 'PICK',
                candidate: menuCandidate
            })
    })

    test('P0-E2E-006B owner가 stage와 snapshot을 완료한다', async ({
        page
    }) => {
        let completedStageBody: Record<string, unknown> | undefined
        let confirmedSnapshotBody: Record<string, unknown> | undefined

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/stages/${E2E_STAGE_ID}/complete`,
            async route => {
                completedStageBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillJson(
                    route,
                    apiSuccess(confirmedDecisionDetailResponse())
                )
            }
        )

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/decision-snapshots/${E2E_SNAPSHOT_ID}/confirm`,
            async route => {
                confirmedSnapshotBody = route
                    .request()
                    .postDataJSON() as Record<string, unknown>
                await fulfillJson(
                    route,
                    apiSuccess(confirmedDecisionDetailResponse())
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision`)
        await expect(page.getByText('소유자 확정 후보')).toBeVisible()
        await page
            .getByRole('button', { name: '확정', exact: true })
            .first()
            .click()

        await expect
            .poll(() => completedStageBody)
            .toMatchObject({
                selectedCandidate: menuCandidate
            })

        await page.getByRole('button', { name: '이 값 확정' }).click()
        await expect
            .poll(() => confirmedSnapshotBody)
            .toEqual({
                snapshotId: E2E_SNAPSHOT_ID
            })
    })

    test('P0-E2E-006C 모든 task ready 후 MealPlan을 확정한다', async ({
        page
    }) => {
        let readyTaskBody: Record<string, unknown> | undefined
        let confirmCalled = false

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/decision-tasks/MENU_PICK/ready`,
            async route => {
                readyTaskBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillJson(
                    route,
                    apiSuccess(confirmedDecisionDetailResponse())
                )
            }
        )

        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/confirm`,
            async route => {
                confirmCalled = true
                await fulfillJson(
                    route,
                    apiSuccess({
                        ...confirmedDecisionDetailResponse(),
                        status: 'CONFIRMED',
                        confirmedAt: '2026-06-18T00:40:00.000Z'
                    })
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision`)
        await expect(page.getByText('MealPlanDecisionWorkflow')).toBeVisible()
        await page.getByRole('button', { name: 'Task Ready' }).first().click()
        await expect.poll(() => readyTaskBody).toEqual({ isReady: true })

        await page.unroute(`**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`)
        await page.route(
            `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
            async route => {
                await fulfillJson(
                    route,
                    apiSuccess({
                        ...confirmedDecisionDetailResponse(),
                        decisionProgress: decisionProgressResponse()
                    })
                )
            }
        )

        await page.goto(`/meal-plans/${E2E_MEAL_PLAN_ID}/decision?ready=1`)
        await page.getByRole('button', { name: '확정하기' }).click()
        await expect.poll(() => confirmCalled).toBe(true)
    })
})
