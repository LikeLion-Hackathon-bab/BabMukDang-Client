import {
    apiContract,
    type MealPlanNotification,
    type NoContent
} from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from './client'
import { queryKeys } from './keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MutationOptions } from './types'

export const notificationApi = {
    getAll: async (): Promise<MealPlanNotification[]> => {
        return contractClient.get(apiContract.notifications.list)
    },

    markRead: async (
        notificationId: string
    ): Promise<MealPlanNotification> => {
        return contractClient.patch(apiContract.notifications.markRead, {
            pathParams: { notificationId }
        })
    },

    delete: async (notificationId: string): Promise<NoContent> => {
        await contractClient.delete(apiContract.notifications.delete, {
            pathParams: { notificationId }
        })
        return null
    }
}

export const useGetNotifications = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.notifications.all,
        queryFn: notificationApi.getAll
    })
    return { data, isLoading, error, refetch }
}

export const useMarkRead = (options: MutationOptions<MealPlanNotification> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: notificationApi.markRead,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.all
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

export const useDeleteNotification = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: notificationApi.delete,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
