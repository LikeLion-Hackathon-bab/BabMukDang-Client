import { FOOD_CODE_MANIFEST_PATH } from '@kimdaegyu/babmukdang-shared/domain/food'
import type { FoodSearchManifest } from '../types'

export interface FoodManifestClient {
    loadManifest(): Promise<FoodSearchManifest>
}

export class FetchFoodManifestClient implements FoodManifestClient {
    constructor(private readonly manifestUrl = FOOD_CODE_MANIFEST_PATH) {}

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
            manifest.etag

        return {
            ...manifest,
            etag
        }
    }
}
