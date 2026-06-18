/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults } from 'vitest/config'
import svgr from 'vite-plugin-svgr'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
const dirname =
    typeof __dirname !== 'undefined'
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url))
const sharedDomainDir = path.resolve(dirname, '../BabMukDang-Shared/src/domain')
const storybookConfigDir = path.join(dirname, '.storybook')
const hasStorybookConfig = fs.existsSync(path.join(storybookConfigDir, 'main.ts')) || fs.existsSync(path.join(storybookConfigDir, 'main.js')) || fs.existsSync(path.join(storybookConfigDir, 'main.mjs')) || fs.existsSync(path.join(storybookConfigDir, 'main.cjs'))

const storybookProjects = [] as const


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
    ],
    resolve: {
        alias: [
            {
                find: '@kimdaegyu/babmukdang-shared/domain/room',
                replacement: path.resolve(
                    dirname,
                    '../BabMukDang-Shared/src/domain/room/index.ts'
                )
            },
            {
                find: '@kimdaegyu/babmukdang-shared/domain/restaurant',
                replacement: path.resolve(
                    dirname,
                    '../BabMukDang-Shared/src/domain/restaurant/index.ts'
                )
            },
            {
                find: '@kimdaegyu/babmukdang-shared/domain',
                replacement: path.resolve(
                    dirname,
                    '../BabMukDang-Shared/src/domain/index.ts'
                )
            },
            {
                find: '@kimdaegyu/babmukdang-shared',
                replacement: path.resolve(
                    dirname,
                    '../BabMukDang-Shared/src/index.ts'
                )
            },
            {
                find: '@/article',
                replacement: path.join(sharedDomainDir, 'article')
            },
            { find: '@/auth', replacement: path.join(sharedDomainDir, 'auth') },
            {
                find: '@/common',
                replacement: path.join(sharedDomainDir, 'common')
            },
            {
                find: '@/friend',
                replacement: path.join(sharedDomainDir, 'friend')
            },
            {
                find: '@/invitation',
                replacement: path.join(sharedDomainDir, 'invitation')
            },
            { find: '@/meal', replacement: path.join(sharedDomainDir, 'meal') },
            {
                find: '@/live-activity',
                replacement: path.join(sharedDomainDir, 'live-activity')
            },
            {
                find: '@/meal-plan',
                replacement: path.join(sharedDomainDir, 'meal-plan')
            },
            {
                find: '@/member',
                replacement: path.join(sharedDomainDir, 'member')
            },
            { find: '@/plan', replacement: path.join(sharedDomainDir, 'plan') },
            {
                find: '@/promotion',
                replacement: path.join(sharedDomainDir, 'promotion')
            },
            {
                find: '@/push',
                replacement: path.join(sharedDomainDir, 'push')
            },
            {
                find: '@/recruit',
                replacement: path.join(sharedDomainDir, 'recruit')
            },
            {
                find: '@/restaurant',
                replacement: path.join(sharedDomainDir, 'restaurant')
            },
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
        cssMinify: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('onnxruntime-web')) return 'food-ai-runtime'
                    if (id.includes('/src/features/food-ai/')) return 'food-ai'
                    if (id.includes('@capacitor')) return 'native-bridge'
                    if (id.includes('/src/pages/navigation/HomePage')) return 'home-page'
                    if (id.includes('/src/pages/navigation/FriendPage')) return 'friend-page'
                    if (id.includes('/src/pages/navigation/MeetingPage')) return 'meeting-page'
                    if (id.includes('/src/pages/navigation/ProfilePage')) return 'profile-page'
                    if (id.includes('/src/pages/navigation/MealMapPage')) return 'meal-map-page'
                    if (id.includes('/src/pages/meal-plan/')) return 'meal-plan-pages'
                    if (id.includes('/src/pages/meal-group/')) return 'meal-group-pages'
                    if (id.includes('/src/pages/home/UploadPage')) return 'upload-page'
                    if (id.includes('/src/pages/home/')) return 'home-subpages'
                    if (id.includes('/src/pages/profile/')) return 'profile-subpages'
                    if (id.includes('/src/pages/register/')) return 'register-pages'
                    if (id.includes('/src/pages/test/')) return 'test-pages'
                    return undefined
                }
            }
        }
    }
})
