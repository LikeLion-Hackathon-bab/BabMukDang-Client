import { defer, of } from 'rxjs'
import { tap } from 'rxjs/operators'

import { TtlCache } from '../cache/ttl-cache'
import { ContractFriendSearchClient, type FriendSearchClient } from '../clients/friend-search.client'
import type { FriendSearchResult, SearchProvider, SearchProviderInput } from '../types'

const normalizeQuery = (query: string): string => query.trim().toLowerCase()

export class FriendSearchProvider implements SearchProvider<FriendSearchResult> {
    readonly domain = 'friend' as const
    readonly minQueryLength = 1

    private readonly cache: TtlCache<string, FriendSearchResult[]>

    constructor(
        private readonly client: FriendSearchClient = new ContractFriendSearchClient(),
        cacheTtlMs = 30 * 1000
    ) {
        this.cache = new TtlCache<string, FriendSearchResult[]>(cacheTtlMs)
    }

    search(input: SearchProviderInput) {
        const query = normalizeQuery(input.query)
        const userScope = input.context?.userId ?? 'anonymous'
        const cacheKey = `${userScope}:${query}`
        const cached = this.cache.get(cacheKey)

        if (cached) return of(cached)

        return defer(() => this.client.searchFriends(query)).pipe(
            tap(results => this.cache.set(cacheKey, results))
        )
    }

    clearCache(): void {
        this.cache.clear()
    }
}
