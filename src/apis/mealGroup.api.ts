import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from './client'
import { domainId } from '@/domain/factories'
import { queryKeys } from './keys'
import { mapMealGroup } from './mappers/mealGroup.mapper'
import type {
    CreateMealGroupRequest,
    AddMealGroupMemberRequest,
    MealGroupHistoryResponse,
    MealGroupPreferenceSummary,
    MealGroupResponse,
    MutationOptions,
    StartMealPlanFromGroupRequest,
    UpdateMealGroupMemberRoleRequest
} from './types'

export const mealGroupApi = {
    create: async (body: CreateMealGroupRequest): Promise<MealGroupResponse> => {
        return contractClient.post(apiContract.mealGroups.create, { body })
    },

    getAll: async (): Promise<MealGroupResponse[]> => {
        return contractClient.get(apiContract.mealGroups.list)
    },

    getCards: async () => {
        const groups = await mealGroupApi.getAll()
        return groups.map(mapMealGroup)
    },

    getDetail: async (mealGroupId: string): Promise<MealGroupResponse> => {
        return contractClient.get(apiContract.mealGroups.detail, {
            pathParams: { mealGroupId: domainId.mealGroup(mealGroupId) }
        })
    },

    getHistory: async (mealGroupId: string): Promise<MealGroupHistoryResponse> => {
        return contractClient.get(apiContract.mealGroups.history, {
            pathParams: { mealGroupId: domainId.mealGroup(mealGroupId) }
        })
    },

    getPreferences: async (
        mealGroupId: string
    ): Promise<MealGroupPreferenceSummary> => {
        return contractClient.get(apiContract.mealGroups.preferences, {
            pathParams: { mealGroupId: domainId.mealGroup(mealGroupId) }
        })
    },

    startMealPlan: async ({
        mealGroupId,
        body
    }: {
        mealGroupId: string
        body: StartMealPlanFromGroupRequest
    }): Promise<{ mealPlanId: string }> => {
        return contractClient.post(apiContract.mealGroups.startMealPlan, {
            pathParams: { mealGroupId: domainId.mealGroup(mealGroupId) },
            body
        })
    },

    addMember: async ({
        mealGroupId,
        body
    }: {
        mealGroupId: string
        body: AddMealGroupMemberRequest
    }): Promise<MealGroupResponse> => {
        return contractClient.post(apiContract.mealGroups.addMember, {
            pathParams: { mealGroupId: domainId.mealGroup(mealGroupId) },
            body
        })
    },

    updateMemberRole: async ({
        mealGroupId,
        memberId,
        body
    }: {
        mealGroupId: string
        memberId: number
        body: UpdateMealGroupMemberRoleRequest
    }): Promise<MealGroupResponse> => {
        return contractClient.patch(apiContract.mealGroups.updateMemberRole, {
            pathParams: {
                mealGroupId: domainId.mealGroup(mealGroupId),
                memberId: domainId.member(memberId)
            },
            body
        })
    },

    removeMember: async ({
        mealGroupId,
        memberId
    }: {
        mealGroupId: string
        memberId: number
    }): Promise<MealGroupResponse> => {
        return contractClient.delete(apiContract.mealGroups.removeMember, {
            pathParams: {
                mealGroupId: domainId.mealGroup(mealGroupId),
                memberId: domainId.member(memberId)
            }
        })
    }
}

export const useMealGroups = () =>
    useQuery({
        queryKey: queryKeys.mealGroups.list,
        queryFn: mealGroupApi.getAll
    })

export const useMealGroupCards = () =>
    useQuery({
        queryKey: [...queryKeys.mealGroups.list, 'cards'] as const,
        queryFn: mealGroupApi.getCards
    })

export const useMealGroupDetail = (
    mealGroupId: string,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: queryKeys.mealGroups.detail(mealGroupId),
        queryFn: () => mealGroupApi.getDetail(mealGroupId),
        enabled: (options?.enabled ?? true) && mealGroupId.length > 0
    })

export const useMealGroupHistory = (
    mealGroupId: string,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: queryKeys.mealGroups.history(mealGroupId),
        queryFn: () => mealGroupApi.getHistory(mealGroupId),
        enabled: (options?.enabled ?? true) && mealGroupId.length > 0
    })

export const useMealGroupPreferences = (
    mealGroupId: string,
    options?: { enabled?: boolean }
) =>
    useQuery({
        queryKey: queryKeys.mealGroups.preferences(mealGroupId),
        queryFn: () => mealGroupApi.getPreferences(mealGroupId),
        enabled: (options?.enabled ?? true) && mealGroupId.length > 0
    })

export const useCreateMealGroup = (options?: MutationOptions<MealGroupResponse>) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: options?.mutationFn ?? mealGroupApi.create,
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mealGroups.all })
            options?.onSuccess?.(data)
        },
        onError: error => options?.onError?.(error),
        onSettled: () => options?.onSettled?.()
    })
}

export const useStartMealPlanFromGroup = (
    options?: MutationOptions<{ mealPlanId: string }>
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: options?.mutationFn ?? mealGroupApi.startMealPlan,
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mealGroups.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all })
            options?.onSuccess?.(data)
        },
        onError: error => options?.onError?.(error),
        onSettled: () => options?.onSettled?.()
    })
}

export const useAddMealGroupMember = (
    options?: MutationOptions<MealGroupResponse>
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mealGroupApi.addMember,
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mealGroups.all })
            options?.onSuccess?.(data)
        },
        onError: error => options?.onError?.(error),
        onSettled: () => options?.onSettled?.()
    })
}

export const useUpdateMealGroupMemberRole = (
    options?: MutationOptions<MealGroupResponse>
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mealGroupApi.updateMemberRole,
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mealGroups.all })
            options?.onSuccess?.(data)
        },
        onError: error => options?.onError?.(error),
        onSettled: () => options?.onSettled?.()
    })
}

export const useRemoveMealGroupMember = (
    options?: MutationOptions<MealGroupResponse>
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: mealGroupApi.removeMember,
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.mealGroups.all })
            options?.onSuccess?.(data)
        },
        onError: error => options?.onError?.(error),
        onSettled: () => options?.onSettled?.()
    })
}
