/**
 * @fileoverview Friend (친구) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints } from '@/apis'
import {
    mockFriendMealResponses,
    mockHungryFriends,
    mockFedFriends
} from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

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
    })
]
