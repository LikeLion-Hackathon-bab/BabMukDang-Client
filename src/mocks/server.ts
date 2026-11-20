/**
 * @fileoverview MSW Server 설정
 *
 * Node.js 환경(테스트)에서 MSW를 설정합니다.
 * Vitest, Jest 등의 테스트 환경에서 API 요청을 mock하는 데 사용됩니다.
 *
 * @example
 * // vitest.setup.ts 또는 jest.setup.ts에서
 * import { server } from './mocks/server'
 *
 * beforeAll(() => server.listen())
 * afterEach(() => server.resetHandlers())
 * afterAll(() => server.close())
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW 서버 인스턴스 (Node.js 환경용)
 */
export const server = setupServer(...handlers)
