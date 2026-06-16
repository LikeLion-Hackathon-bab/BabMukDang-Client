import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/apis/baseUrl'
import {
    mockMealGroupHistory,
    mockMealGroupPreferences,
    mockMealGroupResponse,
    mockMealGroups
} from '@/mocks/fixtures'

const BASE_URL = API_BASE_URL

export const mealGroupHandlers = [
    http.get(`${BASE_URL}/meal-groups`, () => HttpResponse.json(mockMealGroups)),
    http.post(`${BASE_URL}/meal-groups`, () => HttpResponse.json(mockMealGroupResponse)),
    http.get(`${BASE_URL}/meal-groups/:mealGroupId`, () =>
        HttpResponse.json(mockMealGroupResponse)
    ),
    http.post(`${BASE_URL}/meal-groups/:mealGroupId/meal-plans`, () =>
        HttpResponse.json({ mealPlanId: '11111111-1111-4111-8111-111111111111' })
    ),
    http.get(`${BASE_URL}/meal-groups/:mealGroupId/history`, () =>
        HttpResponse.json(mockMealGroupHistory)
    ),
    http.get(`${BASE_URL}/meal-groups/:mealGroupId/preferences`, () =>
        HttpResponse.json(mockMealGroupPreferences)
    ),
    http.post(`${BASE_URL}/meal-groups/:mealGroupId/members`, () =>
        HttpResponse.json(mockMealGroupResponse)
    ),
    http.patch(`${BASE_URL}/meal-groups/:mealGroupId/members/:memberId/role`, () =>
        HttpResponse.json(mockMealGroupResponse)
    ),
    http.delete(`${BASE_URL}/meal-groups/:mealGroupId/members/:memberId`, () =>
        HttpResponse.json(mockMealGroupResponse)
    )
]
