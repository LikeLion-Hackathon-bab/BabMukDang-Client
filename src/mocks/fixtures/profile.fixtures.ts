/**
 * @fileoverview Profile Mock Fixtures
 *
 * 테스트 및 개발용 프로필 mock 데이터를 정의합니다.
 */

import type { ProfileDto, ProfileDetailResponse } from '@/apis'

/**
 * Profile mock 데이터
 */
export const profileFixtures = {
    /**
     * 내 프로필 mock (Backend DTO shape)
     */
    myProfile: {
        member: {
            userId: 1,
            username: 'testUser',
            profileImageUrl: 'https://picsum.photos/100/100',
            bio: '맛있는 음식을 좋아하는 개발자입니다.',
            meetingCount: 10,
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            email: 'test@babmukdang.com',
            age: 25,
            role: 'USER',
            preferredMenus: ['한식', '일식'],
            dislikedMenus: ['매운 음식']
        },
        mealStatus: false
    } satisfies ProfileDto,

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
