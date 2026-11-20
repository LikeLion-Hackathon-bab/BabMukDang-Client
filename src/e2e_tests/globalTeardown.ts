/**
 * @fileoverview Playwright Global Teardown
 *
 * E2E 테스트 완료 후 정리 작업을 수행합니다.
 */

/**
 * Playwright 테스트 전역 정리
 */
async function globalTeardown() {
    console.log('🧹 [E2E] Global teardown completed')
}

export default globalTeardown
