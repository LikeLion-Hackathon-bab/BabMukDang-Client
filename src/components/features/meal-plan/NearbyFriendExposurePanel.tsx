import { useState } from 'react'
import {
    useCloseMealPlanNearbyFriends,
    useExposeMealPlanToNearbyFriends
} from '@/apis'

export function NearbyFriendExposurePanel({ mealPlanId }: { mealPlanId: string }) {
    const [radiusMeters, setRadiusMeters] = useState(1000)
    const { mutate: expose, isPending: isExposePending } =
        useExposeMealPlanToNearbyFriends()
    const { mutate: close, isPending: isClosePending } =
        useCloseMealPlanNearbyFriends()

    return (
        <section className="rounded-20 flex flex-col gap-12 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">
                    근처 친구에게 열기
                </h2>
                <p className="text-caption-regular text-gray-5">
                    명시 동의, 친구 관계, 위치 조건, 공복 상태를 만족한 친구에게만 노출됩니다.
                </p>
            </div>
            <label className="flex flex-col gap-6 text-caption-medium text-gray-7">
                노출 반경
                <select
                    className="rounded-12 bg-gray-1 px-12 py-10"
                    value={radiusMeters}
                    onChange={event => setRadiusMeters(Number(event.target.value))}>
                    <option value={500}>500m</option>
                    <option value={1000}>1km</option>
                    <option value={2000}>2km</option>
                    <option value={5000}>5km</option>
                </select>
            </label>
            <div className="grid grid-cols-2 gap-10">
                <button
                    type="button"
                    disabled={isExposePending}
                    onClick={() =>
                        expose({ mealPlanId, body: { radiusMeters } })
                    }
                    className="rounded-30 bg-gray-8 text-body2-medium py-11 text-white disabled:opacity-40">
                    노출 시작
                </button>
                <button
                    type="button"
                    disabled={isClosePending}
                    onClick={() => close(mealPlanId)}
                    className="rounded-30 bg-gray-2 text-body2-medium text-gray-7 py-11 disabled:opacity-40">
                    노출 종료
                </button>
            </div>
        </section>
    )
}
