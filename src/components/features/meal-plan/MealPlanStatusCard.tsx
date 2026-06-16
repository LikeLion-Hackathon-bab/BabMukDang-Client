import type { MealPlanResponse } from '@kimdaegyu/babmukdang-shared/domain'

const statusText: Record<string, string> = {
    DRAFT: '밥약을 준비하고 있어요.',
    RECOMMENDING: '추천 조건을 정하고 있어요.',
    GATHERING: '같이 먹을 사람을 모으고 있어요.',
    DECIDING: '시간, 장소, 메뉴를 정하고 있어요.',
    READY: '참여자들이 준비 완료했어요.',
    CONFIRMED: '밥약이 확정됐어요.',
    LOCKED: '곧 만나는 밥약이에요.',
    COMPLETED: '기록을 남길 차례예요.',
    RECORDED: '기록이 완료된 밥약이에요.',
    CANCELLED: '취소된 밥약이에요.'
}

export function MealPlanStatusCard({ mealPlan }: { mealPlan: MealPlanResponse }) {
    const dateTime = [mealPlan.selectedDate, mealPlan.selectedTime]
        .filter(Boolean)
        .join(' ')
    const place =
        mealPlan.selectedRestaurant?.placeName ??
        mealPlan.selectedArea?.placeName ??
        '장소 미정'

    return (
        <section className="rounded-24 bg-primary-100 border-primary-300 flex flex-col gap-12 border p-18">
            <span className="text-caption-medium text-primary-main">
                {mealPlan.status}
            </span>
            <div className="flex flex-col gap-6">
                <h1 className="text-title2-semibold text-gray-8">
                    {mealPlan.title ?? '이름 없는 밥약'}
                </h1>
                <p className="text-body2-medium text-gray-7">
                    {statusText[mealPlan.status] ?? '밥약을 진행하고 있어요.'}
                </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-caption-regular text-gray-6">
                <div className="rounded-16 bg-white p-12">
                    <span className="block text-gray-5">시간</span>
                    <strong className="text-gray-8">{dateTime || '미정'}</strong>
                </div>
                <div className="rounded-16 bg-white p-12">
                    <span className="block text-gray-5">장소</span>
                    <strong className="text-gray-8">{place}</strong>
                </div>
            </div>
        </section>
    )
}
