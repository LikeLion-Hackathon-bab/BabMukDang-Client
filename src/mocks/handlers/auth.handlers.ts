/**
 * @fileoverview Auth API Mock Handlers
 *
 * 인증 관련 API의 mock handler를 정의합니다.
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http } from 'msw'
import { endpoints, api } from './endpoints'
import { API_BASE_URL } from '@/apis/baseUrl'
import { mockTokenResponse } from '@/mocks/fixtures'
import { apiNoContent, apiSuccess } from './response'

const BASE_URL = API_BASE_URL

/**
 * Auth API mock handlers
 */
export const authHandlers = [
    /**
     * POST /auth/refresh - 토큰 갱신
     */
    http.post(`${BASE_URL}${endpoints.auth.refresh}`, () => {
        const response: typeof api.auth.RefreshResponse = mockTokenResponse
        return apiSuccess(response)
    }),

    /**
     * POST /auth/login - 이메일 로그인
     */
    http.post(`${BASE_URL}${endpoints.auth.login}`, () => {
        return apiSuccess(mockTokenResponse)
    }),

    /**
     * POST /auth/signup - 이메일 회원가입
     */
    http.post(`${BASE_URL}${endpoints.auth.signup}`, async ({ request }) => {
        const body = (await request.json()) as typeof api.auth.SignupRequest
        return apiSuccess(
            {
                member: {
                    memberId: 1,
                    username: body.username,
                    profileImageUrl: body.profileImageUrl ?? null
                }
            },
            { status: 201, code: 201, message: '회원가입이 완료되었습니다.' }
        )
    }),

    /**
     * POST /auth/logout - 로그아웃
     */
    http.post(`${BASE_URL}${endpoints.auth.logout}`, () => {
        console.log('[MSW] 로그아웃')
        return apiNoContent()
    }),

    /**
     * POST /preferences/onboarding - 온보딩 선호도 저장
     */
    http.post(
        `${BASE_URL}${endpoints.preferences.onboarding}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.auth.OnboardingRequest
            console.log('[MSW] 온보딩 선호도 저장:', body)
            return apiNoContent()
        }
    ),

    /**
     * GET /auth/kakao - 카카오 로그인 (리다이렉트)
     * 실제로는 OAuth 리다이렉트하지만, mock에서는 토큰 직접 반환
     */
    http.get(`${BASE_URL}${endpoints.auth.kakaoLogin}`, () => {
        console.log('[MSW] 카카오 로그인 요청')
        return apiSuccess(mockTokenResponse)
    })
]
