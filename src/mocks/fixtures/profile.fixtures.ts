/**
 * @fileoverview Profile Mock Fixtures
 */

import type { ProfileDetailResponse, ProfileDto } from '@/apis'
import { domainFood, domainId } from '@/domain/factories'

export const profileFixtures = {
    myProfile: {
        memberId: domainId.member(1),
        username: 'testUser',
        profileImageUrl: 'https://picsum.photos/100/100'
    } satisfies ProfileDto,

    myProfileDetail: {
        memberId: domainId.member(1),
        userName: 'testUser',
        username: 'testUser',
        profileImageUrl: 'https://picsum.photos/100/100',
        bio: '맛있는 음식을 좋아하는 개발자입니다.',
        meetingCount: 10,
        friendConunt: 3,
        completedPlans: 7,
        uncompletedPlans: 3,
        likes: [domainFood('KOREAN', '한식'), domainFood('JAPANESE', '일식')],
        dislikes: [domainFood('SPICY', '매운 음식')],
        allergies: [domainFood('PEANUT', '땅콩')]
    } satisfies ProfileDetailResponse
}
