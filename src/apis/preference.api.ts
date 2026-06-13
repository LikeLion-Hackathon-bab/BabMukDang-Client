/**
 * @fileoverview Preference(선호도) API 모듈
 *
 * Shared API contract의 preferences 엔드포인트에 맞춘 API 함수와
 * TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 내 음식 선호도 조회
 * const { data: preference } = useGetMyPreference()
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from './client'
import { queryKeys } from './keys'
import type {
    MemberFoodPreference,
    MutationOptions,
    NoContent,
    UpdatePreferenceRequest
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Preference API 함수 모음
 */
const preferenceApi = {
    /**
     * 내 음식 선호도 조회
     * @returns 좋아하는 음식, 싫어하는 음식, 알레르기 목록
     */
    getMy: async (): Promise<MemberFoodPreference> => {
        return contractClient.get(apiContract.preferences.my)
    },

    /**
     * 내 음식 선호도 수정
     * @param data - 수정할 음식 선호도 데이터
     */
    update: async (data: UpdatePreferenceRequest): Promise<NoContent> => {
        return contractClient.patch(apiContract.preferences.update, {
            body: data
        })
    }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 내 음식 선호도 조회 Hook
 * @returns Query 결과 (liked, disliked, allergy)
 *
 * @example
 * const { data: preference } = useGetMyPreference()
 * console.log(preference?.liked)
 */
export const useGetMyPreference = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.preferences.my,
        queryFn: preferenceApi.getMy
    })
    return { data, isLoading, error, refetch }
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 내 음식 선호도 수정 Hook
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: updatePreference } = useUpdatePreference({
 *   onSuccess: () => toast.success('선호도가 저장되었습니다')
 * })
 * updatePreference({ liked: [], disliked: [], allergy: [] })
 */
export const useUpdatePreference = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, mutateAsync, isPending, error } = useMutation({
        mutationFn: (data: UpdatePreferenceRequest) =>
            preferenceApi.update(data),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.preferences.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError,
        onSettled: options.onSettled
    })
    return { mutate, mutateAsync, isPending, error }
}
