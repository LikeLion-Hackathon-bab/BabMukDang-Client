/**
 * @fileoverview Post (모집글/공지) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { mockRecruitResponses } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * Post 관련 MSW request handlers
 */
export const postHandlers = [
    /**
     * GET /recruits - 모집글 목록 조회
     */
    http.get(`${BASE_URL}${endpoints.recruits.list}`, () => {
        const response: typeof api.recruits.ListResponse = mockRecruitResponses
        return HttpResponse.json(response)
    }),

    /**
     * POST /recruits - 모집글 생성
     */
    http.post(
        `${BASE_URL}${endpoints.recruits.create}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.recruits.CreateRequest
            console.log('[MSW] 모집글 생성:', body)

            return HttpResponse.json({ created: true }, { status: 201 })
        }
    ),

    /**
     * POST /recruits/:id/close - 모집글 마감
     */
    http.post(`${BASE_URL}/recruits/:id/close`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 모집글 마감: ${id}`)

        return HttpResponse.json({ closed: true })
    }),

    /**
     * POST /recruits/:id/join - 모집글 참여
     */
    http.post(`${BASE_URL}/recruits/:id/join`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 모집글 참여: ${id}`)

        return HttpResponse.json({ joined: true })
    }),

    /**
     * POST /subscriptions/recruits/:id - 모집글 구독
     */
    http.post(`${BASE_URL}/subscriptions/recruits/:id`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 모집글 구독: ${id}`)

        return HttpResponse.json({ subscribed: true })
    })
]
