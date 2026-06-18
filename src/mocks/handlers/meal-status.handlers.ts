/**
 * @fileoverview Meal Status (식사 상태) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http } from 'msw'
import { endpoints, api } from './endpoints'
import { API_BASE_URL } from '@/apis/baseUrl'
import { mockMealStatus, mockFedStatus } from '@/mocks/fixtures'
import { apiSuccess } from './response'

const BASE_URL = API_BASE_URL

// 현재 식사 상태 (mutatable for testing)
let currentMealStatus = { ...mockMealStatus }

/**
 * Meal Status 관련 MSW request handlers
 */
export const mealStatusHandlers = [
    /**
     * GET /members/me/meal-status - 내 식사 상태 조회
     */
    http.get(`${BASE_URL}${endpoints.mealStatus.my}`, () => {
        const response: typeof api.mealStatus.Response = currentMealStatus
        return apiSuccess(response)
    }),

    /**
     * POST /members/me/meal-status - 식사 상태 업데이트
     */
    http.post(
        `${BASE_URL}${endpoints.mealStatus.update}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.mealStatus.UpdateRequest
            console.log('[MSW] 식사 상태 업데이트:', body)

            // 상태 업데이트
            if (body.action === 'ARTICLE_UPLOAD') {
                currentMealStatus = { ...mockFedStatus }
            } else if (body.action === 'SET_MANNUALY') {
                currentMealStatus = { ...mockMealStatus }
            }

            return apiSuccess(currentMealStatus)
        }
    )
]
