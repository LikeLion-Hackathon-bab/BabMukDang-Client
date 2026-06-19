import type { MealMapMarker } from '@/apis'

export type MealMapMarkerCluster = {
    clusterId: string
    lat: number
    lng: number
    markers: MealMapMarker[]
    count: number
    primaryMarker: MealMapMarker
    hasOverlap: boolean
}

const GRID_SIZE_DEGREES = 0.0007

const clusterKey = (marker: MealMapMarker) => {
    const latBucket = Math.round(marker.lat / GRID_SIZE_DEGREES)
    const lngBucket = Math.round(marker.lng / GRID_SIZE_DEGREES)
    return `${latBucket}:${lngBucket}`
}

export const clusterMealMapMarkers = (
    markers: MealMapMarker[]
): MealMapMarkerCluster[] => {
    const groups = new Map<string, MealMapMarker[]>()
    for (const marker of markers) {
        const key = clusterKey(marker)
        groups.set(key, [...(groups.get(key) ?? []), marker])
    }

    return [...groups.entries()].map(([key, group]) => {
        const lat =
            group.reduce((sum, marker) => sum + marker.lat, 0) / group.length
        const lng =
            group.reduce((sum, marker) => sum + marker.lng, 0) / group.length
        const sorted = [...group]
            .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
            .reverse()
        const primaryMarker = sorted[0]
        return {
            clusterId: `cluster:${key}`,
            lat,
            lng,
            markers: sorted,
            count: sorted.length,
            primaryMarker,
            hasOverlap: sorted.length > 1
        }
    })
}
