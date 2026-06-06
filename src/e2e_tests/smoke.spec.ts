import { test, expect } from '@playwright/test'

/**
 * 앱 기본 라우트들이 에러 없이 로드되는지 검증하는 스모크 테스트.
 * MSW 활성화 환경에서 실행된다.
 */

test.describe('앱 스모크', () => {
    test('인트로 페이지가 로드된다', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (err) => errors.push(err.message))

        await page.goto('/intro')
        await page.waitForLoadState('networkidle')

        expect(errors).toHaveLength(0)
        await expect(page).toHaveURL(/intro/)
    })

    test('홈 페이지가 로드된다', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (err) => errors.push(err.message))

        await page.goto('/')
        await page.waitForLoadState('networkidle')

        expect(errors).toHaveLength(0)
    })

    test('매칭 페이지가 로드된다', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (err) => errors.push(err.message))

        await page.goto('/matching')
        await page.waitForLoadState('networkidle')

        expect(errors).toHaveLength(0)
    })

    test('프로필 페이지가 로드된다', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (err) => errors.push(err.message))

        await page.goto('/profile')
        await page.waitForLoadState('networkidle')

        expect(errors).toHaveLength(0)
    })

    test('존재하지 않는 경로는 루트로 폴백한다', async ({ page }) => {
        await page.goto('/this-route-does-not-exist-xyz')
        // SPA이므로 앱이 로드되어 있어야 한다
        await page.waitForLoadState('domcontentloaded')
        const title = await page.title()
        expect(title).toBeTruthy()
    })
})

test.describe('모임 페이지', () => {
    test('미팅 목록 페이지가 로드된다', async ({ page }) => {
        await page.goto('/meeting')
        await page.waitForLoadState('networkidle')
        await expect(page).not.toHaveURL(/error/)
    })
})
