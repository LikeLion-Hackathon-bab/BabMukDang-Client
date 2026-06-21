import { SocketProvider } from '@/contexts/SocketContext'
import {
    DecisionAppBar,
    FinalConfirmPanel,
    FinalDonePanel,
    StageSwitcher,
    mealPlanTitle,
    useDecisionPageData,
    useDecisionStages
} from '@/components/features/meal-plan/decision'

const CONFIRMED = ['CONFIRMED', 'LOCKED', 'COMPLETED', 'RECORDED']

export function MealPlanFinalConfirmPage() {
    return (
        <SocketProvider>
            <MealPlanFinalConfirmContent />
        </SocketProvider>
    )
}

function MealPlanFinalConfirmContent() {
    const { mealPlanId, mealPlan, permissions, isOwner } = useDecisionPageData()
    const decision = useDecisionStages()

    if (!mealPlan) {
        return (
            <div className="py-40 text-center text-gray-5">
                밥약을 불러오는 중입니다.
            </div>
        )
    }

    const confirmed = CONFIRMED.includes(mealPlan.status)

    return (
        <div className="flex min-h-full flex-col">
            <DecisionAppBar
                title={confirmed ? '밥약 확정' : '이대로 확정할까요?'}
                mealPlanId={mealPlanId}
            />
            {!confirmed && (
                <StageSwitcher
                    mealPlanId={mealPlanId}
                    active="restaurant"
                    states={decision.statesByKey}
                />
            )}
            {confirmed ? (
                <FinalDonePanel mealPlan={mealPlan} decision={decision} />
            ) : (
                <FinalConfirmPanel
                    mealPlan={mealPlan}
                    isOwner={isOwner}
                    canConfirm={permissions?.canConfirmMealPlan ?? false}
                    decision={decision}
                />
            )}
        </div>
    )
}
