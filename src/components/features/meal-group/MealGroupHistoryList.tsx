import { Link } from 'react-router-dom'
import type { MealGroupHistoryResponse } from '@kimdaegyu/babmukdang-shared/domain'

export function MealGroupHistoryList({
    history
}: {
    history: MealGroupHistoryResponse
}) {
    return (
        <section className="flex flex-col gap-12">
            <h2 className="text-body1-semibold text-gray-8">밥약 히스토리</h2>
            <div className="rounded-20 flex flex-col gap-8 bg-white p-16">
                {history.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        아직 연결된 밥약이 없습니다.
                    </span>
                ) : (
                    history.map(item => (
                        <Link
                            key={item.mealPlanId}
                            to={`/meal-plans/${item.mealPlanId}`}
                            className="rounded-16 border-gray-2 flex flex-col gap-4 border p-12">
                            <span className="text-body2-semibold text-gray-8">
                                {item.title}
                            </span>
                            <span className="text-caption-regular text-gray-5">
                                {item.status} · {item.selectedRestaurantName ?? item.selectedAreaName ?? '장소 미정'}
                            </span>
                        </Link>
                    ))
                )}
            </div>
        </section>
    )
}
