import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMealPlanDetail } from '@/apis'
import { MealGroupCreateFromMealPlanButton } from '@/components/features/meal-group'

export function MealPlanRecordEntryPage() {
    const { mealPlanId = '' } = useParams<{ mealPlanId: string }>()
    const { data, isLoading, error } = useMealPlanDetail(mealPlanId, {
        enabled: Boolean(mealPlanId)
    })
    const canRecord = Boolean(data?.viewerPermissions?.canRecordMealPlan)
    const alreadyRecorded = data?.status === 'RECORDED'

    if (isLoading) {
        return (
            <div className="py-40 text-center text-gray-5">
                기록할 밥약을 불러오는 중입니다.
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="py-40 text-center text-red-500">
                기록할 밥약을 불러오지 못했습니다.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-24 bg-primary-100 border-primary-300 flex flex-col gap-10 border p-18">
                <span className="text-caption-medium text-primary-main">
                    MealPlan 기록 연결
                </span>
                <h1 className="text-title2-semibold text-gray-8">
                    {data.title ?? '밥약'}을 기록으로 남길까요?
                </h1>
                <p className="text-body2-medium text-gray-6">
                    기록이 생성되면 MealPlan은 RECORDED 상태로 전환되고, 기록
                    완료 후 내 밥약의 지난 밥약 목록으로 이동합니다.
                </p>
                <div className="rounded-16 bg-white p-12 text-caption-regular text-gray-6">
                    현재 상태:{' '}
                    <strong className="text-gray-8">{data.status}</strong>
                </div>
            </section>

            {data.status === 'RECORDED' && (
                <MealGroupCreateFromMealPlanButton mealPlan={data} />
            )}

            {alreadyRecorded ? (
                <section className="rounded-20 bg-white p-16">
                    <h2 className="text-body1-semibold text-gray-8">
                        이미 기록된 밥약입니다.
                    </h2>
                    <p className="mt-6 text-caption-regular text-gray-5">
                        이 밥약은 기록 완료 상태입니다. 밥약 상세에서 기록
                        내용을 확인해 주세요.
                    </p>
                    <Link
                        to={`/meal-plans/${mealPlanId}`}
                        className="rounded-30 bg-gray-8 text-body1-semibold mt-14 flex justify-center py-12 text-white">
                        밥약으로 돌아가기
                    </Link>
                </section>
            ) : canRecord ? (
                <Link
                    to={`/upload?mealPlanId=${mealPlanId}`}
                    className="rounded-30 bg-gray-8 text-body1-semibold flex justify-center py-14 text-white">
                    사진 업로드로 이동
                </Link>
            ) : (
                <section className="rounded-20 bg-white p-16">
                    <h2 className="text-body1-semibold text-gray-8">
                        아직 기록할 수 없습니다.
                    </h2>
                    <p className="mt-6 text-caption-regular text-gray-5">
                        MealPlan이 COMPLETED 상태가 된 뒤 기록을 작성할 수
                        있습니다.
                    </p>
                    <Link
                        to={`/meal-plans/${mealPlanId}`}
                        className="rounded-30 bg-gray-8 text-body1-semibold mt-14 flex justify-center py-12 text-white">
                        밥약으로 돌아가기
                    </Link>
                </section>
            )}
        </div>
    )
}
