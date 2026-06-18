import {
    apiContract,
    type EndMealPlanLiveActivitySessionRequest,
    type MealPlanId,
    type MealPlanLiveActivitySessionListResponse,
    type MealPlanLiveActivitySessionResponse,
    type NoContent,
    type RegisterMealPlanLiveActivitySessionRequest
} from '@kimdaegyu/babmukdang-shared/domain'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contractClient } from './client'
import { queryKeys } from './keys'
import type { MutationOptions } from './types'

export const liveActivityApi = {
    listMealPlanSessions: async (
        mealPlanId: MealPlanId
    ): Promise<MealPlanLiveActivitySessionListResponse> =>
        contractClient.get(apiContract.liveActivities.listMealPlanSessions, {
            pathParams: { mealPlanId }
        }),

    registerMealPlanSession: async (
        mealPlanId: MealPlanId,
        body: RegisterMealPlanLiveActivitySessionRequest
    ): Promise<MealPlanLiveActivitySessionResponse> =>
        contractClient.post(apiContract.liveActivities.registerMealPlanSession, {
            pathParams: { mealPlanId },
            body
        }),

    endMealPlanSessions: async (
        mealPlanId: MealPlanId,
        body: EndMealPlanLiveActivitySessionRequest = {}
    ): Promise<NoContent> => {
        await contractClient.post(apiContract.liveActivities.endMealPlanSessions, {
            pathParams: { mealPlanId },
            body
        })
        return null
    }
}

export const useGetMealPlanLiveActivitySessions = (
    mealPlanId: MealPlanId,
    enabled = true
) =>
    useQuery({
        queryKey: queryKeys.liveActivities.mealPlan(mealPlanId),
        queryFn: () => liveActivityApi.listMealPlanSessions(mealPlanId),
        enabled
    })

export const useRegisterMealPlanLiveActivitySession = (
    mealPlanId: MealPlanId,
    options: MutationOptions<MealPlanLiveActivitySessionResponse> = {}
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: RegisterMealPlanLiveActivitySessionRequest) =>
            liveActivityApi.registerMealPlanSession(mealPlanId, body),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.liveActivities.mealPlan(mealPlanId)
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
}

export const useEndMealPlanLiveActivitySessions = (
    mealPlanId: MealPlanId,
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: EndMealPlanLiveActivitySessionRequest = {}) =>
            liveActivityApi.endMealPlanSessions(mealPlanId, body),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.liveActivities.mealPlan(mealPlanId)
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
}
