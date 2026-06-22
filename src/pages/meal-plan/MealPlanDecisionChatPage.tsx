import { SocketProvider } from '@/contexts/SocketContext'
import {
    MealPlanChatPanel,
    MealPlanJoinRequestPanel
} from '@/components/features/meal-plan'
import {
    ParticipantStatusCard,
    mealPlanTitle,
    useDecisionPageData,
    useMealPlanDecisionChrome,
    useDecisionStages
} from '@/components/features/meal-plan/decision'
import { useMemo } from 'react'
import { usePageChrome } from '@/hooks/usePageChrome'

export function MealPlanDecisionChatPage() {
    return (
        <SocketProvider>
            <MealPlanDecisionChatContent />
        </SocketProvider>
    )
}

function MealPlanDecisionChatContent() {
    const { mealPlanId, mealPlan, permissions } = useDecisionPageData()
    const { participantCount } = useDecisionStages()
    const isChatActive =
        (Boolean(mealPlan?.chatRoom) || participantCount >= 2) &&
        Boolean(permissions?.canChat)
    const title = mealPlanTitle(mealPlan?.title)

    const pageChromeConfig = useMemo(
        () => ({
            header: {
                visible: true,
                title
            },
            bottomNav: { visible: false }
        }),
        [title]
    )

    usePageChrome(pageChromeConfig)

    return (
        <div className="flex min-h-full flex-col">
            <div
                className="flex flex-col"
                style={{ padding: '0 16px 12px' }}>
                <ParticipantStatusCard />
            </div>
            <div
                className="flex flex-col"
                style={{ padding: '0 16px 12px' }}>
                <MealPlanJoinRequestPanel
                    requests={mealPlan?.pendingJoinRequests ?? []}
                    canManageParticipants={permissions?.canManageParticipants}
                />
            </div>
            <div
                className="flex-1"
                style={{ padding: '0 16px 16px' }}>
                <MealPlanChatPanel
                    mealPlanId={mealPlanId}
                    active={isChatActive}
                />
            </div>
        </div>
    )
}
