import { Link } from '@/navigation'
import type { MealGroupResponse } from '@kimdaegyu/babmukdang-shared/domain'

export function MealGroupCard({ mealGroup }: { mealGroup: MealGroupResponse }) {
    return (
        <Link
            to={`/meal-groups/${mealGroup.mealGroupId}`}
            data-testid={`meal-group-card-${mealGroup.mealGroupId}`}
            className="rounded-20 flex flex-col gap-10 bg-white p-16">
            <div className="flex items-center gap-12">
                <div className="bg-gray-2 size-44 rounded-full" />
                <div className="min-w-0 flex-1">
                    <h3 className="text-body1-semibold text-gray-8 truncate">
                        {mealGroup.name}
                    </h3>
                    <p className="text-caption-regular text-gray-5">
                        멤버 {mealGroup.members.length}명 · 최근 밥약 {mealGroup.recentMealPlanIds.length}개
                    </p>
                </div>
            </div>
        </Link>
    )
}
