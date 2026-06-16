import { EmptyViewNotiIcon } from '@/assets/icons'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'

type EmptyNotiVariant = 'mealPlan' | 'localNews'

export function EmptyNotiView({
    variant,
    isMatching
}: {
    variant?: EmptyNotiVariant
    /** @deprecated MealPlanNotificationList 전환 전 story 호환용 */
    isMatching?: boolean
}) {
    const resolvedVariant: EmptyNotiVariant =
        variant ?? (isMatching === false ? 'localNews' : 'mealPlan')

    return (
        <div
            className={`pb-${BOTTOM_NAVIGATION_HEIGHT} flex h-full flex-col items-center justify-center`}>
            <EmptyViewNotiIcon className="mb-17" />
            <span className="text-body1-semibold text-gray-4 mb-6 text-center">
                {resolvedVariant === 'mealPlan'
                    ? '아직 받은 밥약 알림이 없어요'
                    : '업데이트 된 동네 소식이 없어요'}
            </span>
            <span className="text-caption-medium text-gray-4 text-center">
                다음에 좋은 소식 알려드릴게요!
            </span>
        </div>
    )
}
