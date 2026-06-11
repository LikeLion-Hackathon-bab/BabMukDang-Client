/**
 * @fileoverview Announcement(모집글/공지) API 모듈
 *
 * 모집글 CRUD 및 참여/구독 관련 API 함수와 TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 모집글 목록 조회
 * const { data: announcements } = useGetAnnouncements()
 *
 * // 모집글 참여
 * const { mutate: join } = useJoinAnnouncement({
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
    PostRequest,
    PostResponse,
    RecruitDto
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Announcement API 함수 모음
 */
export const announcementApi = {
    /**
     * 모집글 목록 조회
     * @returns 모집글 목록
     */
    getAnnouncements: async () => {
        const data = await contractClient.get(apiContract.recruits.list)
        return data.map(mapRecruit)
    },

    /**
     * 모집글 작성
     * @param data - 모집글 데이터
     */
    createAnnouncement: async (body: PostRequest) => {
        return contractClient.post(apiContract.recruits.create, { body })
    },
    /**
     * 모집글 마감
     * @param announcementId - 모집글 ID
     */
    closeAnnouncement: async (id: number) => {
        return contractClient.patch(apiContract.recruits.close, {
            pathParams: { recruitId: domainId.recruit(id) }
        })
    },

    /**
     * 모집글 참여
     * @param announcementId - 모집글 ID
     */
    joinAnnouncement: async (id: number) => {
        return contractClient.post(apiContract.recruits.join, {
            pathParams: { recruitId: domainId.recruit(id) }
        })
    }
}

// 하위 호환성을 위한 기존 함수 export
export const getAnnouncements = announcementApi.getAnnouncements
export const postAnnouncement = announcementApi.createAnnouncement
export const closeAnnouncement = announcementApi.closeAnnouncement
export const joinAnnouncement = announcementApi.joinAnnouncement

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 모집글 목록 조회 Hook
 * @returns Query 결과
 *
 * @example
 * const { data: announcements, refetch } = useGetAnnouncements()
 * announcements?.forEach(item => console.log(item.message))
 */
export const useGetAnnouncements = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.announcements.list,
        queryFn: announcementApi.getAnnouncements
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
export const usePostAnnouncement = (options: MutationOptions<CreateRecruitResponse> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: announcementApi.createAnnouncement,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.announcements.all
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
export const useCloseAnnouncement = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: closeAnnouncement,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.announcements.all
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
 * const { mutate: join } = useJoinAnnouncement({
 *   onSuccess: () => toast.success('참여가 완료되었습니다.')
 * })
 * join(announcementId)
 */
export const useJoinAnnouncement = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: joinAnnouncement,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.announcements.all
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
