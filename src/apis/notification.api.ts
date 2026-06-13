import {
    apiContract,
    type MatchingNotification,
    type RoomAccessResponse,
    NoContent
} from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from './client'
import { domainId } from '@/domain/factories'
import { queryKeys } from './keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MutationOptions } from './types'
const notificationApi = {
    getAll: async (): Promise<MatchingNotification[]> => {
        const res = await contractClient.get(apiContract.notifications.list)
        return res
    },

    accessRoom: async (roomId: string): Promise<RoomAccessResponse> => {
        return contractClient.get(apiContract.room.access, {
            pathParams: { roomId: domainId.room(roomId) }
        })
    },

    markRead: async (notificationId: string): Promise<MatchingNotification> => {
        return contractClient.patch(apiContract.notifications.markRead, {
            pathParams: { notificationId }
        })
    },

    delete: async (notificationId: string): Promise<void> => {
        await contractClient.delete(apiContract.notifications.delete, {
            pathParams: { notificationId }
        })
    }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 알림 조회 Hook
 * @returns Query 결과
 *
 * @example
 * const { data: notifications, refetch } = useGetNotifications()
 * notifications?.forEach(item => console.log(item.message))
 */
export const useGetNotifications = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.notifications.all,
        queryFn: notificationApi.getAll
    })
    return { data, isLoading, error, refetch }
}

/**
 * 방 참여 Hook
 * @param roomId - 참여할 방 ID
 */
export const useAccessRoom = (roomId: string) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.notifications.roomAccess(roomId),
        queryFn: () => notificationApi.accessRoom(roomId)
    })
    return { data, isLoading, error, refetch }
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 알림 읽음 Hook
 *
 */
export const useMarkRead = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: notificationApi.markRead,
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.all
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 알림 삭제 Hook
 * @param options - 성공/에러 콜백
 *
 */
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
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
