import {
    DecisionSessionProvider,
    FinalConfirmPanel,
    FinalDonePanel,
    StageSwitcher,
    mealPlanTitle,
    useDecisionPageData,
    useMealPlanDecisionChrome,
    useDecisionStages
} from '@/components/features/meal-plan/decision'

const CONFIRMED = ['CONFIRMED', 'LOCKED', 'COMPLETED', 'RECORDED']

export function MealPlanFinalConfirmPage() {
    return (
        <DecisionSessionProvider>
            <MealPlanFinalConfirmContent />
        </DecisionSessionProvider>
    )
}

function MealPlanFinalConfirmContent() {
    const { mealPlanId, mealPlan, permissions, isOwner } = useDecisionPageData()
    const decision = useDecisionStages()
    useMealPlanDecisionChrome({
        mealPlanId,
        title: mealPlanTitle(mealPlan?.title)
    })

    if (!mealPlan) {
        return (
            <div className="text-gray-5 py-40 text-center">
                밥약을 불러오는 중입니다.
            </div>
        )
    }

    const confirmed = CONFIRMED.includes(mealPlan.status)

    return (
        <div className="flex min-h-full flex-col">
            {!confirmed && (
                <StageSwitcher
                    mealPlanId={mealPlanId}
                    active="restaurant"
                    states={decision.statesByKey}
                />
            )}
            {confirmed ? (
                <FinalDonePanel
                    mealPlan={mealPlan}
                    decision={decision}
                />
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
