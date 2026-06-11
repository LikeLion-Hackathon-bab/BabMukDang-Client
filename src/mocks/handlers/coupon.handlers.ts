/**
 * @fileoverview Coupon (쿠폰) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { API_BASE_URL } from '@/apis/baseUrl'
import { mockCouponResponses } from '@/mocks/fixtures'

const BASE_URL = API_BASE_URL

// 현재 쿠폰 목록 (mutatable for testing)
let currentCoupons = [...mockCouponResponses]

/**
 * Coupon 관련 MSW request handlers
 */
export const couponHandlers = [
    /**
     * GET /coupons/me - 내 쿠폰 목록 조회
     */
    http.get(`${BASE_URL}${endpoints.coupons.my}`, () => {
        const response: typeof api.coupons.ListResponse = currentCoupons
        return HttpResponse.json(response)
    }),

    /**
     * POST /coupons/:id/use - 쿠폰 사용
     */
    http.post(`${BASE_URL}/coupons/:id/use`, ({ params }) => {
        const { id } = params
        const couponId = Number(id)

        console.log(`[MSW] 쿠폰 사용: ${couponId}`)

        // 쿠폰 사용 처리
        const couponIndex = currentCoupons.findIndex(
            c => c.couponId === couponId
        )
        if (couponIndex !== -1) {
            currentCoupons[couponIndex] = {
                ...currentCoupons[couponIndex],
                used: true
            }
        }

        return HttpResponse.json({ used: true })
    })
]
