import { Link } from '@/navigation'

export function MealPlanRecordCTA({ mealPlanId }: { mealPlanId: string }) {
    return (
        <section className="rounded-20 bg-white p-16">
            <div className="mb-12">
                <h2 className="text-body1-semibold text-gray-8">밥 기록</h2>
                <p className="text-caption-regular text-gray-5">
                    완료된 밥약은 기록으로 연결해 추천 품질과 내 밥그릇에 반영합니다.
                </p>
            </div>
            <Link
                to={`/meal-plans/${mealPlanId}/record`}
                className="rounded-30 bg-primary-main text-body1-semibold flex w-full justify-center py-12 text-white">
                밥 기록하기
            </Link>
        </section>
    )
}
