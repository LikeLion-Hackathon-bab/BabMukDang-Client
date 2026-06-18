/**
 * @fileoverview Challenge (챌린지) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http } from 'msw'
import { endpoints, api } from './endpoints'
import { API_BASE_URL } from '@/apis/baseUrl'
import { mockChallengeStatus } from '@/mocks/fixtures'
import { apiSuccess } from './response'

const BASE_URL = API_BASE_URL

/**
 * Challenge 관련 MSW request handlers
 */
export const challengeHandlers = [
    /**
     * GET /challenges/me - 챌린지 상태 조회
     */
    http.get(`${BASE_URL}${endpoints.challenges.me}`, () => {
        const response: typeof api.challenges.StatusResponse =
            mockChallengeStatus
        return apiSuccess(response)
    })
]
