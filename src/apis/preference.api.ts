/**
 * @fileoverview Preference(선호도) API 모듈
 *
 * 사용자 음식 선호도 관련 API 함수를 제공합니다.
 *
 * @example
 * // 온보딩 선호도 저장
 * await preferenceApi.postOnboarding({
 *   likedCodes: ['KOREAN', 'JAPANESE'],
 *   dislikedCodes: ['SPICY'],
 *   allergyCodes: ['PEANUT']
 * })
 */

import { client } from './client'
import { responses } from './responses'
import type {
    OnboardingPreferenceRequest,
    PreferenceMetaResponse,
    PreferenceSummaryResponse
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Preference API 함수 모음
 */
export const preferenceApi = {
    /**
     * 온보딩 선호도 저장
     * @param data - 선호도 데이터 (좋아하는 음식, 싫어하는 음식, 알레르기)
     */
    postOnboarding: async (
        data: OnboardingPreferenceRequest
    ): Promise<void> => {
        return client.post(responses.preferences.onboarding, data)
    },

    /**
     * 선호도 요약 조회
     * @returns 선호도 요약 (좋아하는 음식, 싫어하는 음식, 알레르기 목록)
     */
    getSummary: async (): Promise<PreferenceSummaryResponse> => {
        return client.get(responses.preferences.mySummary)
    },

    /**
     * 선호도 메타 정보 조회
     * @returns 온보딩 완료 시간, 마지막 수정 시간, 리비전 번호
     */
    getMeta: async (): Promise<PreferenceMetaResponse> => {
        return client.get(responses.preferences.myMeta)
    }
}

// 하위 호환성을 위한 기존 함수 export
export const postOnboardingPreference = preferenceApi.postOnboarding
export const getPreferenceSummary = preferenceApi.getSummary
export const getPreferenceMeta = preferenceApi.getMeta
