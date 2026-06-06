/**
 * @fileoverview Friend (친구) 관련 Mock Fixtures
 *
 * 친구 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 * mockData.ts에서 마이그레이션됨
 */

import type {
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealResponse,
    FriendRequestItemResponse
} from '@/apis'

/**
 * 친구 식사 상태 응답 mock 데이터 목록
 */
export const mockFriendMealResponses: FriendMealResponse[] = [
    {
        memberId: 1,
        userName: '유가은',
        profileImageUrl: '',
        hungry: true,
        label: '4시간 공복이에요'
    },
    {
        memberId: 2,
        userName: '서은우',
        profileImageUrl: '',
        hungry: false,
        label: '방금 먹었어요'
    },
    {
        memberId: 3,
        userName: '김대규',
        profileImageUrl: '',
        hungry: true,
        label: '2시간 공복이에요'
    },
    {
        memberId: 4,
        userName: '김성휘',
        profileImageUrl: '',
        hungry: false,
        label: '1시간 전에 먹었어요'
    },
    {
        memberId: 5,
        userName: '이민수',
        profileImageUrl: '',
        hungry: true,
        label: '6시간 공복이에요'
    },
    {
        memberId: 6,
        userName: '박소영',
        profileImageUrl: '',
        hungry: false,
        label: '30분 전에 먹었어요'
    }
]

/**
 * 배고픈 친구만 필터링
 */
export const mockHungryFriends = mockFriendMealResponses.filter(f => f.hungry)

/**
 * 배부른 친구만 필터링
 */
export const mockFedFriends = mockFriendMealResponses.filter(f => !f.hungry)

// 하위 호환성을 위한 별칭
export const MockFriendList = mockFriendMealResponses

/**
 * 내 친구 목록 mock (GET /friends/me)
 */
export const mockFriendListItems: FriendListItemResponse[] =
    mockFriendMealResponses.map((friend, index) => ({
        memberId: friend.memberId,
        userName: friend.userName,
        profileImageUrl: friend.profileImageUrl,
        friendSince: `2025-0${(index % 9) + 1}-01T00:00:00.000Z`
    }))

/**
 * 차단 목록 mock (GET /friends/blocks/me)
 */
export const mockFriendBlocks: FriendBlockItemResponse[] = [
    {
        memberId: 99,
        userName: '차단된사용자',
        profileImageUrl: '',
        blockedAt: '2025-05-01T00:00:00.000Z'
    }
]

/**
 * 받은 친구 요청 mock (GET /friends/requests/incoming)
 */
export const mockIncomingFriendRequests: FriendRequestItemResponse[] = [
    {
        requestId: 1001,
        requester: {
            memberId: 7,
            userName: '정우진',
            profileImageUrl: ''
        },
        recipient: {
            memberId: 1,
            userName: '유가은',
            profileImageUrl: ''
        },
        status: 'PENDING',
        requestedAt: '2025-06-01T09:00:00.000Z'
    }
]

/**
 * 보낸 친구 요청 mock (GET /friends/requests/outgoing)
 */
export const mockOutgoingFriendRequests: FriendRequestItemResponse[] = []
