import { useEffect, useMemo, useRef } from 'react'
import { createMealMapSdkAdapter } from '@/features/meal-map/mapSdkAdapter'
import { useMealMapData } from '@/features/meal-map'
import { useKakaoMap } from '@/hooks'

export function MealMapSdkCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { mealMap, markerClusters, selectedMarkerId, selectMarker } =
        useMealMapData()
    const adapter = useMemo(() => createMealMapSdkAdapter(), [])
    const { isLoaded: isKakaoMapLoaded } = useKakaoMap()

    useEffect(() => {
        const container = containerRef.current
        if (!container || !mealMap) return undefined
        return adapter.render({
            container,
            center: mealMap.center,
            clusters: markerClusters,
            selectedMarkerId,
            onSelectMarker: selectMarker
        })
    }, [
        adapter,
        isKakaoMapLoaded,
        mealMap,
        markerClusters,
        selectedMarkerId,
        selectMarker
    ])

    if (!mealMap) return null

    return (
        <section className="rounded-24 flex flex-col gap-14 bg-white p-16 shadow-sm">
            <div className="flex items-start justify-between gap-12">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">지도</h2>
                </div>
                <span className="rounded-20 bg-primary-100 text-caption-medium text-primary-main px-10 py-5">
                    {markerClusters.length}개 묶음
                </span>
            </div>
            <div
                ref={containerRef}
                data-testid="meal-map-sdk-canvas"
                className="rounded-24 border-gray-2 bg-gray-1 h-[320px] min-h-[320px] w-full overflow-hidden border"
            />
        </section>
    )
}
