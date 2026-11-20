// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config({ ignores: ['dist'] }, {
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    'plugin:prettier/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended'
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
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    // TanStack Query 권장 규칙! (plugin:@tanstack/eslint-plugin-query/recommended)
    // @tanstack/query/exhaustive-deps: 쿼리 함수에서 사용하는 외부 변수는 쿼리 키에 추가하세요!
    // @tanstack/query/stable-query-client: 애플리케이션에서 하나의 쿼리 클라이언트를 생성해 사용하세요!
    // @tanstack/query/no-rest-destructuring: 쿼리의 반환에서 나머지 매개변수(...rest)를 사용하지 마세요!
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/stable-query-client': 'error',
    '@tanstack/query/no-rest-destructuring': 'warn'
  }
}, storybook.configs["flat/recommended"]);
