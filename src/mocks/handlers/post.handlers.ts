/**
 * @fileoverview Post (모집글/공지) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { mockPostResponses } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * Post 관련 MSW request handlers
 */
export const postHandlers = [
    /**
     * GET /posts - 모집글 목록 조회
     */
    http.get(`${BASE_URL}${endpoints.posts.list}`, () => {
        const response: typeof api.posts.ListResponse = {
            code: 200,
            message: 'success',
            data: mockPostResponses
        }
        return HttpResponse.json(response)
    }),

    /**
     * POST /posts - 모집글 생성
     */
    http.post(`${BASE_URL}${endpoints.posts.create}`, async ({ request }) => {
        const body = (await request.json()) as typeof api.posts.CreateRequest
        console.log('[MSW] 모집글 생성:', body)

        return HttpResponse.json({
            code: 201,
            message: '모집글이 생성되었습니다.',
            data: null
        })
    }),

    /**
     * POST /posts/:id/close - 모집글 마감
     */
    http.post(`${BASE_URL}/posts/:id/close`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 모집글 마감: ${id}`)

        return HttpResponse.json({
            code: 200,
            message: '모집글이 마감되었습니다.',
            data: null
        })
    }),

    /**
     * POST /posts/:id/join - 모집글 참여
     */
    http.post(`${BASE_URL}/posts/:id/join`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 모집글 참여: ${id}`)

        return HttpResponse.json({
            code: 200,
            message: '참여가 완료되었습니다.',
            data: null
        })
    }),

    /**
     * POST /posts/:id/subscribe - 모집글 구독
     */
    http.post(`${BASE_URL}/posts/:id/subscribe`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 모집글 구독: ${id}`)

        return HttpResponse.json({
            code: 200,
            message: '구독이 완료되었습니다.',
            data: null
        })
    })
]
