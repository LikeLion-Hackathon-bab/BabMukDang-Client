/**
 * @fileoverview Friend (친구) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints } from '@/apis'
import { API_BASE_URL } from '@/apis/baseUrl'
import type { FriendRequestItemResponse } from '@/apis'
import { domainId } from '@/domain/factories'
import {
    mockFriendMealResponses,
    mockHungryFriends,
    mockFedFriends,
    mockFriendListItems,
    mockFriendBlocks,
    mockIncomingFriendRequests,
    mockOutgoingFriendRequests
} from '@/mocks/fixtures'

const BASE_URL = API_BASE_URL

const makeRequest = (
    requestId: number,
    status: FriendRequestItemResponse['status']
): FriendRequestItemResponse => ({
    requestId: domainId.friendRequest(requestId),
    requester: { memberId: domainId.member(1), username: '유가은', profileImageUrl: '' },
    recipient: { memberId: domainId.member(2), username: '서은우', profileImageUrl: '' },
    status,
    requestedAt: new Date().toISOString()
})

/**
 * Friend 관련 MSW request handlers
 */
export const friendHandlers = [
    /**
     * GET /friends/me/meals - 친구들의 식사 상태 조회
     */
    http.get(`${BASE_URL}${endpoints.friends.meals}`, ({ request }) => {
        const url = new URL(request.url)
        const filter = url.searchParams.get('filter') || 'ALL'

        let data = mockFriendMealResponses

        if (filter === 'HUNGRY') {
            data = mockHungryFriends
        } else if (filter === 'NOT_HUNGRY') {
            data = mockFedFriends
        }

        return HttpResponse.json(data)
    }),

    /**
     * GET /friends/me - 내 친구 목록
     */
    http.get(`${BASE_URL}${endpoints.friends.list}`, () => {
        return HttpResponse.json(mockFriendListItems)
    }),

    /**
     * GET /friends/search - 친구 검색
     */
    http.get(`${BASE_URL}${endpoints.friends.search}`, ({ request }) => {
        const keyword = new URL(request.url).searchParams.get('keyword') ?? ''
        const data = mockFriendListItems.filter(friend =>
            friend.username.includes(keyword)
        )
        return HttpResponse.json(data)
    }),

    /**
     * GET /friends/blocks/me - 차단 목록
     */
    http.get(`${BASE_URL}${endpoints.friends.blocks}`, () => {
        return HttpResponse.json(mockFriendBlocks)
    }),

    /**
     * GET /friends/requests/incoming - 받은 친구 요청
     */
    http.get(`${BASE_URL}${endpoints.friends.requestsIncoming}`, () => {
        return HttpResponse.json(mockIncomingFriendRequests)
    }),

    /**
     * GET /friends/requests/outgoing - 보낸 친구 요청
     */
    http.get(`${BASE_URL}${endpoints.friends.requestsOutgoing}`, () => {
        return HttpResponse.json(mockOutgoingFriendRequests)
    }),

    /**
     * POST /friends/requests/:memberId - 친구 요청 생성
     */
    http.post(`${BASE_URL}/friends/requests/:memberId`, ({ params }) => {
        console.log('[MSW] 친구 요청 생성:', params.memberId)
        return HttpResponse.json(makeRequest(Date.now(), 'PENDING'))
    }),

    /**
     * POST /friends/requests/:requestId/accept - 친구 요청 수락
     */
    http.post(
        `${BASE_URL}/friends/requests/:requestId/accept`,
        ({ params }) => {
            const requestId = Number(params.requestId)
            return HttpResponse.json(makeRequest(requestId, 'ACCEPTED'))
        }
    ),

    /**
     * POST /friends/requests/:requestId/reject - 친구 요청 거절
     */
    http.post(
        `${BASE_URL}/friends/requests/:requestId/reject`,
        ({ params }) => {
            const requestId = Number(params.requestId)
            return HttpResponse.json(makeRequest(requestId, 'REJECTED'))
        }
    ),

    /**
     * DELETE /friends/requests/:requestId - 친구 요청 취소
     */
    http.delete(`${BASE_URL}/friends/requests/:requestId`, () => {
        return new HttpResponse(null, { status: 204 })
    }),

    /**
     * POST /friends/blocks/:memberId - 멤버 차단
     */
    http.post(`${BASE_URL}/friends/blocks/:memberId`, () => {
        return new HttpResponse(null, { status: 204 })
    }),

    /**
     * DELETE /friends/blocks/:memberId - 차단 해제
     */
    http.delete(`${BASE_URL}/friends/blocks/:memberId`, () => {
        return new HttpResponse(null, { status: 204 })
    }),

    /**
     * DELETE /friends/:memberId - 친구 삭제
     */
    http.delete(`${BASE_URL}/friends/:memberId`, () => {
        return new HttpResponse(null, { status: 204 })
    })
]
