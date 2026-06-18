import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    useGetLocationSettings,
    useNearbyFriendMealPlans,
    useRequestJoinMealPlan,
    useUpdateMemberLocation
} from '@/apis'
import {
    MealMapBottomSheet,
    MealMapSdkCanvas
} from '@/components/features/meal-plan'
import { LocationSyncService, permissionAdapter } from '@/features/permissions'
import { MealMapDataProvider, useMealMapData } from '@/features/meal-map'

const friendRecordDayOptions = [7, 14, 30] as const

const joinRequestLabel = (status: string | null | undefined) => {
    if (status === 'PENDING') return '요청 중'
    if (status === 'ACCEPTED') return '참여 완료'
    if (status === 'REJECTED') return '거절됨'
    if (status === 'CANCELLED') return '취소됨'
    return '참여 요청'
}

export function MealMapPage() {
    const [friendRecordDays, setFriendRecordDays] = useState<number>(7)

    return (
        <MealMapDataProvider query={{ friendRecordDays }}>
            <MealMapContent
                friendRecordDays={friendRecordDays}
                onChangeFriendRecordDays={setFriendRecordDays}
            />
        </MealMapDataProvider>
    )
}

function MealMapContent({
    friendRecordDays,
    onChangeFriendRecordDays
}: {
    friendRecordDays: number
    onChangeFriendRecordDays: (days: number) => void
}) {
    const { mealMap, layers, allMarkers, isLoading, error, refetch } =
        useMealMapData()
    const { data: nearbyFriendMealPlans } = useNearbyFriendMealPlans()
    const { data: locationSettings, refetch: refetchLocationSettings } =
        useGetLocationSettings()
    const { mutateAsync: updateMemberLocationAsync } = useUpdateMemberLocation()
    const locationSyncService = useMemo(
        () => new LocationSyncService(permissionAdapter),
        []
    )
    const { mutate: requestJoin, isPending: isRequesting } =
        useRequestJoinMealPlan()

    useEffect(() => {
        if (!locationSettings) return
        void locationSyncService
            .syncIfNeeded({
                settings: locationSettings,
                updateLocation: updateMemberLocationAsync
            })
            .then(result => {
                if (result.refreshed) {
                    void refetchLocationSettings()
                    refetch()
                }
            })
    }, [
        locationSettings,
        locationSyncService,
        refetch,
        refetchLocationSettings,
        updateMemberLocationAsync
    ])

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-24 bg-primary-100 border-primary-300 border p-18">
                <h1 className="text-title2-semibold text-gray-8">
                    친구 기반 밥지도
                </h1>
                <p className="text-body2-medium text-gray-6">
                    공개 모집 지도가 아니라 내 밥약 장소, 근처 친구 밥약, 친구
                    기록 위치, 식당 후보를 함께 보여줍니다.
                </p>
                {mealMap && (
                    <p className="text-caption-regular text-gray-5 mt-8">
                        중심 좌표 {mealMap.center.lat.toFixed(4)},{' '}
                        {mealMap.center.lng.toFixed(4)} · {allMarkers.length}개
                        표시
                    </p>
                )}
            </section>

            <section className="rounded-20 flex flex-col gap-10 bg-white p-16">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">
                        친구 기록 기간
                    </h2>
                    <p className="text-caption-regular text-gray-5">
                        지도에 표시할 친구 기록 위치 기간을 선택합니다.
                    </p>
                </div>
                <div className="flex gap-8">
                    {friendRecordDayOptions.map(days => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => onChangeFriendRecordDays(days)}
                            className={`rounded-24 px-14 py-8 text-caption-medium ${
                                friendRecordDays === days
                                    ? 'bg-gray-8 text-white'
                                    : 'bg-gray-1 text-gray-6'
                            }`}>
                            최근 {days}일
                        </button>
                    ))}
                </div>
            </section>

            {isLoading ? (
                <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                    밥지도 데이터를 불러오는 중입니다.
                </div>
            ) : error ? (
                <div className="rounded-20 bg-white p-16 text-caption-regular text-red-500">
                    밥지도 데이터를 불러오지 못했습니다.
                </div>
            ) : layers ? (
                <>
                    <MealMapSdkCanvas />
                    <MealMapBottomSheet
                        title="내 밥약 장소"
                        markers={layers.myMealPlanPlaces}
                        emptyMessage="표시할 내 밥약 장소가 없습니다."
                    />
                    <MealMapBottomSheet
                        title="식당 후보"
                        markers={layers.restaurantCandidates}
                        emptyMessage="아직 지도에 표시할 식당 후보가 없습니다."
                    />
                    <MealMapBottomSheet
                        title="친구 기록 위치"
                        markers={layers.friendRecordLocations}
                        emptyMessage="최근 친구 기록 위치가 없습니다."
                    />
                </>
            ) : null}

            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">
                    근처 친구 밥약
                </h2>
                {nearbyFriendMealPlans?.length ? (
                    <div className="flex flex-col gap-10">
                        {nearbyFriendMealPlans.map(mealPlan => (
                            <article
                                key={mealPlan.mealPlanId}
                                className="rounded-20 flex flex-col gap-10 bg-white p-16">
                                <Link to={`/meal-plans/${mealPlan.mealPlanId}`}>
                                    <span className="text-body1-semibold text-gray-8">
                                        {mealPlan.title}
                                    </span>
                                    <p className="text-caption-regular text-gray-5">
                                        {mealPlan.owner.username} ·{' '}
                                        {mealPlan.distanceMeters}m ·{' '}
                                        {mealPlan.participantCount}명
                                    </p>
                                </Link>
                                <button
                                    type="button"
                                    disabled={
                                        isRequesting ||
                                        mealPlan.joinRequestStatus ===
                                            'PENDING' ||
                                        mealPlan.joinRequestStatus ===
                                            'ACCEPTED'
                                    }
                                    onClick={() =>
                                        requestJoin({
                                            mealPlanId: mealPlan.mealPlanId,
                                            body: { message: '' }
                                        })
                                    }
                                    className="rounded-24 bg-gray-8 px-14 py-9 text-caption-medium text-white disabled:bg-gray-3 disabled:text-gray-5">
                                    {joinRequestLabel(
                                        mealPlan.joinRequestStatus
                                    )}
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                        현재 노출된 친구 밥약이 없습니다.
                    </div>
                )}
            </section>
        </div>
    )
}
