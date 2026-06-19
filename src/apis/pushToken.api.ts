import {
    apiContract,
    type NoContent,
    type PushTokenResponse,
    type RegisterPushTokenRequest,
    type RevokePushTokenRequest
} from '@kimdaegyu/babmukdang-shared/domain'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contractClient } from './client'
import { queryKeys } from './keys'
import type { MutationOptions } from './types'

export const pushTokenApi = {
    list: async (): Promise<PushTokenResponse[]> =>
        contractClient.get(apiContract.pushTokens.list),

    register: async (
        body: RegisterPushTokenRequest
    ): Promise<PushTokenResponse> =>
        contractClient.post(apiContract.pushTokens.register, { body }),

    revoke: async (body: RevokePushTokenRequest): Promise<NoContent> => {
        await contractClient.post(apiContract.pushTokens.revoke, { body })
        return null
    }
}

export const useGetPushTokens = () =>
    useQuery({
        queryKey: queryKeys.pushTokens.all,
        queryFn: pushTokenApi.list
    })

export const useRegisterPushToken = (
    options: MutationOptions<PushTokenResponse> = {}
) => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: pushTokenApi.register,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pushTokens.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return mutation
}

export const useRevokePushToken = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: pushTokenApi.revoke,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pushTokens.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return mutation
}
