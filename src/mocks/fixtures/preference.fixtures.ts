/**
 * @fileoverview Preference (선호도) 관련 Mock Fixtures
 *
 * 선호도 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 */

import type {
    PreferenceSummaryResponse,
    PreferenceMetaResponse,
    PreferenceItem
} from '@/apis'

/**
 * 선호도 항목 mock 데이터
 */
export const mockPreferenceItems: {
    likes: PreferenceItem[]
    dislikes: PreferenceItem[]
    allergies: PreferenceItem[]
} = {
    likes: [
        { code: '10000001', label: '한식' },
        { code: '10000002', label: '일식' },
        { code: '10000003', label: '양식' },
        { code: '10000004', label: '분식' }
    ],
    dislikes: [
        { code: '20000001', label: '향신료' },
        { code: '20000002', label: '고수' }
    ],
    allergies: [
        { code: '30000001', label: '땅콩' },
        { code: '30000002', label: '갑각류' }
    ]
}

/**
 * 선호도 요약 응답 mock 데이터
 */
export const mockPreferenceSummary: PreferenceSummaryResponse = {
    likes: mockPreferenceItems.likes,
    dislikes: mockPreferenceItems.dislikes,
    allergies: mockPreferenceItems.allergies
}

/**
 * 선호도 메타 정보 응답 mock 데이터
 */
export const mockPreferenceMeta: PreferenceMetaResponse = {
    onboardedAt: '2024-01-15T10:30:00',
    lastUpdatedAt: '2024-12-15T14:20:00',
    revision: 3
}
