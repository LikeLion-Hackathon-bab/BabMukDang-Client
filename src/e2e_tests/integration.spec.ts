import { test, expect, type Page } from '@playwright/test'

/**
 * 실 백엔드 연동 통합 E2E 테스트.
 * MSW 없이 docker compose 전체 스택 위에서 실행된다.
 *
 * 실행 전제:
 *   docker compose up -d (Backend + Client + DB + RabbitMQ)
 *   npm run test:e2e:integration
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const AUTH_STORAGE_KEY = 'auth-storage'

/** Backend /auth/test 엔드포인트에서 테스트용 JWT를 발급받아 localStorage에 주입한다. */
async function injectTestAuth(page: Page) {
    const res = await page.request.get(`${BACKEND_URL}/api/v1/auth/test`)
    expect(res.ok()).toBeTruthy()

    const body = await res.json()
    // ResponseInterceptor: { code, message, data }
    const accessToken: string = body.data ?? body

    const persistedState = {
        state: {
            accessToken,
            refreshToken: null,
            username: 'E2E',
            userId: '1',
            profile: {
                profileImageUrl: null,
                userName: 'E2E',
                bio: null,
                meetingCount: 0,
            },
        },
        version: 0,
    }

    await page.addInitScript(
        ({ key, value }) => {
            localStorage.setItem(key, JSON.stringify(value))
        },
        { key: AUTH_STORAGE_KEY, value: persistedState },
    )
}

// ─── 백엔드 API 직접 검증 ──────────────────────────────────────────────────

test.describe('백엔드 API 연결', () => {
    test('GET /api/v1 → 200 Hello World', async ({ request }) => {
        const res = await request.get(`${BACKEND_URL}/api/v1`)
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body.data).toBe('Hello World!')
    })

    test('GET /api/v1/recruits (미인증) → 401', async ({ request }) => {
        const res = await request.get(`${BACKEND_URL}/api/v1/recruits`)
        expect(res.status()).toBe(401)
        const body = await res.json()
        expect(body.success).toBe(false)
    })

    test('GET /api/v1/auth/test → JWT 문자열 반환', async ({ request }) => {
        const res = await request.get(`${BACKEND_URL}/api/v1/auth/test`)
        expect(res.status()).toBe(200)
        const body = await res.json()
        const token: string = body.data ?? body
        expect(token.split('.').length).toBe(3)
    })

    test('GET /api/v1/recruits (인증) → 200 배열', async ({ request }) => {
        // 토큰 발급
        const tokenRes = await request.get(`${BACKEND_URL}/api/v1/auth/test`)
        const tokenBody = await tokenRes.json()
        const token: string = tokenBody.data ?? tokenBody

        // 인증 요청
        const res = await request.get(`${BACKEND_URL}/api/v1/recruits`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data)).toBe(true)
    })
})

// ─── Client + 백엔드 연동 UI 검증 ────────────────────────────────────────

test.describe('Client UI + 실 백엔드 연동', () => {
    test.beforeEach(async ({ page }) => {
        await injectTestAuth(page)
    })

    test('홈 페이지가 로드되고 JS 에러가 없다', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (err) => errors.push(err.message))

        await page.goto('/')
        await page.waitForLoadState('networkidle')

        expect(errors).toHaveLength(0)
    })

    test('매칭 페이지가 로드된다', async ({ page }) => {
        await page.goto('/matching')
        await page.waitForLoadState('networkidle')
        await expect(page).not.toHaveURL(/error/)
    })

    test('모임 페이지가 백엔드 데이터를 요청한다', async ({ page }) => {
        const apiCalls: string[] = []
        page.on('request', (req) => {
            if (req.url().includes(BACKEND_URL)) {
                apiCalls.push(req.url())
            }
        })

        await page.goto('/meeting')
        await page.waitForLoadState('networkidle')

        // plans API 또는 관련 API가 호출되어야 한다
        const plansCalled = apiCalls.some(
            (url) => url.includes('/plans') || url.includes('/api/v1'),
        )
        expect(plansCalled).toBe(true)
    })

    test('프로필 페이지가 로드된다', async ({ page }) => {
        await page.goto('/profile')
        await page.waitForLoadState('networkidle')
        await expect(page).not.toHaveURL(/error/)
    })
})

// ─── 네비게이션 ──────────────────────────────────────────────────────────

test.describe('하단 내비게이션', () => {
    test.beforeEach(async ({ page }) => {
        await injectTestAuth(page)
    })

    test('하단 내비게이션이 렌더링된다', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('domcontentloaded')

        const nav = page.locator('nav').last()
        await expect(nav).toBeVisible()
    })
})
