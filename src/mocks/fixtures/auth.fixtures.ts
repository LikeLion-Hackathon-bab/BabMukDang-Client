/**
 * @fileoverview Auth 관련 Mock Fixtures
 *
 * 인증 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 */

import type { TokenResponse, OnboardingPreferenceRequest } from '@/apis'

/**
 * 토큰 응답 mock 데이터
 */
export const mockTokenResponse: TokenResponse = {
    accessToken: 'mock-access-token-jwt-string',
    refreshToken: 'mock-refresh-token-jwt-string',
    accessTokenMaxAge: 3600 // 1시간
}

/**
 * 온보딩 선호도 요청 mock 데이터
 */
export const mockOnboardingRequest: OnboardingPreferenceRequest = {
    likedCodes: ['10000001', '10000002', '10000003'],
    dislikedCodes: ['20000001'],
    allergyCodes: ['30000001', '30000002']
}

/**
 * 카카오 로그인 리다이렉트 URL mock
 */
export const mockKakaoLoginRedirectUrl =
    'https://kauth.kakao.com/oauth/authorize?client_id=mock&redirect_uri=mock'
