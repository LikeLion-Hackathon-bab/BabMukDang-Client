import { describe, expect, it } from 'vitest'
import { clusterMealMapMarkers } from './mealMapCluster'
import type { MealMapMarker } from '@/apis'

const marker = (markerId: string, lat: number, lng: number): MealMapMarker => ({
    markerId,
    layer: 'FRIEND_RECORD_LOCATION',
    lat,
    lng,
    title: markerId,
    subtitle: null,
    href: null,
    mealPlanId: null,
    articleId: null,
    restaurant: null,
    distanceMeters: null,
    updatedAt: '2026-06-17T00:00:00.000Z',
    metadata: {
        authorId: null,
        authorName: '친구',
        imageUrl: null,
        mealDate: '2026-06-17'
    }
})

describe('clusterMealMapMarkers', () => {
    it('nearby markers into a single overlap cluster', () => {
        const clusters = clusterMealMapMarkers([
            marker('a', 37.5, 127.0),
            marker('b', 37.50001, 127.00001)
        ])

        expect(clusters).toHaveLength(1)
        expect(clusters[0].count).toBe(2)
        expect(clusters[0].hasOverlap).toBe(true)
    })
})
