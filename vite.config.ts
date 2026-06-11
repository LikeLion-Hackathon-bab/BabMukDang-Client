/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
const dirname =
    typeof __dirname !== 'undefined'
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url))
const sharedDomainDir = path.resolve(dirname, '../BabMukDang-Shared/src/domain')

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        svgr({
            include: '**/*.svg?react',
            svgrOptions: {
                ref: true,
                expandProps: 'end',
                replaceAttrValues: {
                    strokecolor: '{props.strokecolor}',
                    bgcolor: '{props.bgcolor}',
                    fillcolor: '{props.fillcolor}'
                }
            }
        }),
        VitePWA({
            injectRegister: false,
            registerType: 'autoUpdate',
            devOptions: {
                enabled: false,
                type: 'module',
                navigateFallback: 'index.html'
            },
            workbox: {
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
                disableDevLogs: true,
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4194304 bytes
            },
            srcDir: './src',
            filename: 'service-worker.js',
            includeManifestIcons: true,
            manifest: {
                name: '밥먹댕',
                short_name: '밥먹댕',
                id: '/',
                description: '밥먹댕은 밥먹댕 댕',
                theme_color: '#2563eb',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/app_logo.svg',
                        sizes: 'any',
                        type: 'image/svg+xml'
                    }
                ],
                categories: ['food', 'group'],
                lang: 'ko',
                dir: 'ltr'
            }
        })
    ],
    resolve: {
        alias: [
            {
                find: '@kimdaegyu/babmukdang-shared/domain',
                replacement: path.resolve(dirname, '../BabMukDang-Shared/src/domain/index.ts')
            },
            {
                find: '@kimdaegyu/babmukdang-shared',
                replacement: path.resolve(dirname, '../BabMukDang-Shared/src/index.ts')
            },
            { find: '@/article', replacement: path.join(sharedDomainDir, 'article') },
            { find: '@/auth', replacement: path.join(sharedDomainDir, 'auth') },
            { find: '@/common', replacement: path.join(sharedDomainDir, 'common') },
            { find: '@/friend', replacement: path.join(sharedDomainDir, 'friend') },
            { find: '@/invitation', replacement: path.join(sharedDomainDir, 'invitation') },
            { find: '@/meal', replacement: path.join(sharedDomainDir, 'meal') },
            { find: '@/member', replacement: path.join(sharedDomainDir, 'member') },
            { find: '@/plan', replacement: path.join(sharedDomainDir, 'plan') },
            { find: '@/promotion', replacement: path.join(sharedDomainDir, 'promotion') },
            { find: '@/recruit', replacement: path.join(sharedDomainDir, 'recruit') },
            { find: '@/restaurant', replacement: path.join(sharedDomainDir, 'restaurant') },
            { find: '@/room', replacement: path.join(sharedDomainDir, 'room') },
            {
                find: '@',
                replacement: '/src'
            }
        ]
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        exclude: [...configDefaults.exclude, 'e2e/**', 'src/mocks/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html']
        },
        browser: {
            enabled: true
        },
        projects: [
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, '.storybook')
                    })
                ],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: 'chromium'
                            }
                        ]
                    },
                    setupFiles: ['.storybook/vitest.setup.ts']
                }
            }
        ]
    },
    server: {
        host: '0.0.0.0',
        port: 3001
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        minify: true,
        cssCodeSplit: true,
        cssMinify: true
    }
})
