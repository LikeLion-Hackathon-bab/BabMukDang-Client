/**
 * @fileoverview Profile API Mock Handlers
 */

import { http, HttpResponse } from 'msw'
import { endpoints, api } from '@/apis'
import { API_BASE_URL } from '@/apis/baseUrl'
import { profileFixtures } from '@/mocks/fixtures'
import { domainId } from '@/domain/factories'

const BASE_URL = API_BASE_URL

export const profileHandlers = [
    http.get(`${BASE_URL}${endpoints.members.myProfile}`, () => {
        const response: typeof api.members.ProfileResponse =
            profileFixtures.myProfile
        return HttpResponse.json(response)
    }),

    http.get(`${BASE_URL}${endpoints.members.myProfileDetail}`, () => {
        const response: typeof api.members.ProfileDetailResponse =
            profileFixtures.myProfileDetail
        return HttpResponse.json(response)
    }),

    http.get(`${BASE_URL}/members/:id/profile`, ({ params }) => {
        const { id } = params
        const response: typeof api.members.ProfileResponse = {
            ...profileFixtures.myProfile,
            memberId: domainId.member(Number(id))
        }
        return HttpResponse.json(response)
    }),

    http.get(`${BASE_URL}/members/:id/profile/detail`, ({ params }) => {
        const { id } = params
        const response: typeof api.members.ProfileDetailResponse = {
            ...profileFixtures.myProfileDetail,
            memberId: domainId.member(Number(id))
        }
        return HttpResponse.json(response)
    }),

    http.patch(
        `${BASE_URL}${endpoints.members.updateProfile}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.members.UpdateRequest
            const response: typeof api.members.ProfileResponse = {
                ...profileFixtures.myProfile,
                username: body.username,
                profileImageUrl: body.profileImageUrl ?? null
            }
            return HttpResponse.json(response)
        }
    )
]
