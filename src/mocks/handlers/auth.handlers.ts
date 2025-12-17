/**
 * @fileoverview Auth API Mock Handlers
 *
 * 인증 관련 API의 mock handler를 정의합니다.
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { mockTokenResponse } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * Auth API mock handlers
 */
export const authHandlers = [
    /**
     * POST /auth/refresh - 토큰 갱신
     */
    http.post(`${BASE_URL}${endpoints.auth.refresh}`, () => {
        const response: typeof api.auth.RefreshResponse = {
            code: 200,
            message: 'success',
            data: mockTokenResponse
        }
        return HttpResponse.json(response)
    }),

    /**
     * POST /auth/logout - 로그아웃
     */
    http.post(`${BASE_URL}${endpoints.auth.logout}`, () => {
        console.log('[MSW] 로그아웃')
        return HttpResponse.json({
            code: 200,
            message: '로그아웃 되었습니다.',
            data: null
        })
    }),

    /**
     * POST /auth/onboarding/preference - 온보딩 선호도 저장
     */
    http.post(
        `${BASE_URL}${endpoints.auth.onboardingPreference}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.auth.OnboardingRequest
            console.log('[MSW] 온보딩 선호도 저장:', body)
            return HttpResponse.json({
                code: 200,
                message: '선호도가 저장되었습니다.',
                data: null
            })
        }
    ),

    /**
     * GET /auth/login/kakao - 카카오 로그인 (리다이렉트)
     * 실제로는 OAuth 리다이렉트하지만, mock에서는 토큰 직접 반환
     */
    http.get(`${BASE_URL}${endpoints.auth.kakaoLogin}`, () => {
        console.log('[MSW] 카카오 로그인 요청')
        return HttpResponse.json({
            code: 200,
            message: 'success',
            data: mockTokenResponse
        })
    })
]
