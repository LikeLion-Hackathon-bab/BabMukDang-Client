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
import { client } from './client'
import { endpoints } from './endpoints'
import { queryKeys } from './keys'
import type { BaseResponse, PostRequest, PostResponse } from './types'

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
    getAll: async (): Promise<BaseResponse<PostResponse[]>> => {
        const res = await client.get(endpoints.posts.list)
        return res.data
    },

    /**
     * 모집글 작성
     * @param data - 모집글 데이터
     */
    create: async (data: PostRequest): Promise<BaseResponse<void>> => {
        const res = await client.post(endpoints.posts.create, data)
        return res.data
    },

    /**
     * 모집글 마감
     * @param announcementId - 모집글 ID
     */
    close: async (announcementId: number): Promise<BaseResponse<void>> => {
        const res = await client.post(endpoints.posts.close(announcementId))
        return res.data
    },

    /**
     * 모집글 참여
     * @param announcementId - 모집글 ID
     */
    join: async (announcementId: number): Promise<BaseResponse<void>> => {
        const res = await client.post(endpoints.posts.join(announcementId))
        return res.data
    },

    /**
     * 모집글 구독
     * @param announcementId - 모집글 ID
     */
    subscribe: async (announcementId: number): Promise<BaseResponse<void>> => {
        const res = await client.post(endpoints.posts.subscribe(announcementId))
        return res.data
    }
}

// 하위 호환성을 위한 기존 함수 export
export const getAnnouncements = announcementApi.getAll
export const postAnnouncement = announcementApi.create
export const closeAnnouncement = announcementApi.close
export const joinAnnouncement = announcementApi.join
export const subscribeAnnouncement = announcementApi.subscribe

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 모집글 목록 조회 Hook
 * @returns Query 결과 (data?.data에 실제 목록 포함)
 *
 * @example
 * const { data: announcements, refetch } = useGetAnnouncements()
 * announcements?.forEach(item => console.log(item.message))
 */
export const useGetAnnouncements = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.announcements.list,
        queryFn: announcementApi.getAll
    })
    return { data: data?.data, isLoading, error, refetch }
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 뮤테이션 옵션 타입
 */
interface MutationOptions {
    /** 성공 시 콜백 */
    onSuccess?: () => void
    /** 에러 시 콜백 */
    onError?: (error: Error) => void
}

/**
 * 모집글 작성 Hook
 * @param options - 성공/에러 콜백
 */
export const usePostAnnouncement = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: announcementApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.announcements.all
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 모집글 마감 Hook
 * @param options - 성공/에러 콜백
 */
export const useCloseAnnouncement = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: closeAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.announcements.all
            })
            options.onSuccess?.()
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
export const useJoinAnnouncement = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: joinAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.announcements.all
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 모집글 구독 Hook
 * @param options - 성공/에러 콜백
 */
export const useSubscribeAnnouncement = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: subscribeAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.announcements.all
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
