import { useQuery } from '@tanstack/react-query'
import { getFriendMeals } from '../apis/friends'
import { FriendMealFilter } from '../apis/dto'

/**
 * 친구들의 식사 상태를 조회하는 쿼리
 */
export const useFriendMeals = (filter: FriendMealFilter['filter'] = 'ALL') => {
    return useQuery({
        queryKey: ['friends', 'meals', filter],
        queryFn: () => getFriendMeals(filter),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000 // 10분
    })
}

/**
 * 친구들의 식사 상태를 조회하는 쿼리 (필터 없음)
 */
export const useAllFriendMeals = () => {
    return useQuery({
        queryKey: ['friends', 'meals', 'ALL'],
        queryFn: () => getFriendMeals('ALL'),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000 // 10분
    })
}
