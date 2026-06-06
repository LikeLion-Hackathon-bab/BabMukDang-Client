/**
 * @fileoverview Challenge (챌린지) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { mockChallengeStatus } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

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
        return HttpResponse.json(response)
    })
]
