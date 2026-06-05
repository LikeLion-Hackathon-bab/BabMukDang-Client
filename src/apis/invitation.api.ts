/**
 * @fileoverview Invitation(초대) API 모듈
 *
 * 친구 초대 관련 API 함수와 TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 초대 목록 조회
 * const { data: invitations } = useGetInvitations()
 *
 * // 초대 수락
 * const { mutate: accept } = useAcceptInvitation({
 *   onSuccess: () => toast.success('수락 완료')
 * })
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from './client'
import { endpoints } from './endpoints'
import { queryKeys } from './keys'
import type {
    InvitationPostRequest,
    InvitationResponse,
    MutationOptions
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Invitation API 함수 모음
 */
export const invitationApi = {
    /**
     * 초대 목록 조회
     * @returns 초대 목록
     */
    getAll: async (): Promise<InvitationResponse[]> => {
        const response = await client.get(endpoints.invitations.list)
        return response.data
    },

    /**
     * 초대 전송
     * @param data - 초대 데이터 (대상자 ID, 메시지)
     */
    send: async (data: InvitationPostRequest): Promise<void> => {
        const response = await client.post(endpoints.invitations.send, data)
        return response.data
    },

    /**
     * 초대 수락
     * @param invitationId - 초대 ID
     */
    accept: async (invitationId: number): Promise<void> => {
        const response = await client.post(
            endpoints.invitations.accept(invitationId)
        )
        return response.data
    },

    /**
     * 초대 거절
     * @param invitationId - 초대 ID
     */
    reject: async (invitationId: number): Promise<void> => {
        const response = await client.post(
            endpoints.invitations.reject(invitationId)
        )
        return response.data
    }
}

// 하위 호환성을 위한 기존 함수 export
export const getInvitations = invitationApi.getAll
export const sendInvitation = invitationApi.send
export const acceptInvitation = invitationApi.accept
export const rejectInvitation = invitationApi.reject

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 초대 목록 조회 Hook
 * @returns Query 결과
 *
 * @example
 * const { data: invitations } = useGetInvitations()
 */
export const useGetInvitations = () => {
    return useQuery({
        queryKey: queryKeys.invitations.list,
        queryFn: invitationApi.getAll
    })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 초대 전송 Hook
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: sendInvite } = useSendInvitation({
 *   onSuccess: () => toast.success('초대를 보냈습니다.')
 * })
 */
export const useSendInvitation = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: invitationApi.send,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.invitations.all
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
}

/**
 * 초대 수락 Hook
 * @param options - 성공/에러 콜백
 *
 * @example
 * const { mutate: accept } = useAcceptInvitation({
 *   onSuccess: () => {
 *     toast.success('초대를 수락했습니다.')
 *     refetchFriends()
 *   }
 * })
 * accept(invitationId)
 */
export const useAcceptInvitation = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: invitationApi.accept,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.invitations.all
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.friends.all })
            options.onSuccess?.()
        },
        onError: options.onError
    })
}

/**
 * 초대 거절 Hook
 * @param options - 성공/에러 콜백
 */
export const useRejectInvitation = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: invitationApi.reject,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.invitations.all
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
}
