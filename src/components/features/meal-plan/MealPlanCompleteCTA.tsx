import { useCompleteMealPlan } from '@/apis'

export function MealPlanCompleteCTA({
    mealPlanId,
    canComplete
}: {
    mealPlanId: string
    canComplete?: boolean
}) {
    const { mutate: completeMealPlan, isPending } = useCompleteMealPlan()

    if (!canComplete) return null

    return (
        <section className="rounded-20 bg-white p-16">
            <div className="mb-12">
                <h2 className="text-body1-semibold text-gray-8">식사 완료 처리</h2>
                <p className="text-caption-regular text-gray-5">
                    밥을 먹었다면 완료 처리해 주세요. 완료 후에는 내 밥약의 기록 필요 목록에 표시됩니다.
                </p>
            </div>
            <button
                type="button"
                disabled={isPending}
                onClick={() => completeMealPlan(mealPlanId)}
                className="rounded-30 bg-gray-8 text-body1-semibold flex w-full justify-center py-12 text-white disabled:bg-gray-4">
                {isPending ? '완료 처리 중입니다' : '밥약 완료 처리하기'}
            </button>
        </section>
    )
}
