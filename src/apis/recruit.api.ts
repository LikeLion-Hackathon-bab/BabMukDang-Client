/**
 * @fileoverview Recruit(모집글) API 모듈
 *
 * 모집글 CRUD 및 참여/구독 관련 API 함수와 TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 모집글 목록 조회
 * const { data: recruits } = useGetRecruits()
 *
 * // 모집글 참여
 * const { mutate: join } = useJoinRecruit({
 *   onSuccess: () => toast.success('참여 완료')
 * })
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contractClient } from './client'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { domainId } from '@/domain/factories'
import { queryKeys } from './keys'
import { mapRecruit } from './mappers/recruit.mapper'
import type {
    CreateRecruitResponse,
    MutationOptions,
    NoContent,
    RecruitFormView,
    RecruitCardView,
    RecruitDto
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Recruit API 함수 모음
 */
const recruitApi = {
    /**
     * 모집글 목록 조회
     * @returns 모집글 목록
     */
    getRecruits: async () => {
        const data = await contractClient.get(apiContract.recruits.list, {
            query: { page: 0, size: 20 }
        })
        return data.items.map(mapRecruit)
    },

    /**
     * 모집글 작성
     * @param data - 모집글 데이터
     */
    createRecruit: async (body: RecruitFormView) => {
        return contractClient.post(apiContract.recruits.create, { body })
    },
    /**
     * 모집글 마감
     * @param recruitId - 모집글 ID
     */
    closeRecruit: async (id: number) => {
        return contractClient.post(apiContract.recruits.close, {
            pathParams: { recruitId: domainId.recruit(id) }
        })
    },

    /**
     * 모집글 참여
     * @param recruitId - 모집글 ID
     */
    joinRecruit: async (id: number) => {
        return contractClient.post(apiContract.recruits.join, {
            pathParams: { recruitId: domainId.recruit(id) }
        })
    }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 모집글 목록 조회 Hook
 * @returns Query 결과
 *
 * @example
 * const { data: recruits, refetch } = useGetRecruits()
 * recruits?.forEach(item => console.log(item.message))
 */
export const useGetRecruits = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.recruits.list,
        queryFn: recruitApi.getRecruits
    })
    return { data, isLoading, error, refetch }
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 모집글 작성 Hook
 * @param options - 성공/에러 콜백
 */
export const usePostRecruit = (
    options: MutationOptions<CreateRecruitResponse> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: recruitApi.createRecruit,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.recruits.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 모집글 마감 Hook
 * @param options - 성공/에러 콜백
 */
export const useCloseRecruit = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: recruitApi.closeRecruit,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.recruits.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 모집글 참여 Hook
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: join } = useJoinRecruit({
 *   onSuccess: () => toast.success('참여가 완료되었습니다.')
 * })
 * join(recruitId)
 */
export const useJoinRecruit = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: recruitApi.joinRecruit,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.recruits.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
