import type { Page } from '@playwright/test'
import { apiSuccess, fulfillJson } from './apiMock'

export interface TestAuthContext {
    accessToken: string
    memberId: number
}

export type TestOnboardingStatus = 'REQUIRED' | 'COMPLETED'

export const AUTH_STORAGE_KEY = 'auth-storage'

export const createUnauthenticatedTestAuthContext = (): TestAuthContext => ({
    accessToken: '',
    memberId: 0
})

export async function injectAccessToken(
    page: Page,
    accessToken = 'e2e-access-token'
) {
    await page.addInitScript(
        ({ key, token }) => {
            localStorage.setItem(
                key,
                JSON.stringify({
                    state: {
                        accessToken: token,
                        username: 'existingUser',
                        userId: '1',
                        profile: {
                            profileImageUrl: null,
                            userName: 'existingUser',
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

export const memberResponse = (
    status: TestOnboardingStatus = 'COMPLETED',
    overrides: Record<string, unknown> = {}
) =>
    apiSuccess({
        memberId: 1,
        username: status === 'COMPLETED' ? 'existingUser' : 'newUser',
        profileImageUrl: null,
        onboardingStatus: status,
        onboardingCompletedAt:
            status === 'COMPLETED' ? '2026-06-18T00:00:00.000Z' : null,
        locationConsentStatus: 'GRANTED',
        nearbyMealPlanExposureAllowed: true,
        ...overrides
    })

export const locationSettingsResponse = () =>
    apiSuccess({
        locationConsentStatus: 'GRANTED',
        nearbyMealPlanExposureAllowed: true,
        mealSuggestionAllowed: true,
        lastKnownLocation: {
            latitude: 37.5665,
            longitude: 126.978,
            accuracyMeters: 20,
            capturedAt: '2026-06-18T00:00:00.000Z'
        },
        permissionSnapshot: null,
        updatedAt: '2026-06-18T00:00:00.000Z'
    })

export async function installAuthenticatedBootstrapMocks(
    page: Page,
    options: { onboardingStatus?: TestOnboardingStatus } = {}
) {
    await page.route('**/api/v1/members/me', async route => {
        await fulfillJson(
            route,
            memberResponse(options.onboardingStatus ?? 'COMPLETED')
        )
    })

    await page.route('**/api/v1/members/me/location-settings', async route => {
        await fulfillJson(route, locationSettingsResponse())
    })

    await page.route('**/api/v1/auth/refresh', async route => {
        await fulfillJson(
            route,
            apiSuccess({ accessToken: 'refresh-access-token' })
        )
    })
}
