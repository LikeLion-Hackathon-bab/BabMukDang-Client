/**
 * @fileoverview Profile API Mock Handlers
 *
 * 프로필 관련 API의 mock handler를 정의합니다.
 * endpoints 객체와 api 타입 패턴을 사용합니다.
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { profileFixtures } from '@/mocks/fixtures'

const BASE_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * Profile API mock handlers
 */
export const profileHandlers = [
    /**
     * GET /members/me/profile - 내 프로필 조회
     */
    http.get(`${BASE_URL}${endpoints.members.myProfile}`, () => {
        const response: typeof api.members.ProfileResponse = {
            code: 200,
            message: 'success',
            data: profileFixtures.myProfile
        }
        return HttpResponse.json(response)
    }),

    /**
     * GET /members/me/profile/detail - 내 프로필 상세 조회
     */
    http.get(`${BASE_URL}${endpoints.members.myProfileDetail}`, () => {
        const response: typeof api.members.ProfileDetailResponse = {
            code: 200,
            message: 'success',
            data: profileFixtures.myProfileDetail
        }
        return HttpResponse.json(response)
    }),

    /**
     * GET /members/:id/profile - 특정 멤버 프로필 조회
     */
    http.get(`${BASE_URL}/members/:id/profile`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 멤버 프로필 조회: ${id}`)
        return HttpResponse.json({
            code: 200,
            message: 'success',
            data: {
                ...profileFixtures.myProfile,
                memberId: Number(id)
            }
        })
    }),

    /**
     * GET /members/:id/profile/detail - 특정 멤버 프로필 상세 조회
     */
    http.get(`${BASE_URL}/members/:id/profile/detail`, ({ params }) => {
        const { id } = params
        console.log(`[MSW] 멤버 프로필 상세 조회: ${id}`)
        return HttpResponse.json({
            code: 200,
            message: 'success',
            data: {
                ...profileFixtures.myProfileDetail,
                memberId: Number(id)
            }
        })
    }),

    /**
     * PATCH /members/me/profile - 프로필 수정
     */
    http.patch(
        `${BASE_URL}${endpoints.members.updateProfile}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.members.UpdateRequest
            console.log('[MSW] 프로필 수정:', body)
            return HttpResponse.json({
                code: 200,
                message: '프로필이 수정되었습니다.',
                data: {
                    ...profileFixtures.myProfile,
                    ...body
                }
            })
        }
    )
]
