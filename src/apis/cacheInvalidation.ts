import type { QueryClient } from '@tanstack/react-query'
import type {
    CacheInvalidationEvent,
    CacheInvalidationKey
} from '@kimdaegyu/babmukdang-shared/domain'
import { queryKeys } from './keys'

const invalidateByKey = (
    queryClient: QueryClient,
    key: CacheInvalidationKey
) => {
    switch (key) {
        case 'articles':
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
            return
        case 'recruits':
            queryClient.invalidateQueries({ queryKey: queryKeys.recruits.all })
            return
        case 'invitations':
            queryClient.invalidateQueries({
                queryKey: queryKeys.invitations.all
            })
            return
        case 'notifications':
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.all
            })
            return
        case 'meetings':
            queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all })
            return
        case 'friends':
        case 'friendMeals':
            queryClient.invalidateQueries({ queryKey: queryKeys.friends.all })
            return
    }
}

export const invalidateFromCacheEvent = (
    queryClient: QueryClient,
    event: CacheInvalidationEvent
) => {
    for (const key of event.keys) {
        invalidateByKey(queryClient, key)
    }
}
