import { expect, test, type Page, type Route } from '@playwright/test'

type OnboardingStatus = 'REQUIRED' | 'COMPLETED'

const AUTH_STORAGE_KEY = 'auth-storage'

const apiSuccess = <T>(data: T, code = 200) => ({
    success: true,
    code,
    message: code === 201 ? 'Created' : 'OK',
    data
})

const tokenResponse = (accessToken = 'e2e-access-token') =>
    apiSuccess({ accessToken })

const memberResponse = (status: OnboardingStatus) =>
    apiSuccess({
        memberId: 1,
        username: status === 'COMPLETED' ? 'existingUser' : 'newUser',
        profileImageUrl: null,
        onboardingStatus: status,
        onboardingCompletedAt:
            status === 'COMPLETED' ? '2026-06-17T00:00:00.000Z' : null,
        locationConsentStatus: 'UNKNOWN',
        nearbyMealPlanExposureAllowed: false
    })

async function fulfillJson(route: Route, data: unknown, status = 200) {
    await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data)
    })
}

async function installAuthApiMocks(
    page: Page,
    options: { onboardingStatus: OnboardingStatus; refreshSucceeds?: boolean }
) {
    let onboardingStatus = options.onboardingStatus

    await page.route('**/api/v1/auth/refresh', async route => {
        if (options.refreshSucceeds === false) {
            await fulfillJson(
                route,
                {
                    success: false,
                    status: 401,
                    code: 'AUTH_REFRESH_EXPIRED',
                    message: 'Refresh token expired'
                },
                401
            )
            return
        }

        await fulfillJson(route, tokenResponse('refresh-access-token'))
    })

    await page.route('**/api/v1/auth/login', async route => {
        await fulfillJson(route, tokenResponse('email-login-access-token'))
    })

    await page.route('**/api/v1/auth/signup', async route => {
        await fulfillJson(
            route,
            apiSuccess(
                {
                    member: {
                        memberId: 1,
                        username: 'signupUser',
                        profileImageUrl: null
                    }
                },
                201
            ),
            201
        )
    })

    await page.route('**/api/v1/members/me', async route => {
        await fulfillJson(route, memberResponse(onboardingStatus))
    })

    await page.route('**/api/v1/members/me/location-settings', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                locationConsentStatus: 'UNKNOWN',
                nearbyMealPlanExposureAllowed: false,
                mealSuggestionAllowed: false,
                lastKnownLocation: null,
                permissionSnapshot: null,
                updatedAt: '2026-06-17T00:00:00.000Z'
            })
        )
    })

    await page.route('**/api/v1/members/onboarding', async route => {
        onboardingStatus = 'COMPLETED'
        await route.fulfill({ status: 204, body: '' })
    })

    await page.route('**/api/v1/uploads/presign-profile', async route => {
        await fulfillJson(
            route,
            apiSuccess({
                key: 'profiles/1/e2e.jpg',
                putUrl: 'https://storage.example.test/profiles/1/e2e.jpg',
                cdnUrl: 'https://cdn.example.test/profiles/1/e2e.jpg'
            })
        )
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

async function completeOnboardingWithoutImage(page: Page) {
    await expect(page).toHaveURL(/\/onboarding$/)
    await page.getByPlaceholder('이름을 입력해주세요.').fill('대규')
    await page.getByRole('button', { name: '다음' }).click()
    await expect(page).toHaveURL(/\/prefer-menu$/)
    await page.getByRole('button', { name: '다음' }).click()
    await expect(page).toHaveURL(/\/allergic-menu$/)
    await page.getByRole('button', { name: '다음' }).click()
    await expect(page).toHaveURL(/\/finish-register$/)
}

test.describe('Milestone 1 auth bootstrap and onboarding', () => {
    test('기존 회원은 access token bootstrap 후 홈으로 이동한다', async ({
        page
    }) => {
        await installAuthApiMocks(page, { onboardingStatus: 'COMPLETED' })
        await injectAccessToken(page)

        await page.goto('/')

        await expect(page).toHaveURL(/\/home$/)
    })

    test('신규 회원은 보호 route 접근 시 온보딩 시작 화면으로 이동한다', async ({
        page
    }) => {
        await installAuthApiMocks(page, { onboardingStatus: 'REQUIRED' })
        await injectAccessToken(page)

        await page.goto('/home')

        await expect(page).toHaveURL(/\/onboarding$/)
    })

    test('OAuth 복귀 사용자는 refresh cookie로 세션을 복구하고 홈으로 이동한다', async ({
        page
    }) => {
        await installAuthApiMocks(page, {
            onboardingStatus: 'COMPLETED',
            refreshSucceeds: true
        })

        await page.goto('/')

        await expect(page).toHaveURL(/\/home$/)
    })

    test('이메일 로그인 성공 후 기존 회원은 홈으로 이동한다', async ({
        page
    }) => {
        await installAuthApiMocks(page, { onboardingStatus: 'COMPLETED' })

        await page.goto('/login')
        await page.getByPlaceholder('이메일').fill('existing@example.com')
        await page.getByPlaceholder('비밀번호').fill('password123')
        await page.getByRole('button', { name: '이메일 로그인' }).click()

        await expect(page).toHaveURL(/\/home$/)
    })

    test('이메일 회원가입 신규 회원은 온보딩을 완료하고 완료 화면으로 이동한다', async ({
        page
    }) => {
        await installAuthApiMocks(page, { onboardingStatus: 'REQUIRED' })

        await page.goto('/login')
        await page.getByPlaceholder('이메일').fill('new-user@example.com')
        await page.getByPlaceholder('비밀번호').fill('password123')
        await page.getByRole('button', { name: '회원가입' }).click()

        await completeOnboardingWithoutImage(page)
    })
})
