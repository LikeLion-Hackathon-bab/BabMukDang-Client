/**
 * @fileoverview Playwright Global Setup
 *
 * E2E 테스트 실행 전 전역 설정을 수행합니다.
 * 인증 토큰 설정, MSW 초기화 등의 작업을 여기서 처리합니다.
 */

import { chromium, type FullConfig } from '@playwright/test'

/**
 * Playwright 테스트 전역 설정
 * @param config - Playwright 설정 객체
 */
async function globalSetup(config: FullConfig) {
    console.log('🚀 [E2E] Global setup started')

    // 예시: 필요시 인증 토큰 설정
    // const browser = await chromium.launch()
    // const page = await browser.newPage()
    // await page.goto('http://localhost:5173/login')
    // // 로그인 로직...
    // await browser.close()

    console.log('✅ [E2E] Global setup completed')
}

export default globalSetup
