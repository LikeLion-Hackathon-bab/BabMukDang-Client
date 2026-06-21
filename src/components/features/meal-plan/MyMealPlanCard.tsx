import { Link } from '@/navigation'
import type { MealPlanCardView } from '@/viewModels'

const statusLabel: Record<string, string> = {
    DRAFT: '준비 중',
    RECOMMENDING: '추천 중',
    GATHERING: '모으는 중',
    DECIDING: '정하는 중',
    READY: '확정 대기',
    CONFIRMED: '예정',
    LOCKED: '임박',
    COMPLETED: '기록 필요',
    RECORDED: '기록 완료',
    CANCELLED: '취소됨'
}

export function MyMealPlanCard({ mealPlan }: { mealPlan: MealPlanCardView }) {
    return (
        <article className="rounded-20 flex flex-col gap-14 bg-white p-16 shadow-sm">
            <div className="flex items-start justify-between gap-12">
                <div className="flex min-w-0 flex-col gap-6">
                    <span className="text-caption-medium text-primary-main">
                        {statusLabel[mealPlan.status] ?? mealPlan.status}
                    </span>
                    <h3 className="text-body1-semibold text-gray-8 line-clamp-2">
                        {mealPlan.title}
                    </h3>
                </div>
                <span className="rounded-20 bg-primary-100 text-caption-medium text-primary-main shrink-0 px-10 py-5">
                    {mealPlan.participantCount}명
                </span>
            </div>
            <div className="flex flex-col gap-4 text-caption-regular text-gray-6">
                <span>{mealPlan.scheduleText}</span>
                <span>{mealPlan.placeText}</span>
            </div>
            <Link
                to={mealPlan.primaryActionHref || `/meal-plans/${mealPlan.mealPlanId}`}
                className="rounded-30 bg-gray-8 text-body1-semibold flex w-full items-center justify-center py-12 text-white">
                {mealPlan.primaryActionLabel || '밥약 보기'}
            </Link>
        </article>
    )
}
