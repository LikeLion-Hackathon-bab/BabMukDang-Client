import { SocketProvider } from '@/contexts/SocketContext'
import {
    DecisionAppBar,
    ReadyFooter,
    StageBoard,
    useDecisionPageData,
    useDecisionStages,
    mealPlanTitle
} from '@/components/features/meal-plan/decision'

export function MealPlanDecisionPage() {
    return (
        <SocketProvider>
            <MealPlanDecisionBoard />
        </SocketProvider>
    )
}

function MealPlanDecisionBoard() {
    const { mealPlanId, mealPlan, permissions, isSelfReady, status } =
        useDecisionPageData()
    const { stages, participants, readyCount, participantCount } =
        useDecisionStages()

    return (
        <div className="flex min-h-full flex-col">
            <DecisionAppBar
                title={mealPlanTitle(mealPlan?.title)}
                sub={`${participantCount}명`}
                mealPlanId={mealPlanId}
            />
            <StageBoard
                mealPlanId={mealPlanId}
                stages={stages}
                readyCount={readyCount}
                participantCount={participantCount}
                participants={participants}
            />
            <ReadyFooter
                mealPlanId={mealPlanId}
                isSelfReady={isSelfReady}
                status={status}
                canReady={permissions?.canReadyMealPlan}
                label={isSelfReady ? 'Ready 취소' : '내 몫 다 정했어요 (Ready)'}
            />
        </div>
    )
}
