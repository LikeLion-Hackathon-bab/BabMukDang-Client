import { http } from 'msw'
import { API_BASE_URL } from '@/apis/baseUrl'
import { apiNoContent, apiSuccess } from './response'

const BASE_URL = API_BASE_URL

export const mockNotifications = [
    {
        notificationId: '90000000-0000-4000-8000-000000000001',
        kind: 'MEAL_PLAN_CONFIRMED',
        mealPlanId: '11111111-1111-4111-8111-111111111111',
        deepLink: '/meal-plans/11111111-1111-4111-8111-111111111111',
        title: '밥약이 확정됐어요',
        message: '오늘 점심 밥약 장소와 시간이 확정되었습니다.',
        createdAt: '2026-06-17T09:00:00.000Z',
        readAt: null
    }
]

export const notificationHandlers = [
    http.get(`${BASE_URL}/notifications`, () => apiSuccess(mockNotifications)),
    http.patch(`${BASE_URL}/notifications/:notificationId/read`, ({ params }) =>
        apiSuccess({
            ...mockNotifications[0],
            notificationId: String(params.notificationId),
            readAt: '2026-06-17T09:05:00.000Z'
        })
    ),
    http.delete(`${BASE_URL}/notifications/:notificationId`, () =>
        apiNoContent()
    )
]
