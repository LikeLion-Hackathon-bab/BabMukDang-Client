/**
 * @fileoverview Friend (친구) 관련 Mock Fixtures
 */

import type {
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealResponse,
    FriendRequestItemResponse
} from '@/apis'
import { domainId } from '@/domain/factories'

const now = '2025-06-01T09:00:00.000Z'

const friendMeal = (
    memberId: number,
    username: string,
    hungry: boolean,
    label: string,
    updatedAt = now
): FriendMealResponse => ({
    memberId: domainId.member(memberId),
    username,
    profileImageUrl: '',
    hungry,
    label,
    updatedAt
})

export const mockFriendMealResponses: FriendMealResponse[] = [
    friendMeal(1, '유가은', true, '4시간 공복이에요'),
    friendMeal(2, '서은우', false, '방금 먹었어요'),
    friendMeal(3, '김대규', true, '2시간 공복이에요'),
    friendMeal(4, '김성휘', false, '1시간 전에 먹었어요'),
    friendMeal(5, '이민수', true, '6시간 공복이에요'),
    friendMeal(6, '박소영', false, '30분 전에 먹었어요')
]

export const mockHungryFriends = mockFriendMealResponses.filter(f => f.hungry)
export const mockFedFriends = mockFriendMealResponses.filter(f => !f.hungry)
export const MockFriendList = mockFriendMealResponses

export const mockFriendListItems: FriendListItemResponse[] =
    mockFriendMealResponses.map((friend, index) => ({
        memberId: friend.memberId,
        username: friend.username,
        profileImageUrl: friend.profileImageUrl,
        friendSince: `2025-0${(index % 9) + 1}-01T00:00:00.000Z`
    }))

export const mockFriendBlocks: FriendBlockItemResponse[] = [
    {
        memberId: domainId.member(99),
        username: '차단된사용자',
        profileImageUrl: '',
        blockedAt: '2025-05-01T00:00:00.000Z'
    }
]

export const mockIncomingFriendRequests: FriendRequestItemResponse[] = [
    {
        requestId: domainId.friendRequest(1001),
        requester: {
            memberId: domainId.member(7),
            username: '정우진',
            profileImageUrl: ''
        },
        recipient: {
            memberId: domainId.member(1),
            username: '유가은',
            profileImageUrl: ''
        },
        status: 'PENDING',
        requestedAt: now
    }
]

export const mockOutgoingFriendRequests: FriendRequestItemResponse[] = []
