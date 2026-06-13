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
import { contractClient } from './client'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { domainId } from '@/domain/factories'
import { queryKeys } from './keys'
import type {
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealFilter,
    FriendMealListResponse,
    FriendRequestItemResponse,
    MutationOptions,
    NoContent
} from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Friends API 함수 모음
 */

const friendsApi = {
    getMeals: async (filter: FriendMealFilter['filter'] = 'ALL') => {
        return contractClient.get(apiContract.mealStatus.friendMealStatus, {
            query: { status: filter }
        })
    },

    getFriends: async () => {
        return contractClient.get(apiContract.friends.list)
    },

    searchFriends: async (keyword: string) => {
        return contractClient.get(apiContract.members.search, {
            query: { username: keyword }
        })
    },

    removeFriend: async (memberId: number) => {
        return contractClient.delete(apiContract.friends.unfriend, {
            pathParams: { memberId: domainId.member(memberId) }
        })
    },

    getBlocks: async () => {
        return contractClient.get(apiContract.friends.blockList)
    },

    blockMember: async (memberId: number) => {
        return contractClient.post(apiContract.friends.block, {
            pathParams: { memberId: domainId.member(memberId) }
        })
    },

    unblockMember: async (memberId: number): Promise<NoContent> => {
        return contractClient.delete(apiContract.friends.unblock, {
            pathParams: { memberId: domainId.member(memberId) }
        })
    },

    getIncomingRequests: async () => {
        return contractClient.get(apiContract.friends.incomingRequest)
    },

    getOutgoingRequests: async () => {
        return contractClient.get(apiContract.friends.outgoingRequest)
    },

    sendRequest: async (memberId: number): Promise<NoContent> => {
        return contractClient.post(apiContract.friends.sendRequest, {
            pathParams: { memberId: domainId.member(memberId) }
        })
    },

    acceptRequest: async (requestId: number) => {
        return contractClient.post(apiContract.friends.acceptRequest, {
            pathParams: { requestId: domainId.friendRequest(requestId) }
        })
    },

    rejectRequest: async (requestId: number) => {
        return contractClient.post(apiContract.friends.rejectRequest, {
            pathParams: { requestId: domainId.friendRequest(requestId) }
        })
    },

    cancelRequest: async (requestId: number) => {
        return contractClient.delete(apiContract.friends.cancelRequest, {
            pathParams: { requestId: domainId.friendRequest(requestId) }
        })
    }
}

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
    queryClient.invalidateQueries({ queryKey: queryKeys.recruits.all })
}

/**
 * 친구 요청 생성 Hook
 */
export const useSendFriendRequest = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.sendRequest(memberId),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.friends.requestsOutgoing
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 요청 수락 Hook
 * 수락 성공 시 friends/friend meals/invitations/articles/recruits를 무효화한다.
 */
export const useAcceptFriendRequest = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (requestId: number) => friendsApi.acceptRequest(requestId),
        onSuccess: data => {
            invalidateFriendGraph(queryClient)
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 요청 거절 Hook
 */
export const useRejectFriendRequest = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (requestId: number) => friendsApi.rejectRequest(requestId),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.friends.requestsIncoming
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 요청 취소 Hook
 */
export const useCancelFriendRequest = (
    options: MutationOptions<NoContent> = {}
) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (requestId: number) => friendsApi.cancelRequest(requestId),
        onSuccess: data => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.friends.requestsOutgoing
            })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 멤버 차단 Hook
 * 차단 성공 시 친구 graph 묶음을 무효화한다.
 */
export const useBlockMember = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.blockMember(memberId),
        onSuccess: data => {
            invalidateFriendGraph(queryClient)
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 멤버 차단 해제 Hook
 */
export const useUnblockMember = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.unblockMember(memberId),
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends.all })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}

/**
 * 친구 삭제 Hook
 */
export const useRemoveFriend = (options: MutationOptions<NoContent> = {}) => {
    const queryClient = useQueryClient()
    const { mutate, isPending, error } = useMutation({
        mutationFn: (memberId: number) => friendsApi.removeFriend(memberId),
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends.all })
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
    return { mutate, isPending, error }
}
