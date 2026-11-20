import { useEffect } from 'react'
import { Link, useParams } from '@/navigation'
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
            <div className="text-gray-5 py-40 text-center">
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

    const placeText =
        data.selectedRestaurant?.placeName ??
        data.selectedArea?.placeName ??
        '장소 미정'
    const scheduleText = [data.selectedDate, data.selectedTime]
        .filter(Boolean)
        .join(' · ')
    const activeParticipants = data.participants.filter(participant =>
        ['JOINED', 'READY'].includes(participant.status)
    )

    return (
        <div className="flex min-h-full flex-col gap-16 py-20">
            {alreadyRecorded ? (
                <>
                    <section className="rounded-24 bg-primary-100 border-primary-300 flex flex-col gap-10 border p-18">
                        <span className="text-caption-medium text-primary-main">
                            MealPlan 기록 연결
                        </span>
                        <div className="flex items-center gap-8">
                            <span className="text-caption-medium grid h-26 w-26 place-items-center rounded-full bg-[#e3f5ea] text-[#1f8a5b]">
                                ✓
                            </span>
                            <h1 className="text-title2-semibold text-gray-8">
                                기록을 남겼어요
                            </h1>
                        </div>
                        <p className="text-body2-medium text-gray-6">
                            {data.title ?? '밥약'}이 RECORDED 상태로 바뀌었어요.
                            지난 밥약에서 다시 볼 수 있어요.
                        </p>
                    </section>
                    <section className="rounded-20 overflow-hidden bg-white shadow-sm">
                        <div className="bg-gray-1 text-caption-medium text-gray-4 grid h-150 place-items-center">
                            기록 사진
                        </div>
                        <div className="flex items-center gap-8 p-13">
                            <span className="bg-primary-100 text-caption-medium text-primary-main rounded-full px-10 py-5">
                                RECORDED
                            </span>
                            <span className="text-body2-semibold text-gray-8">
                                {placeText}
                            </span>
                        </div>
                    </section>
                    <MealGroupCreateFromMealPlanButton mealPlan={data} />
                    <Link
                        to={`/meal-plans/${mealPlanId}/decision`}
                        className="rounded-30 border-gray-2 text-body1-semibold text-gray-6 flex justify-center border bg-white py-12">
                        밥약으로
                    </Link>
                    <Link
                        to="/meeting"
                        className="rounded-30 bg-primary-main text-body1-semibold flex justify-center py-14 text-white">
                        지난 밥약 보기
                    </Link>
                </>
            ) : canRecord ? (
                <>
                    <section className="flex flex-col items-center gap-10 px-8 py-14 text-center">
                        <div className="bg-primary-100 text-title2-semibold text-primary-main grid h-68 w-68 place-items-center rounded-full">
                            +
                        </div>
                        <h1 className="text-title2-semibold text-gray-8">
                            오늘 만남, 기록으로 남겨요
                        </h1>
                        <p className="text-caption-regular text-gray-5 max-w-[270px] leading-5">
                            사진을 올리면 밥약이 기록 완료로 바뀌고, 지난
                            밥약으로 정리돼요.
                        </p>
                    </section>
                    <section className="rounded-20 overflow-hidden bg-white shadow-sm">
                        <div className="flex items-center gap-11 p-13">
                            <div className="rounded-16 bg-primary-100 text-caption-medium text-primary-main grid h-46 w-46 shrink-0 place-items-center">
                                밥
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-7">
                                    <span className="bg-gray-1 text-caption-medium text-gray-6 rounded-full px-9 py-4">
                                        COMPLETED
                                    </span>
                                    <span className="text-body2-semibold text-gray-8 truncate">
                                        {data.title ?? '밥약'}
                                    </span>
                                </div>
                                <p className="text-caption-regular text-gray-5 mt-4">
                                    {scheduleText || '시간 미정'} · {placeText}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 px-13 pb-13">
                            <span className="text-caption-medium text-gray-5">
                                함께한 {activeParticipants.length}명과 공유돼요
                            </span>
                        </div>
                    </section>
                    <div className="grid grid-cols-3 gap-10">
                        <div className="rounded-12 bg-gray-1 text-caption-medium text-gray-4 grid h-88 place-items-center">
                            사진
                        </div>
                        <div className="rounded-12 bg-gray-1 text-caption-medium text-gray-4 grid h-88 place-items-center">
                            사진
                        </div>
                        <div className="rounded-12 border-gray-2 text-title2-semibold text-gray-3 grid h-88 place-items-center border border-dashed">
                            +
                        </div>
                    </div>
                    <Link
                        to={`/upload?mealPlanId=${mealPlanId}`}
                        className="rounded-30 bg-gray-8 text-body1-semibold mt-auto flex justify-center py-14 text-white">
                        사진 업로드하고 기록 완료
                    </Link>
                </>
            ) : (
                <section className="rounded-20 bg-white p-16">
                    <h2 className="text-body1-semibold text-gray-8">
                        아직 기록할 수 없습니다.
                    </h2>
                    <p className="text-caption-regular text-gray-5 mt-6">
                        MealPlan이 COMPLETED 상태가 된 뒤 기록을 작성할 수
                        있습니다.
                    </p>
                    <Link
                        to={`/meal-plans/${mealPlanId}/decision`}
                        className="rounded-30 bg-gray-8 text-body1-semibold mt-14 flex justify-center py-12 text-white">
                        밥약으로 돌아가기
                    </Link>
                </section>
            )}
        </div>
    )
}
