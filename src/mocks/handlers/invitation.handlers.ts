/**
 * @fileoverview Invitation (초대) MSW Handlers
 *
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints } from '@/apis'
import { mockInvitationResponses } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * Invitation 관련 MSW request handlers
 */
export const invitationHandlers = [
    /**
     * GET /invitations - 초대 목록 조회
     */
    http.get(`${BASE_URL}${endpoints.invitations.list}`, () => {
        return HttpResponse.json({
            code: 200,
            message: 'success',
            data: mockInvitationResponses
        })
    }),

    /**
     * POST /invitations/send - 초대 전송
     */
    http.post(
        `${BASE_URL}${endpoints.invitations.send}`,
        async ({ request }) => {
            const body = await request.json()
            console.log('[MSW] 초대 전송:', body)

            return HttpResponse.json({
                code: 201,
                message: '초대가 전송되었습니다.',
                data: null
            })
        }
    ),

    /**
     * POST /invitations/:id/accept - 초대 수락
     */
    http.post(`${BASE_URL}/invitations/:id/accept`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 초대 수락: ${id}`)

        return HttpResponse.json({
            code: 200,
            message: '초대를 수락했습니다.',
            data: null
        })
    }),

    /**
     * POST /invitations/:id/reject - 초대 거절
     */
    http.post(`${BASE_URL}/invitations/:id/reject`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 초대 거절: ${id}`)

        return HttpResponse.json({
            code: 200,
            message: '초대를 거절했습니다.',
            data: null
        })
    })
]
