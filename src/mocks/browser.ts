/**
 * @fileoverview MSW Browser Worker 설정
 *
 * 브라우저 환경에서 MSW를 설정합니다.
 * 개발 환경에서 API 요청을 mock하는 데 사용됩니다.
 *
 * @example
 * // main.tsx 또는 App.tsx에서
 * if (process.env.NODE_ENV === 'development') {
 *   const { worker } = await import('./mocks/browser')
 *   await worker.start({ onUnhandledRequest: 'bypass' })
 * }
 */

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW Service Worker 인스턴스
 */
export const worker = setupWorker(...handlers)
