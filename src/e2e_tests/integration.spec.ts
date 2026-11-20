import {
    test,
    expect,
    type APIRequestContext,
    type Page
} from '@playwright/test'
import type {
    CreateMealPlanRequest,
    CreateMealPlanResponse,
    LoginRequest,
    SignupRequest,
    TokenResponse
} from '@kimdaegyu/babmukdang-shared/domain'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const AUTH_STORAGE_KEY = 'auth-storage'

async function apiSuccessData<T>(response: { json: () => Promise<unknown> }) {
    const body = (await response.json()) as { data?: T }
    return body.data as T
}

async function createFullStackSession(request: APIRequestContext) {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const password = 'e2e-password'
    const signupBody: SignupRequest = {
        email: `fullstack-${suffix}@e2e.local`,
        username: 'FullStackE2E',
        password
    }
    const signupResponse = await request.post(
        `${BACKEND_URL}/api/v1/auth/signup`,
        {
            data: signupBody
        }
    )
    expect(signupResponse.status()).toBe(201)

    const loginBody: LoginRequest = {
        email: signupBody.email,
        password
    }
    const loginResponse = await request.post(
        `${BACKEND_URL}/api/v1/auth/login`,
        {
            data: loginBody
        }
    )
    expect(loginResponse.status()).toBe(201)
    const token = await apiSuccessData<TokenResponse>(loginResponse)

    return {
        email: signupBody.email,
        username: signupBody.username,
        accessToken: token.accessToken
    }
}

async function injectAuth(
    page: Page,
    session: Awaited<ReturnType<typeof createFullStackSession>>
) {
    await page.addInitScript(
        ({ key, value }) => {
            localStorage.setItem(key, JSON.stringify(value))
        },
        {
            key: AUTH_STORAGE_KEY,
            value: {
                state: {
                    accessToken: session.accessToken,
                    username: session.username,
                    userId: null,
                    profile: null
                },
                version: 0
            }
        }
    )
}

test.describe('Full-stack compose smoke', () => {
    test('FS-E2E-001 Backend health endpoint and auth flow work through compose', async ({
        request
    }) => {
        const health = await request.get(`${BACKEND_URL}/api/v1`)
        expect(health.status()).toBe(200)

        const session = await createFullStackSession(request)
        const me = await request.get(`${BACKEND_URL}/api/v1/members/me`, {
            headers: { Authorization: `Bearer ${session.accessToken}` }
        })
        expect(me.status()).toBe(200)
    })

    test('FS-E2E-002 Backend creates a MealPlan through the public HTTP boundary', async ({
        request
    }) => {
        const session = await createFullStackSession(request)
        const createBody: CreateMealPlanRequest = {
            title: 'Full-stack E2E 밥약',
            channels: ['OWNER_ONLY'],
            recommendationContext: {
                mealDate: '2026-06-19',
                mealTime: '12:30',
                preferredMenuCategories: ['한식'],
                excludedMenuCategories: [],
                candidateMenuCategories: ['국밥']
            }
        }
        const createdResponse = await request.post(
            `${BACKEND_URL}/api/v1/meal-plans`,
            {
                headers: { Authorization: `Bearer ${session.accessToken}` },
                data: createBody
            }
        )
        expect(createdResponse.status()).toBe(201)
        const created =
            await apiSuccessData<CreateMealPlanResponse>(createdResponse)
        expect(created.mealPlanId).toEqual(expect.any(String))

        const detailResponse = await request.get(
            `${BACKEND_URL}/api/v1/meal-plans/${created.mealPlanId}`,
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
        )
        expect(detailResponse.status()).toBe(200)
    })

    test('FS-E2E-003 Client shell is served and can boot with a real backend token', async ({
        page,
        request
    }) => {
        const session = await createFullStackSession(request)
        await injectAuth(page, session)

        const pageErrors: string[] = []
        page.on('pageerror', error => pageErrors.push(error.message))

        await page.goto('/')
        await page.waitForLoadState('domcontentloaded')
        await expect(page.locator('body')).toBeVisible()
        expect(pageErrors).toHaveLength(0)
    })
})
