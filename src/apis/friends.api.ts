/**
 * @fileoverview Friends(친구) API 모듈
 *
 * 친구 식사 상태, 친구 목록/검색/삭제, 차단, 친구 요청 관련 API 함수와
 * TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 친구들의 식사 상태 조회
 * const { data: friendMeals } = useFriendMeals()
 *
 * // 친구 목록 조회
 * const { data: friends } = useFriends()
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client } from './client'
import { endpoints } from './endpoints'
import { queryKeys } from './keys'
import type {
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealFilter,
    FriendMealListResponse,
    FriendRequestItemResponse,
    MutationOptions
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Friends API 함수 모음
 */
export const friendsApi = {
    /**
     * 친구들의 식사 상태 조회
     * @param filter - 필터 옵션 (기본값: 'ALL')
     * @returns 친구들의 식사 상태 목록
     */
    getMeals: async (
        filter: FriendMealFilter['filter'] = 'ALL'
    ): Promise<FriendMealListResponse> => {
        const response = await client.get<FriendMealListResponse>(
            endpoints.friends.meals,
            { params: { filter } }
        )
        return response.data
    },

    /**
     * 내 친구 목록 조회
     */
    getFriends: async (): Promise<FriendListItemResponse[]> => {
        const res = await client.get<FriendListItemResponse[]>(
            endpoints.friends.list
        )
        return res.data
    },

    /**
     * 내 친구 검색
     * @param keyword - 검색 키워드
     */
    searchFriends: async (
        keyword: string
    ): Promise<FriendListItemResponse[]> => {
        const res = await client.get<FriendListItemResponse[]>(
            endpoints.friends.search,
            { params: { keyword } }
        )
        return res.data
    },

    /**
     * 친구 삭제
     * @param memberId - 멤버 ID
     */
    removeFriend: async (memberId: number): Promise<void> => {
        await client.delete(endpoints.friends.remove(memberId))
    },

    /**
     * 차단 목록 조회
     */
    getBlocks: async (): Promise<FriendBlockItemResponse[]> => {
        const res = await client.get<FriendBlockItemResponse[]>(
            endpoints.friends.blocks
        )
        return res.data
    },

    /**
     * 멤버 차단
     * @param memberId - 멤버 ID
     */
    blockMember: async (memberId: number): Promise<void> => {
        await client.post(endpoints.friends.block(memberId))
    },

    /**
     * 멤버 차단 해제
     * @param memberId - 멤버 ID
     */
    unblockMember: async (memberId: number): Promise<void> => {
        await client.delete(endpoints.friends.unblock(memberId))
    },

    /**
     * 받은 친구 요청 목록
     */
    getIncomingRequests: async (): Promise<FriendRequestItemResponse[]> => {
        const res = await client.get<FriendRequestItemResponse[]>(
            endpoints.friends.requestsIncoming
        )
        return res.data
    },

    /**
     * 보낸 친구 요청 목록
     */
    getOutgoingRequests: async (): Promise<FriendRequestItemResponse[]> => {
        const res = await client.get<FriendRequestItemResponse[]>(
            endpoints.friends.requestsOutgoing
        )
        return res.data
    },

    /**
     * 친구 요청 생성
     * @param memberId - 요청 대상 멤버 ID
     */
    sendRequest: async (
        memberId: number
    ): Promise<FriendRequestItemResponse> => {
        const res = await client.post<FriendRequestItemResponse>(
            endpoints.friends.sendRequest(memberId)
        )
        return res.data
    },

    /**
     * 친구 요청 수락
     * @param requestId - 요청 ID
     */
    acceptRequest: async (
        requestId: number
    ): Promise<FriendRequestItemResponse> => {
        const res = await client.post<FriendRequestItemResponse>(
            endpoints.friends.acceptRequest(requestId)
        )
        return res.data
    },

    /**
     * 친구 요청 거절
     * @param requestId - 요청 ID
     */
    rejectRequest: async (
        requestId: number
    ): Promise<FriendRequestItemResponse> => {
        const res = await client.post<FriendRequestItemResponse>(
            endpoints.friends.rejectRequest(requestId)
        )
        return res.data
    },

    /**
     * 친구 요청 취소
     * @param requestId - 요청 ID
     */
    cancelRequest: async (requestId: number): Promise<void> => {
        await client.delete(endpoints.friends.cancelRequest(requestId))
    }
}

// 하위 호환성을 위한 기존 함수 export
export const getFriendMeals = friendsApi.getMeals

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 친구들의 식사 상태 조회 Hook
 * @param filter - 필터 옵션 (기본값: 'ALL')
 */
export const useFriendMeals = (filter: FriendMealFilter['filter'] = 'ALL') => {
    return useQuery({
        queryKey: queryKeys.friends.meals(filter),
        queryFn: () => friendsApi.getMeals(filter),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })
}

/**
 * 모든 친구들의 식사 상태 조회 Hook
 */
export const useAllFriendMeals = () => {
    return useQuery({
        queryKey: queryKeys.friends.meals('ALL'),
        queryFn: () => friendsApi.getMeals('ALL'),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })
}

/**
 * 내 친구 목록 조회 Hook
 */
export const useFriends = () => {
    return useQuery({
        queryKey: queryKeys.friends.list,
        queryFn: friendsApi.getFriends
    })
}

/**
 * 내 친구 검색 Hook
 * @param keyword - 검색 키워드 (빈 문자열이면 비활성화)
 */
export const useSearchFriends = (keyword: string) => {
    return useQuery({
        queryKey: queryKeys.friends.search(keyword),
        queryFn: () => friendsApi.searchFriends(keyword),
        enabled: keyword.trim().length > 0
    })
}

/**
 * 차단 목록 조회 Hook
 */
export const useBlockedMembers = () => {
    return useQuery({
        queryKey: queryKeys.friends.blocks,
        queryFn: friendsApi.getBlocks
    })
}

/**
 * 받은 친구 요청 목록 Hook
 */
export const useIncomingFriendRequests = () => {
    return useQuery({
        queryKey: queryKeys.friends.requestsIncoming,
        queryFn: friendsApi.getIncomingRequests
    })
}

/**
 * 보낸 친구 요청 목록 Hook
 */
export const useOutgoingFriendRequests = () => {
    return useQuery({
        queryKey: queryKeys.friends.requestsOutgoing,
        queryFn: friendsApi.getOutgoingRequests
    })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 친구 관계 변화 시 함께 갱신해야 하는 query 묶음을 무효화한다.
 * (친구/친구 식사 상태/초대/게시글/모집글)
 */
const invalidateFriendGraph = (
    queryClient: ReturnType<typeof useQueryClient>
) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.friends.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all })
}

/**
 * 친구 요청 생성 Hook
 */
export const useSendFriendRequest = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.sendRequest(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.friends.requestsOutgoing
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 요청 수락 Hook
 * 수락 성공 시 friends/friend meals/invitations/articles/recruits를 무효화한다.
 */
export const useAcceptFriendRequest = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (requestId: number) => friendsApi.acceptRequest(requestId),
        onSuccess: () => {
            invalidateFriendGraph(queryClient)
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 요청 거절 Hook
 */
export const useRejectFriendRequest = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (requestId: number) => friendsApi.rejectRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.friends.requestsIncoming
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 요청 취소 Hook
 */
export const useCancelFriendRequest = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (requestId: number) => friendsApi.cancelRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.friends.requestsOutgoing
            })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 멤버 차단 Hook
 * 차단 성공 시 친구 graph 묶음을 무효화한다.
 */
export const useBlockMember = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.blockMember(memberId),
        onSuccess: () => {
            invalidateFriendGraph(queryClient)
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 멤버 차단 해제 Hook
 */
export const useUnblockMember = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.unblockMember(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends.all })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 삭제 Hook
 */
export const useRemoveFriend = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.removeFriend(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends.all })
            options.onSuccess?.()
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
