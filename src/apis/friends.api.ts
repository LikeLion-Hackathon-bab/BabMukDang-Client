/**
 * @fileoverview Friends(친구) API 모듈
 *
 * 친구 관련 API 함수와 TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 친구들의 식사 상태 조회
 * const { data: friendMeals } = useFriendMeals()
 */

import { useQuery } from '@tanstack/react-query'
import { client } from './client'
import { endpoints } from './endpoints'
import { queryKeys } from './keys'
import type { FriendMealFilter, FriendMealListResponse } from './types'

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
 * @returns Query 결과
 *
 * @example
 * const { data: friends } = useFriendMeals('ALL')
 * friends?.forEach(friend => {
 *   console.log(friend.userName, friend.hungry ? '배고픔' : '배부름')
 * })
 */
export const useFriendMeals = (filter: FriendMealFilter['filter'] = 'ALL') => {
    return useQuery({
        queryKey: queryKeys.friends.meals(filter),
        queryFn: () => friendsApi.getMeals(filter),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000 // 10분
    })
}

/**
 * 모든 친구들의 식사 상태 조회 Hook
 * @returns Query 결과
 *
 * @example
 * const { data: allFriends } = useAllFriendMeals()
 */
export const useAllFriendMeals = () => {
    return useQuery({
        queryKey: queryKeys.friends.meals('ALL'),
        queryFn: () => friendsApi.getMeals('ALL'),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000 // 10분
    })
}
