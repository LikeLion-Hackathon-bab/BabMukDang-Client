import { useEffect, useMemo, useRef } from 'react'
import { createMealMapSdkAdapter } from '@/features/meal-map/mapSdkAdapter'
import { useMealMapData } from '@/features/meal-map'

export function MealMapSdkCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { mealMap, markerClusters, selectedMarkerId, selectMarker } =
        useMealMapData()
    const adapter = useMemo(() => createMealMapSdkAdapter(), [])

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
    }, [adapter, mealMap, markerClusters, selectedMarkerId, selectMarker])

    if (!mealMap) return null

    return (
        <section className="rounded-24 flex flex-col gap-14 bg-white p-16 shadow-sm">
            <div className="flex items-start justify-between gap-12">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">지도</h2>
                    <p className="text-caption-regular text-gray-5">
                        Kakao Maps SDK가 로드되어 있으면 실제 marker로 렌더링하고, 없으면 동일 adapter 계약의 CSS fallback을 사용합니다.
                    </p>
                </div>
                <span className="rounded-20 bg-primary-100 px-10 py-5 text-caption-medium text-primary-main">
                    {markerClusters.length}개 묶음
                </span>
            </div>
            <div ref={containerRef} data-testid="meal-map-sdk-canvas" />
        </section>
    )
}
