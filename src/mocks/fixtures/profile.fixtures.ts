/**
 * @fileoverview Profile Mock Fixtures
 *
 * 테스트 및 개발용 프로필 mock 데이터를 정의합니다.
 */

import type { ProfileResponse, ProfileDetailResponse } from '@/apis'

/**
 * Profile mock 데이터
 */
export const profileFixtures = {
    /**
     * 내 프로필 mock
     */
    myProfile: {
        memberId: 1,
        userName: 'testUser',
        profileImageUrl: 'https://picsum.photos/100/100',
        bio: '맛있는 음식을 좋아하는 개발자입니다.',
        meetingCount: 10
    } satisfies ProfileResponse,

    /**
     * 내 프로필 상세 mock (선호도 포함)
     */
    myProfileDetail: {
        memberId: 1,
        userName: 'testUser',
        profileImageUrl: 'https://picsum.photos/100/100',
        bio: '맛있는 음식을 좋아하는 개발자입니다.',
        meetingCount: 10,
        likes: [
            { code: 'KOREAN', label: '한식' },
            { code: 'JAPANESE', label: '일식' }
        ],
        dislikes: [{ code: 'SPICY', label: '매운 음식' }],
        allergies: [{ code: 'PEANUT', label: '땅콩' }]
    } satisfies ProfileDetailResponse
}
