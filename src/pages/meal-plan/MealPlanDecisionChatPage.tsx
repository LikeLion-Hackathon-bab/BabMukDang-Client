import { SocketProvider } from '@/contexts/SocketContext'
import { MealPlanChatPanel } from '@/components/features/meal-plan'
import {
    DecisionAppBar,
    ParticipantStatusCard,
    mealPlanTitle,
    useDecisionPageData,
    useDecisionStages
} from '@/components/features/meal-plan/decision'

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

    return (
        <div className="flex min-h-full flex-col">
            <DecisionAppBar
                title={`${mealPlanTitle(mealPlan?.title)} 채팅`}
                sub={`${participantCount}명 참여`}
                showChat={false}
            />
            <div className="flex flex-col" style={{ padding: '0 16px 12px' }}>
                <ParticipantStatusCard />
            </div>
            <div className="flex-1" style={{ padding: '0 16px 16px' }}>
                <MealPlanChatPanel
                    mealPlanId={mealPlanId}
                    active={isChatActive}
                />
            </div>
        </div>
    )
}
