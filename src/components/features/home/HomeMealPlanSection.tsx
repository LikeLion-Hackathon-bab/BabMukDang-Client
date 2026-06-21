import { Link } from '@/navigation'
import type { HomeMealPlanDashboardResponse } from '@/apis'
import { MyMealPlanCard } from '@/components/features/meal-plan'
import { mapMyMealPlanListItem } from '@/apis/mappers/mealPlan.mapper'

const actionKindLabel: Record<string, string> = {
    CONTINUE_DECISION: '진행 중',
    TODAY_UPCOMING: '오늘 예정',
    RECORD_NEEDED: '기록 필요',
    RESPOND_JOIN_REQUEST: '참여 요청',
    NOTIFICATION_FOLLOW_UP: '중요 알림'
}

export function HomeMealPlanSection({
    dashboard,
    isLoading,
    error
}: {
    dashboard?: HomeMealPlanDashboardResponse
    isLoading?: boolean
    error?: unknown
}) {
    if (isLoading) {
        return (
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">다음 행동</h2>
                <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                    밥약 다음 행동을 불러오는 중입니다.
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">다음 행동</h2>
                <div className="rounded-20 bg-white p-16 text-caption-regular text-red-500">
                    밥약 다음 행동을 불러오지 못했습니다.
                </div>
            </section>
        )
    }

    const nextActions = dashboard?.nextActions ?? []

    return (
        <section className="flex flex-col gap-12">
            <div className="flex items-center justify-between">
                <h2 className="text-body1-semibold text-gray-8">다음 행동</h2>
                <Link
                    to="/meal-plans"
                    className="text-caption-medium text-primary-main">
                    전체 보기
                </Link>
            </div>
            {nextActions.length > 0 ? (
                <div className="flex flex-col gap-10">
                    {nextActions.slice(0, 5).map(action =>
                        action.mealPlan ? (
                            <MyMealPlanCard
                                key={action.actionId}
                                mealPlan={mapMyMealPlanListItem(action.mealPlan)}
                            />
                        ) : (
                            <article
                                key={action.actionId}
                                className="rounded-20 flex flex-col gap-10 bg-white p-16 shadow-sm">
                                <span className="text-caption-medium text-primary-main">
                                    {actionKindLabel[action.kind] ?? '밥약'}
                                </span>
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-body1-semibold text-gray-8">
                                        {action.title}
                                    </h3>
                                    <p className="text-caption-regular text-gray-5">
                                        {action.description}
                                    </p>
                                </div>
                                <Link
                                    to={action.primaryAction.href}
                                    className="rounded-30 bg-gray-8 text-body1-semibold flex w-full items-center justify-center py-12 text-white">
                                    {action.primaryAction.label}
                                </Link>
                            </article>
                        )
                    )}
                </div>
            ) : (
                <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                    지금 이어서 할 밥약이 없습니다.
                </div>
            )}
        </section>
    )
}
