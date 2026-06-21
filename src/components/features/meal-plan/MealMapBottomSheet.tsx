import { Link } from '@/navigation'
import type { MealMapMarker } from '@/apis'
import { useMealMapData } from '@/features/meal-map'
import { RestaurantCandidateActions } from './RestaurantCandidateActions'

const layerTitle: Record<MealMapMarker['layer'], string> = {
    MY_MEAL_PLAN_PLACE: '내 밥약 장소',
    NEARBY_FRIEND_MEAL_PLAN: '근처 친구 밥약',
    FRIEND_RECORD_LOCATION: '친구 기록 위치',
    RESTAURANT_CANDIDATE: '식당 후보'
}

export function MealMapBottomSheet({
    title,
    markers,
    emptyMessage
}: {
    title: string
    markers: MealMapMarker[]
    emptyMessage: string
}) {
    const { selectedMarkerId, selectMarker, registerMarkerElement } = useMealMapData()

    return (
        <section className="flex flex-col gap-12">
            <h2 className="text-body1-semibold text-gray-8">{title}</h2>
            {markers.length > 0 ? (
                <div className="flex flex-col gap-10">
                    {markers.map(marker => {
                        const selected = marker.markerId === selectedMarkerId
                        return (
                            <article
                                key={marker.markerId}
                                ref={element => registerMarkerElement(marker.markerId, element)}
                                tabIndex={0}
                                onFocus={() => selectMarker(marker.markerId)}
                                onMouseEnter={() => selectMarker(marker.markerId)}
                                onClick={() => selectMarker(marker.markerId)}
                                className={`rounded-20 flex flex-col gap-6 bg-white p-16 shadow-sm outline-none transition ${
                                    selected
                                        ? 'ring-primary-main ring-2'
                                        : 'ring-1 ring-transparent'
                                }`}>
                                <div className="flex items-start justify-between gap-12">
                                    <div className="min-w-0">
                                        <span className="text-caption-medium text-primary-main">
                                            {layerTitle[marker.layer]}
                                        </span>
                                        <h3 className="text-body1-semibold text-gray-8 line-clamp-2">
                                            {marker.title}
                                        </h3>
                                    </div>
                                    {marker.distanceMeters != null && (
                                        <span className="rounded-20 bg-primary-100 px-10 py-5 text-caption-medium text-primary-main">
                                            {marker.distanceMeters}m
                                        </span>
                                    )}
                                </div>
                                {marker.subtitle && (
                                    <p className="text-caption-regular text-gray-5">
                                        {marker.subtitle}
                                    </p>
                                )}
                                <RestaurantCandidateActions marker={marker} />
                                {marker.href && marker.layer !== 'RESTAURANT_CANDIDATE' && (
                                    <Link
                                        to={marker.href}
                                        className="mt-4 rounded-20 border border-gray-3 px-12 py-7 text-center text-caption-medium text-gray-7">
                                        자세히 보기
                                    </Link>
                                )}
                            </article>
                        )
                    })}
                </div>
            ) : (
                <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                    {emptyMessage}
                </div>
            )}
        </section>
    )
}
