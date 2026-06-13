/**
 * @fileoverview Plan(모임) API 모듈
 *
 * Shared API contract의 plans 엔드포인트에 맞춘 API 함수와
 * TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 모임 목록 조회
 * const { data: plans } = useGetPlans()
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from './client'
import { domainId } from '@/domain/factories'
import { queryKeys } from './keys'
import type { MutationOptions, NoContent, PlanResponse } from './types'
import type { PlanListQuery } from '@kimdaegyu/babmukdang-shared/domain'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Plan API 함수 모음
 */
const meetingApi = {
    /**
     * 모임 목록 조회
     * @param query - 모임 목록 조회 조건
     * @returns Shared PlanResponse 배열
     */
    getPlans: async (query: PlanListQuery = {}): Promise<PlanResponse[]> => {
        return contractClient.get(apiContract.plans.list, { query })
    },

    /**
     * 모임 상세 조회
     * @param planId - 모임 ID
     * @returns Shared PlanResponse
     */
    getPlanDetail: async (planId: number): Promise<PlanResponse> => {
        return contractClient.get(apiContract.plans.detail, {
            pathParams: { planId: domainId.plan(planId) }
        })
    },

    /**
     * 모임 취소
     * @param planId - 모임 ID
     */
    cancelPlan: async (planId: number): Promise<NoContent> => {
        return contractClient.patch(apiContract.plans.cancel, {
            pathParams: { planId: domainId.plan(planId) }
        })
    }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 모임 목록 조회 Hook
 * @param query - 모임 목록 조회 조건
 * @returns Query 결과 (Shared PlanResponse 배열)
 *
 * @example
 * const { data: plans } = useGetPlans()
 * plans?.forEach(plan => {
 *   console.log(plan.planId, plan.status)
 * })
 */
export const useGetPlans = (query: PlanListQuery = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.meetings.list,
        queryFn: () => meetingApi.getPlans(query)
    })
    return { data, isLoading, error, refetch }
}

/**
 * 모임 상세 조회 Hook
 * @param planId - 모임 ID
 * @returns Query 결과 (Shared PlanResponse)
 *
 * @example
 * const { data: plan } = useGetPlanDetail(1)
 */
export const useGetPlanDetail = (
    planId: number,
    options?: { enabled?: boolean }
) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.meetings.detail(planId),
        queryFn: () => meetingApi.getPlanDetail(planId),
        enabled: (options?.enabled ?? true) && planId > 0
    })
    return { data, isLoading, error, refetch }
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 모임 취소 Hook
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: cancelPlan } = useCancelPlan({
 *   onSuccess: () => toast.success('모임이 취소되었습니다')
 * })
 * cancelPlan({ planId: 1 })
 */
export const useCancelPlan = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: ({ planId }: { planId: number }) =>
            meetingApi.cancelPlan(planId),
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all })
            options.onSuccess?.(data)
        },
        onError: options.onError,
        onSettled: options.onSettled
    })
    return { mutate, isPending, error }
}
