import { useState } from 'react'
import { useCloseMealPlanNearbyFriends } from '@/apis'
import { presentNearbyExposureMissingRequirements } from '@/features/permissions'
import { useNearbyFriendExposureWorkflow } from './useNearbyFriendExposureWorkflow'

const rejectionReasonLabels: Record<string, string> = {
    NOT_FRIEND: '친구 관계 아님',
    BLOCKED: '차단 관계',
    LOCATION_CONSENT_REQUIRED: '위치 동의 없음',
    LOCATION_UNAVAILABLE: '위치 없음',
    OUT_OF_RADIUS: '반경 밖',
    MEAL_SUGGESTION_DISABLED: '식사 제안 수신 꺼짐',
    NOT_HUNGRY: '공복 상태 아님'
}

export function NearbyFriendExposurePanel({ mealPlanId }: { mealPlanId: string }) {
    const [radiusMeters, setRadiusMeters] = useState(1000)
    const {
        eligibility,
        errorMessage,
        lastResult,
        isPreparing,
        startExposure
    } = useNearbyFriendExposureWorkflow(mealPlanId)
    const { mutate: close, isPending: isClosePending } =
        useCloseMealPlanNearbyFriends()
    const missingRequirementCtas =
        presentNearbyExposureMissingRequirements(eligibility)

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
            {eligibility && !eligibility.canExpose && (
                <div className="rounded-16 bg-gray-1 p-12 text-caption-regular text-gray-6">
                    <p className="text-caption-medium text-gray-8">
                        시작 전에 필요한 항목
                    </p>
                    <div className="mt-8 flex flex-col gap-8">
                        {missingRequirementCtas.map(item => (
                            <div
                                key={item.requirement}
                                className="rounded-12 bg-white px-10 py-8">
                                <p className="text-caption-medium text-gray-8">
                                    {item.title}
                                </p>
                                <p className="text-caption-regular text-gray-5">
                                    {item.description}
                                </p>
                                <p className="mt-3 text-caption-medium text-primary-600">
                                    {item.ctaLabel}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {lastResult && (
                <div className="rounded-16 bg-primary-100 border-primary-300 border p-12 text-caption-regular text-gray-7">
                    <p className="text-caption-medium text-gray-8">
                        {lastResult.exposedFriendCount}명의 친구에게 밥약이 노출됐습니다.
                    </p>
                    {lastResult.rejectionSummary.length > 0 && (
                        <p className="mt-4">
                            제외된 친구 {lastResult.rejectedFriendCount}명: {lastResult.rejectionSummary
                                .map(item => `${rejectionReasonLabels[item.reason] ?? item.reason} ${item.count}명`)
                                .join(', ')}
                        </p>
                    )}
                </div>
            )}
            {errorMessage && (
                <div className="rounded-16 bg-red-50 p-12 text-caption-regular text-red-600">
                    {errorMessage}
                </div>
            )}
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
                    disabled={isPreparing}
                    onClick={() => startExposure({ radiusMeters })}
                    className="rounded-30 bg-gray-8 text-body2-medium py-11 text-white disabled:opacity-40">
                    권한 확인 후 시작
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
