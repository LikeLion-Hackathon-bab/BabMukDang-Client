/**
 * @fileoverview Preference (선호도) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { API_BASE_URL } from '@/apis/baseUrl'
import { mockPreferenceSummary, mockPreferenceMeta } from '@/mocks/fixtures'

const BASE_URL = API_BASE_URL

/**
 * Preference 관련 MSW request handlers
 */
export const preferenceHandlers = [
    /**
     * GET /preferences/me - 내 선호도 요약 조회
     */
    http.get(`${BASE_URL}${endpoints.preferences.mySummary}`, () => {
        const response: typeof api.preferences.SummaryResponse =
            mockPreferenceSummary
        return HttpResponse.json(response)
    }),

    /**
     * GET /preferences/me/meta - 내 선호도 메타 정보 조회
     */
    http.get(`${BASE_URL}${endpoints.preferences.myMeta}`, () => {
        const response: typeof api.preferences.MetaResponse = mockPreferenceMeta
        return HttpResponse.json(response)
    })
]
