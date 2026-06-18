/**
 * @fileoverview Profile API Mock Handlers
 */

import { http } from 'msw'
import { endpoints, api } from './endpoints'
import { API_BASE_URL } from '@/apis/baseUrl'
import { profileFixtures } from '@/mocks/fixtures'
import { domainId } from '@/domain/factories'
import { apiNoContent, apiSuccess } from './response'

const BASE_URL = API_BASE_URL

export const profileHandlers = [
    http.get(`${BASE_URL}${endpoints.members.me}`, () => {
        const response: typeof api.members.ProfileResponse =
            profileFixtures.myProfile
        return apiSuccess(response)
    }),

    http.get(`${BASE_URL}${endpoints.members.myProfile}`, () => {
        const response: typeof api.members.ProfileDetailResponse =
            profileFixtures.myProfileDetail
        return apiSuccess(response)
    }),

    http.get(`${BASE_URL}${endpoints.members.myProfileDetail}`, () => {
        const response: typeof api.members.ProfileDetailResponse =
            profileFixtures.myProfileDetail
        return apiSuccess(response)
    }),

    http.get(`${BASE_URL}/members/:id/profile`, ({ params }) => {
        const { id } = params
        const response: typeof api.members.ProfileDetailResponse = {
            ...profileFixtures.myProfileDetail,
            memberId: domainId.member(Number(id))
        }
        return apiSuccess(response)
    }),

    http.get(`${BASE_URL}/members/:id/profile/detail`, ({ params }) => {
        const { id } = params
        const response: typeof api.members.ProfileDetailResponse = {
            ...profileFixtures.myProfileDetail,
            memberId: domainId.member(Number(id))
        }
        return apiSuccess(response)
    }),


    http.get(`${BASE_URL}/members/me/location-settings`, () =>
        apiSuccess({
            locationConsentStatus: 'UNKNOWN',
            nearbyMealPlanExposureAllowed: false,
            mealSuggestionAllowed: false,
            lastKnownLocation: null,
            permissionSnapshot: null,
            updatedAt: new Date().toISOString()
        })
    ),

    http.patch(`${BASE_URL}/members/me/location-consent`, async ({ request }) => {
        const body = (await request.json()) as {
            locationConsentStatus: 'UNKNOWN' | 'GRANTED' | 'DENIED'
            nearbyMealPlanExposureAllowed: boolean
            mealSuggestionAllowed?: boolean
            permissionSnapshot?: unknown
        }
        return apiSuccess({
            locationConsentStatus: body.locationConsentStatus,
            nearbyMealPlanExposureAllowed:
                body.locationConsentStatus === 'GRANTED' &&
                body.nearbyMealPlanExposureAllowed,
            mealSuggestionAllowed: body.mealSuggestionAllowed ?? false,
            lastKnownLocation: null,
            permissionSnapshot: body.permissionSnapshot ?? null,
            updatedAt: new Date().toISOString()
        })
    }),

    http.patch(`${BASE_URL}/members/me/location`, async ({ request }) => {
        const body = await request.json()
        return apiSuccess({
            locationConsentStatus: 'GRANTED',
            nearbyMealPlanExposureAllowed: true,
            mealSuggestionAllowed: true,
            lastKnownLocation: body,
            permissionSnapshot: null,
            updatedAt: new Date().toISOString()
        })
    }),

    http.patch(
        `${BASE_URL}${endpoints.members.updateProfile}`,
        async ({ request }) => {
            const body =
                (await request.json()) as typeof api.members.UpdateRequest
            console.log('[MSW] 프로필 수정:', body)
            return apiNoContent()
        }
    ),

    http.post(`${BASE_URL}/members/onboarding`, async ({ request }) => {
        const body = await request.json()
        console.log('[MSW] 회원 온보딩 완료:', body)
        return apiNoContent()
    }),

    http.post(`${BASE_URL}/onboarding`, async ({ request }) => {
        const body = await request.json()
        console.log('[MSW] 회원 온보딩 완료(alias):', body)
        return apiNoContent()
    })
]
