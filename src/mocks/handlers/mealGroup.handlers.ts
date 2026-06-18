import { http } from 'msw'
import { API_BASE_URL } from '@/apis/baseUrl'
import {
    mockMealGroupHistory,
    mockMealGroupPreferences,
    mockMealGroupResponse,
    mockMealGroups
} from '@/mocks/fixtures'

import { apiSuccess } from './response'

const BASE_URL = API_BASE_URL

export const mealGroupHandlers = [
    http.get(`${BASE_URL}/meal-groups`, () => apiSuccess(mockMealGroups)),
    http.post(`${BASE_URL}/meal-groups`, () => apiSuccess(mockMealGroupResponse)),
    http.get(`${BASE_URL}/meal-groups/:mealGroupId`, () =>
        apiSuccess(mockMealGroupResponse)
    ),
    http.post(`${BASE_URL}/meal-groups/:mealGroupId/meal-plans`, () =>
        apiSuccess({ mealPlanId: '11111111-1111-4111-8111-111111111111' })
    ),
    http.get(`${BASE_URL}/meal-groups/:mealGroupId/history`, () =>
        apiSuccess(mockMealGroupHistory)
    ),
    http.get(`${BASE_URL}/meal-groups/:mealGroupId/preferences`, () =>
        apiSuccess(mockMealGroupPreferences)
    ),
    http.post(`${BASE_URL}/meal-groups/:mealGroupId/members`, () =>
        apiSuccess(mockMealGroupResponse)
    ),
    http.patch(`${BASE_URL}/meal-groups/:mealGroupId/members/:memberId/role`, () =>
        apiSuccess(mockMealGroupResponse)
    ),
    http.delete(`${BASE_URL}/meal-groups/:mealGroupId/members/:memberId`, () =>
        apiSuccess(mockMealGroupResponse)
    )
]
