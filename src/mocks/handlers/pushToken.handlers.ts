import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/apis/baseUrl'
import { apiNoContent, apiSuccess } from './response'

const BASE_URL = API_BASE_URL

export const pushTokenHandlers = [
    http.get(`${BASE_URL}/push-tokens`, () => apiSuccess([])),
    http.post(`${BASE_URL}/push-tokens`, async ({ request }) => {
        const body = (await request.json()) as {
            provider?: string
            platform?: string
            deviceId?: string
            permissionStatus?: string
            appVersion?: string
            buildNumber?: string
        }
        return apiSuccess({
            pushTokenId: '77777777-7777-4777-8777-777777777777',
            provider: body.provider ?? 'FCM',
            platform: body.platform ?? 'WEB',
            deviceId: body.deviceId ?? 'mock-device',
            status: 'ACTIVE',
            permissionStatus: body.permissionStatus ?? 'GRANTED',
            appVersion: body.appVersion ?? null,
            buildNumber: body.buildNumber ?? null,
            lastSeenAt: '2026-06-17T10:00:00.000Z',
            revokedAt: null
        })
    }),
    http.post(`${BASE_URL}/push-tokens/revoke`, () => apiNoContent()),
    http.post(`${BASE_URL}/push-tokens/test-invalid`, () =>
        HttpResponse.json({ success: false, status: 410, code: 'INVALID_PUSH_TOKEN', message: 'invalid' }, { status: 410 })
    )
]
