/**
 * @fileoverview Auth 관련 Mock Fixtures
 */

import type { TokenResponse, OnboardingPreferenceRequest } from '@/apis'
import { domainFood } from '@/domain/factories'

export const mockTokenResponse: TokenResponse = {
    accessToken: 'mock-access-token-jwt-string',
    accessTokenMaxAge: 3600
}

export const mockOnboardingRequest: OnboardingPreferenceRequest = {
    username: 'mock-user',
    profileImageUrl: null,
    bio: null,
    liked: [
        domainFood('10000001', '한식'),
        domainFood('10000002', '일식'),
        domainFood('10000003', '양식')
    ],
    disliked: [domainFood('20000001', '향신료')],
    allergy: [domainFood('30000001', '땅콩'), domainFood('30000002', '갑각류')]
}

export const mockKakaoLoginRedirectUrl =
    'https://kauth.kakao.com/oauth/authorize?client_id=mock&redirect_uri=mock'
