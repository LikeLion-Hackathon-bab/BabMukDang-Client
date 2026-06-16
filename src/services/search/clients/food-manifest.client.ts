import type { FoodSearchManifest } from '../types'

export interface FoodManifestClient {
    loadManifest(): Promise<FoodSearchManifest>
}

export class FetchFoodManifestClient implements FoodManifestClient {
    constructor(
        private readonly manifestUrl = '/manifests/food-search-manifest.json'
    ) {}

    async loadManifest(): Promise<FoodSearchManifest> {
        const response = await fetch(this.manifestUrl, {
            cache: 'default'
        })

        if (!response.ok) {
            throw new Error(`FOOD_MANIFEST_LOAD_FAILED:${response.status}`)
        }

        const manifest = (await response.json()) as FoodSearchManifest
        const etag =
            response.headers.get('ETag') ??
            response.headers.get('etag') ??
            undefined

        return manifest
        // {
        //     ...manifest
        //     etag
        // }
    }
}
