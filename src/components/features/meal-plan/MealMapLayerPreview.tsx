import type { MealMapMarker } from '@/apis'
import { useMealMapData } from '@/features/meal-map'

const layerBadge: Record<MealMapMarker['layer'], string> = {
    MY_MEAL_PLAN_PLACE: '내 밥약',
    NEARBY_FRIEND_MEAL_PLAN: '근처 친구',
    FRIEND_RECORD_LOCATION: '친구 기록',
    RESTAURANT_CANDIDATE: '식당 후보'
}

export function MealMapLayerPreview() {
    const { allMarkers, selectedMarkerId, selectedMarker, selectMarker, mealMap } =
        useMealMapData()

    if (!mealMap) return null

    return (
        <section className="rounded-24 flex flex-col gap-14 bg-white p-16 shadow-sm">
            <div className="flex items-start justify-between gap-12">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">지도 레이어</h2>
                    <p className="text-caption-regular text-gray-5">
                        실제 지도 SDK marker와 bottom sheet가 같은 selectedMarkerId를 공유하도록 구성했습니다.
                    </p>
                </div>
                <span className="rounded-20 bg-primary-100 px-10 py-5 text-caption-medium text-primary-main">
                    {allMarkers.length}개
                </span>
            </div>

            <div className="bg-gray-1 border-gray-2 relative min-h-[220px] overflow-hidden rounded-24 border p-14">
                <div className="absolute right-12 top-12 rounded-20 bg-white/90 px-10 py-5 text-caption-medium text-gray-6 shadow-sm">
                    중심 {mealMap.center.lat.toFixed(4)}, {mealMap.center.lng.toFixed(4)}
                </div>
                <div className="grid grid-cols-2 gap-8 pt-34">
                    {allMarkers.map(marker => {
                        const selected = marker.markerId === selectedMarkerId
                        return (
                            <button
                                key={marker.markerId}
                                type="button"
                                onClick={() => selectMarker(marker.markerId)}
                                className={`rounded-18 border p-10 text-left transition ${
                                    selected
                                        ? 'border-primary-main bg-primary-100 shadow-sm'
                                        : 'border-gray-2 bg-white'
                                }`}>
                                <span className="text-caption-medium text-primary-main">
                                    {layerBadge[marker.layer]}
                                </span>
                                <p className="text-caption-medium text-gray-8 line-clamp-2">
                                    {marker.title}
                                </p>
                                <p className="text-caption-regular text-gray-5">
                                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {selectedMarker && (
                <div className="rounded-18 bg-primary-100 p-12">
                    <p className="text-caption-medium text-primary-main">선택된 marker</p>
                    <p className="text-body2-semibold text-gray-8">{selectedMarker.title}</p>
                    {selectedMarker.subtitle && (
                        <p className="text-caption-regular text-gray-6">
                            {selectedMarker.subtitle}
                        </p>
                    )}
                </div>
            )}
        </section>
    )
}
