/**
 * @fileoverview Meal Status (식사 상태) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { mockMealStatus, mockFedStatus } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

// 현재 식사 상태 (mutatable for testing)
let currentMealStatus = { ...mockMealStatus }

/**
 * Meal Status 관련 MSW request handlers
 */
export const mealStatusHandlers = [
    /**
     * GET /meal-status/me - 내 식사 상태 조회
     */
    http.get(`${BASE_URL}${endpoints.mealStatus.my}`, () => {
        const response: typeof api.mealStatus.Response = currentMealStatus
        return HttpResponse.json(response)
    }),

    /**
     * POST /meal-status/me - 식사 상태 업데이트
     */
    http.post(
        `${BASE_URL}${endpoints.mealStatus.update}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.mealStatus.UpdateRequest
            console.log('[MSW] 식사 상태 업데이트:', body)

            // 상태 업데이트
            if (body.action === 'ATE_NOW') {
                currentMealStatus = { ...mockFedStatus }
            } else if (body.action === 'SET_OFF') {
                currentMealStatus = { ...mockMealStatus }
            }

            return HttpResponse.json({
                code: 200,
                message: '식사 상태가 업데이트되었습니다.',
                data: currentMealStatus
            })
        }
    )
]
