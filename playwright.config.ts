import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
    testDir: './src/e2e_tests',
    timeout: 30_000,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: isCI
        ? [['github'], ['html', { open: 'never' }]]
        : [['list'], ['html', { open: 'on-failure' }]],

    use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: isCI ? 'retain-on-failure' : 'off',
        trace: isCI ? 'retain-on-failure' : 'off',
    },

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !isCI,
        timeout: 30_000,
        env: {
            VITE_USE_MSW: process.env.VITE_USE_MSW ?? 'false',
        },
    },

    globalSetup: './src/e2e_tests/globalSetup.ts',
    globalTeardown: './src/e2e_tests/globalTeardown.ts',
})
