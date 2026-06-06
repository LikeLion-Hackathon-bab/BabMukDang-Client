import { defineConfig, devices } from '@playwright/test'

/**
 * 실 백엔드 연동 통합 E2E 설정.
 * docker compose로 전체 스택(Backend + Client)을 띄운 뒤 실행한다.
 *
 * 실행 방법:
 *   # 1. 전체 스택 시작 (BabMukDang-Backend/ 에서)
 *   docker compose -f docker-compose.yml --project-directory .. up -d --build
 *
 *   # 2. 통합 E2E 실행 (BabMukDang-Client/ 에서)
 *   BACKEND_URL=http://localhost:3000 npm run test:e2e:integration
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3001'

export default defineConfig({
    testDir: './src/e2e_tests',
    testMatch: [
        '**/integration.spec.ts',
        '**/backend-api.spec.ts',
        '**/backend-socket.spec.ts'
    ],
    timeout: 60_000,
    retries: 2,
    workers: 1,

    reporter: process.env.CI
        ? [['github'], ['html', { open: 'never' }]]
        : [['list'], ['html', { open: 'on-failure' }]],

    use: {
        ...devices['Desktop Chrome'],
        baseURL: CLIENT_URL,
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
    },

    // docker compose가 서비스를 모두 띄운 상태를 가정한다.
    // webServer 없이 외부 서버에 연결한다.
})

export { BACKEND_URL, CLIENT_URL }
