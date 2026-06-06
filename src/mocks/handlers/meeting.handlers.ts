/**
 * @fileoverview Meeting (모임) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints } from '@/apis'
import { mockMeetingResponses } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * Meeting 관련 MSW request handlers
 */
export const meetingHandlers = [
    /**
     * GET /plans - 모임 목록 조회 (Backend DTO 직접 반환)
     */
    http.get(`${BASE_URL}${endpoints.plans.list}`, () => {
        return HttpResponse.json(mockMeetingResponses)
    })
]
