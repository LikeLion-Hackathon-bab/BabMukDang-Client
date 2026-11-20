// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        // 빌드·테스트 산출물과 네이티브 프로젝트의 생성 파일은 lint 대상이 아니다.
        ignores: [
            'dist',
            'dev-dist',
            'storybook-static',
            'playwright-report',
            'test-results',
            'coverage',
            'android',
            'ios',
            // onnxruntime-web 이 배포하는 번들(minified) 사본으로, 직접 수정하지 않는 vendored 파일이다.
            'public/onnxruntime'
        ]
    },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            ...pluginQuery.configs['flat/recommended']
        ],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            // `_` 접두사는 의도적으로 사용하지 않는 인자·구조분해 변수(예: rest 로 특정 키를 제외)를 표시하는 관례다.
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_'
                }
            ],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true }
            ],
            // TanStack Query 권장 규칙! (flat/recommended)
            // @tanstack/query/exhaustive-deps: 쿼리 함수에서 사용하는 외부 변수는 쿼리 키에 추가하세요!
            // @tanstack/query/stable-query-client: 애플리케이션에서 하나의 쿼리 클라이언트를 생성해 사용하세요!
            // @tanstack/query/no-rest-destructuring: 쿼리의 반환에서 나머지 매개변수(...rest)를 사용하지 마세요!
            '@tanstack/query/exhaustive-deps': 'error',
            '@tanstack/query/stable-query-client': 'error',
            '@tanstack/query/no-rest-destructuring': 'warn'
        }
    },
    storybook.configs['flat/recommended'],
    // Prettier 포맷 규칙과 충돌하는 스타일 규칙을 끄고 prettier/prettier 를 적용한다. 반드시 마지막에 둔다.
    prettierRecommended
)
