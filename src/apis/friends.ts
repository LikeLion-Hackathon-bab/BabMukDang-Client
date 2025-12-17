import { client } from './client'
import { FriendMealFilter, FriendMealListResponse } from './dto'

/**
 * 친구들의 식사 상태를 조회합니다.
 * @param filter - 필터 옵션 (기본값: 'ALL')
 * @returns 친구들의 식사 상태 목록
 */
export const getFriendMeals = async (
    filter: FriendMealFilter['filter'] = 'ALL'
): Promise<FriendMealListResponse> => {
    const response = await client.get<FriendMealListResponse>(
        '/api/v1/friends/me/meals',
        {
            params: { filter }
        }
    )
    return response.data
}
