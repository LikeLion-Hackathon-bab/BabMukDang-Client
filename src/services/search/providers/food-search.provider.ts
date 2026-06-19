import { defer, from, switchMap, tap } from 'rxjs'

import { TtlCache } from '../cache/ttl-cache'
import {
    FetchFoodManifestClient,
    type FoodManifestClient
} from '../clients/food-manifest.client'
import type {
    FoodSearchManifest,
    FoodSearchResult,
    SearchProvider,
    SearchProviderInput
} from '../types'

const normalize = (value: string): string => value.trim().toLowerCase()

const includesQuery = (values: string[], query: string): boolean =>
    values.some(value => normalize(value).includes(query))

const searchableValues = (item: FoodSearchResult): string[] => [
    item.code,
    item.label,
    item.parentCategory,
    ...item.aliases,
    ...item.cuisineTags,
    ...item.categoryTags,
    ...item.semanticTags
]

export class FoodSearchProvider implements SearchProvider<FoodSearchResult> {
    readonly domain = 'food' as const
    readonly minQueryLength = 1

    private manifest: FoodSearchManifest | null = null
    private manifestPromise: Promise<FoodSearchManifest> | null = null
    private readonly cache = new TtlCache<string, FoodSearchResult[]>(
        10 * 60 * 1000
    )

    constructor(
        private readonly manifestClient: FoodManifestClient = new FetchFoodManifestClient()
    ) {}

    search(input: SearchProviderInput) {
        const query = normalize(input.query)

        return defer(() => this.loadManifest()).pipe(
            switchMap(manifest => {
                const cacheKey = `${manifest.version}:${manifest.etag ?? ''}:${query}`
                const cached = this.cache.get(cacheKey)

                if (cached) return from(Promise.resolve(cached))

                return from(
                    Promise.resolve(this.searchManifest(manifest, query))
                ).pipe(tap(results => this.cache.set(cacheKey, results)))
            })
        )
    }

    clearCache(): void {
        this.cache.clear()
    }

    private async loadManifest(): Promise<FoodSearchManifest> {
        if (this.manifest) return this.manifest

        if (!this.manifestPromise) {
            this.manifestPromise = this.manifestClient.loadManifest()
        }

        try {
            this.manifest = await this.manifestPromise
            return this.manifest
        } catch (error) {
            this.manifestPromise = null
            throw error
        }
    }

    private searchManifest(
        manifest: FoodSearchManifest,
        normalizedQuery: string
    ): FoodSearchResult[] {
        return manifest.items
            .filter(item => item.searchable)
            .filter(item =>
                includesQuery(searchableValues(item), normalizedQuery)
            )
            .sort((left, right) => {
                const recommendableDelta =
                    Number(right.recommendable) - Number(left.recommendable)
                if (recommendableDelta !== 0) return recommendableDelta

                return (right.popularity ?? 0) - (left.popularity ?? 0)
            })
    }
}
