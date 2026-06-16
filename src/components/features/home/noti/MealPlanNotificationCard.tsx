import { MatchingIcon } from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import type { MealPlanNotificationView } from '@/viewModels'

export function MealPlanNotificationCard({
    notification,
    onClick
}: {
    notification: MealPlanNotificationView
    onClick: () => void
}) {
    return (
        <div
            className={`flex w-full flex-col gap-10 px-20 py-16 ${notification.readAt ? 'opacity-60' : ''}`}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onClick()
                }
            }}>
            <div className="flex w-full flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-8">
                    <MatchingIcon
                        bgcolor={COLORS.primary100}
                        strokecolor={COLORS.primaryMain}
                    />
                    <span className="text-body1-semibold text-gray-7">
                        {notification.title}
                    </span>
                </div>
                <span className="text-caption-medium text-gray-3">
                    {notification.createdAtLabel ?? notification.createdAt}
                </span>
            </div>
            <span className="text-caption-medium text-gray-5 w-full">
                {notification.message}
            </span>
        </div>
    )
}
