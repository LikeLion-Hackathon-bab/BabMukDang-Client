import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { contractClient } from '@/apis/client'
import type { FriendSearchResult } from '../types'

export interface FriendSearchClient {
    searchFriends(query: string): Promise<FriendSearchResult[]>
}

const toFriendSearchResult = (value: unknown): FriendSearchResult => {
    const item = value as Record<string, unknown>
    const memberId = item.memberId ?? item.friendId ?? item.userId ?? item.id
    const nickname = item.nickname ?? item.username ?? item.name ?? item.handle

    return {
        friendId: (item.friendId ?? item.friendshipId) as number | string | undefined,
        memberId: memberId as number | string,
        nickname: String(nickname ?? ''),
        profileImageUrl: (item.profileImageUrl ?? item.profileImage) as string | null | undefined,
        handle: item.handle as string | null | undefined,
        friendStatus: (item.friendStatus ?? item.status) as string | null | undefined,
        isBlocked: item.isBlocked as boolean | undefined,
        isFriend: item.isFriend as boolean | undefined,
        canInviteToMealPlan: item.canInviteToMealPlan as boolean | undefined,
        raw: value
    }
}

export class ContractFriendSearchClient implements FriendSearchClient {
    async searchFriends(query: string): Promise<FriendSearchResult[]> {
        const response = await contractClient.get(apiContract.friends.search, {
            query: { username: query }
        })

        return (response as unknown[]).map(toFriendSearchResult).filter(item => item.nickname)
    }
}
