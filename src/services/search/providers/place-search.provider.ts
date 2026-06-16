import { defer, of } from 'rxjs'
import { tap } from 'rxjs/operators'

import { TtlCache } from '../cache/ttl-cache'
import { KakaoPlaceSearchClient, type PlaceSearchClient } from '../clients/kakao-place-search.client'
import type { PlaceSearchResult, SearchContext, SearchProvider, SearchProviderInput } from '../types'

const normalizeQuery = (query: string): string => query.trim().toLowerCase()

const toGridKey = (context?: SearchContext): string => {
    if (context?.latitude === undefined || context.longitude === undefined) {
        return 'no-location'
    }

    const latGrid = Math.round(context.latitude * 100) / 100
    const lngGrid = Math.round(context.longitude * 100) / 100
    const radius = context.radius ?? 'default'
    const sort = context.sort ?? 'distance'

    return `${latGrid}:${lngGrid}:${radius}:${sort}`
}

export class PlaceSearchProvider implements SearchProvider<PlaceSearchResult> {
    readonly domain = 'place' as const
    readonly minQueryLength = 2

    private readonly cache: TtlCache<string, PlaceSearchResult[]>

    constructor(
        private readonly client: PlaceSearchClient = new KakaoPlaceSearchClient(),
        cacheTtlMs = 2 * 60 * 1000
    ) {
        this.cache = new TtlCache<string, PlaceSearchResult[]>(cacheTtlMs)
    }

    search(input: SearchProviderInput) {
        const query = normalizeQuery(input.query)
        const cacheKey = `${query}:${toGridKey(input.context)}`
        const cached = this.cache.get(cacheKey)

        if (cached) return of(cached)

        return defer(() => this.client.searchPlaces(query, input.context)).pipe(
            tap(results => this.cache.set(cacheKey, results))
        )
    }

    clearCache(): void {
        this.cache.clear()
    }
}
