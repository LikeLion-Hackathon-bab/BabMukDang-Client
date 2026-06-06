// /**
//  * @fileoverview 홈 페이지 E2E 테스트
//  *
//  * 홈 페이지의 기본 기능을 테스트합니다.
//  */

// import { test, expect } from '@playwright/test'

// test.describe('홈 페이지', () => {
//     test.beforeEach(async ({ page }) => {
//         // 각 테스트 전 홈 페이지로 이동
//         await page.goto('/')
//     })

//     test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
//         // 페이지 로드 확인
//         await expect(page).toHaveURL('/')
//     })

//     test('로고가 표시되어야 함', async ({ page }) => {
//         // 로고 또는 헤더 요소 확인
//         const header = page.locator('header').first()
//         await expect(header).toBeVisible()
//     })

//     test('하단 네비게이션이 표시되어야 함', async ({ page }) => {
//         // 하단 네비게이션 확인
//         const bottomNav = page.locator('nav').last()
//         await expect(bottomNav).toBeVisible()
//     })
// })

// test.describe('네비게이션', () => {
//     test('매칭 페이지로 이동할 수 있어야 함', async ({ page }) => {
//         await page.goto('/')

//         // 매칭 탭 클릭
//         const matchingTab = page.getByRole('link', { name: /매칭/i })
//         if (await matchingTab.isVisible()) {
//             await matchingTab.click()
//             await expect(page).toHaveURL(/matching/)
//         }
//     })

//     test('프로필 페이지로 이동할 수 있어야 함', async ({ page }) => {
//         await page.goto('/')

//         // 프로필 탭 클릭
//         const profileTab = page.getByRole('link', { name: /프로필|마이/i })
//         if (await profileTab.isVisible()) {
//             await profileTab.click()
//             await expect(page).toHaveURL(/profile/)
//         }
//     })
// })
