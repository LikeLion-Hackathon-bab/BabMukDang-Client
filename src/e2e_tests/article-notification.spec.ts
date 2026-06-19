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
    E2E_ARTICLE_CDN_URL,
    E2E_ARTICLE_ID,
    E2E_ARTICLE_PUT_URL,
    E2E_MEAL_PLAN_ID,
    E2E_NOTIFICATION_ID,
    articleCreatedResponse,
    articleDetailResponse,
    articlePresignResponse,
    commentCreatedResponse,
    homeArticlesWithCreatedArticleResponse,
    mealPlanDetailResponse,
    notificationResponse
} from './helpers/mealPlanFixtures'

async function installArticleAndNotificationMocks(page: Page) {
    await installEventSourceNoop(page)
    await installAuthenticatedBootstrapMocks(page)
    await installCommonIdleApiMocks(page)
    await injectAccessToken(page)
    await page.addInitScript(() => {
        window.localStorage.setItem('e2e-explicit-delete-mode', 'true')
    })

    await page.route(`**/api/v1/articles/${E2E_ARTICLE_ID}`, async route => {
        await fulfillJson(route, apiSuccess(articleDetailResponse()))
    })

    await page.route('**/api/v1/notifications', async route => {
        await fulfillJson(route, apiSuccess([notificationResponse()]))
    })

    await page.route(
        `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}`,
        async route => {
            await fulfillJson(route, apiSuccess(mealPlanDetailResponse()))
        }
    )

    await page.route(
        `**/api/v1/meal-plans/${E2E_MEAL_PLAN_ID}/chat/messages`,
        async route => {
            await fulfillJson(route, apiSuccess([]))
        }
    )
}

test.describe('P0 Article and notification E2E', () => {
    test.beforeEach(async ({ page }) => {
        await installArticleAndNotificationMocks(page)
    })

    test('P0-E2E-008A 게시글 이미지를 fake S3 PUT으로 업로드한다', async ({
        page
    }) => {
        let presignBody: Record<string, unknown> | undefined
        let s3PutCalled = false
        let articleCreateBody: Record<string, unknown> | undefined

        await page.addInitScript(() => {
            window.kakao = {
                maps: {
                    services: {
                        Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' },
                        SortBy: { DISTANCE: 'DISTANCE', ACCURACY: 'ACCURACY' },
                        Places: class {
                            keywordSearch(
                                _query: string,
                                callback: (
                                    items: unknown[],
                                    status: string
                                ) => void
                            ) {
                                window.setTimeout(() => {
                                    callback(
                                        [
                                            {
                                                id: 'restaurant-e2e',
                                                place_name: '문서식당',
                                                address_name: '서울 중구',
                                                road_address_name:
                                                    '서울 중구 세종대로',
                                                category_name: '음식점 > 한식',
                                                category_group_code: 'FD6',
                                                category_group_name: '음식점',
                                                phone: '02-000-0000',
                                                place_url:
                                                    'https://map.kakao.com/link/map/restaurant-e2e',
                                                x: '126.978',
                                                y: '37.5665',
                                                distance: '120'
                                            }
                                        ],
                                        'OK'
                                    )
                                }, 0)
                            }
                        }
                    }
                }
            }
        })

        await page.route('**/api/v1/uploads/presign-article', async route => {
            presignBody = route.request().postDataJSON() as Record<
                string,
                unknown
            >
            await fulfillJson(
                route,
                apiSuccess(articlePresignResponse(), 201),
                201
            )
        })

        await page.route(E2E_ARTICLE_PUT_URL, async route => {
            s3PutCalled = route.request().method() === 'PUT'
            await route.fulfill({
                status: 200,
                headers: { ETag: '"e2e-etag"' },
                body: ''
            })
        })

        await page.route('**/api/v1/articles', async route => {
            if (route.request().method() !== 'POST') {
                await route.fallback()
                return
            }
            articleCreateBody = route.request().postDataJSON() as Record<
                string,
                unknown
            >
            await fulfillJson(
                route,
                apiSuccess(articleCreatedResponse(), 201),
                201
            )
        })

        await page.route('**/api/v1/articles/home**', async route => {
            await fulfillJson(
                route,
                apiSuccess(homeArticlesWithCreatedArticleResponse())
            )
        })

        await page.goto('/home')
        const fileChooserPromise = page.waitForEvent('filechooser')
        await page.getByTestId('home-upload-button').click()
        const fileChooser = await fileChooserPromise
        await fileChooser.setFiles({
            name: 'e2e-article.png',
            mimeType: 'image/png',
            buffer: Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
                'base64'
            )
        })

        await expect(page).toHaveURL(/\/upload$/)
        await page.getByText('다음 단계로 넘어가기').click()
        await expect(page).toHaveURL(/\/search-restaurant$/)
        await page
            .getByPlaceholder('음식점 이름을 검색해 주세요.')
            .fill('문서식당')
        await page.getByRole('button', { name: /문서식당/ }).click()
        await page.getByText('게시물 업로드 하기').click()

        await expect
            .poll(() => presignBody)
            .toEqual({ contentType: 'image/png' })
        await expect.poll(() => s3PutCalled).toBe(true)
        await expect
            .poll(() => articleCreateBody)
            .toMatchObject({
                imageUrl: E2E_ARTICLE_CDN_URL,
                restaurant: {
                    placeId: 'restaurant-e2e',
                    placeName: '문서식당'
                }
            })
    })

    test('P0-E2E-008B 댓글 작성과 좋아요 토글 요청을 보낸다', async ({
        page
    }) => {
        let capturedCommentBody: Record<string, unknown> | undefined
        let likeCalled = false

        await page.route(
            `**/api/v1/articles/${E2E_ARTICLE_ID}/comments`,
            async route => {
                capturedCommentBody = route.request().postDataJSON() as Record<
                    string,
                    unknown
                >
                await fulfillJson(
                    route,
                    apiSuccess(commentCreatedResponse(), 201),
                    201
                )
            }
        )

        await page.route(
            `**/api/v1/articles/${E2E_ARTICLE_ID}/like`,
            async route => {
                likeCalled = true
                await fulfillJson(
                    route,
                    apiSuccess({ liked: true, likeCount: 2 })
                )
            }
        )

        await page.goto(`/post/${E2E_ARTICLE_ID}`)

        await expect(page.getByText('existingUser')).toBeVisible()
        await expect(page.getByText('댓글')).toBeVisible()
        await expect(page.getByText('기존 댓글입니다.')).toBeVisible()

        await page.getByTestId('chat-input').fill('문서 기반 신규 댓글입니다.')
        await page.getByTestId('chat-send-button').click()

        await expect
            .poll(() => capturedCommentBody)
            .toEqual({
                content: '문서 기반 신규 댓글입니다.',
                parentCommentId: null
            })

        await page.getByTestId(`article-like-button-${E2E_ARTICLE_ID}`).click()
        await expect.poll(() => likeCalled).toBe(true)
    })

    test('P0-E2E-011 알림 클릭 시 읽음 처리 후 deepLink로 이동한다', async ({
        page
    }) => {
        let markedRead = false

        await page.route(
            `**/api/v1/notifications/${E2E_NOTIFICATION_ID}/read`,
            async route => {
                markedRead = true
                await fulfillJson(
                    route,
                    apiSuccess({
                        ...notificationResponse(),
                        readAt: '2026-06-18T00:10:00.000Z'
                    })
                )
            }
        )

        await page.goto('/noti')

        await expect(page.getByText('밥약 초대가 도착했습니다')).toBeVisible()
        await expect(
            page.getByText(
                'existingUser님이 문서 기반 E2E 점심 밥약에 초대했습니다.'
            )
        ).toBeVisible()
        await page
            .getByTestId(`notification-card-${E2E_NOTIFICATION_ID}`)
            .click()

        await expect.poll(() => markedRead).toBe(true)
        await expect(page).toHaveURL(
            new RegExp(`/meal-plans/${E2E_MEAL_PLAN_ID}$`)
        )
    })

    test('P0-E2E-011 알림 삭제 요청을 보낸다', async ({ page }) => {
        let deleted = false

        await page.route(
            `**/api/v1/notifications/${E2E_NOTIFICATION_ID}`,
            async route => {
                if (route.request().method() === 'DELETE') {
                    deleted = true
                    await fulfillNoContent(route)
                    return
                }
                await route.fallback()
            }
        )

        await page.goto('/noti')
        await expect(page.getByText('밥약 초대가 도착했습니다')).toBeVisible()

        await page
            .getByTestId(
                `notification-delete-button-${E2E_NOTIFICATION_ID}-explicit`
            )
            .click()

        await expect.poll(() => deleted).toBe(true)
    })
})
