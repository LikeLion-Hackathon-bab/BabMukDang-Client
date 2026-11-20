import { useState } from 'react'
import { useNavigate } from '@/navigation'
import { MealPlanShareSheet } from '@/components/features/meal-plan'
import {
    DecisionSessionProvider,
    ReadyFooter,
    StageBoard,
    useDecisionPageData,
    useDecisionStages,
    useMealPlanDecisionChrome,
    mealPlanTitle
} from '@/components/features/meal-plan/decision'

export function MealPlanDecisionPage() {
    return (
        <DecisionSessionProvider>
            <MealPlanDecisionBoard />
        </DecisionSessionProvider>
    )
}

function MealPlanDecisionBoard() {
    const [shareOpen, setShareOpen] = useState(false)
    const navigate = useNavigate()
    const { mealPlanId, mealPlan, permissions, isSelfReady, status, isOwner } =
        useDecisionPageData()
    const { stages, participants, readyCount, participantCount } =
        useDecisionStages()
    const title = mealPlanTitle(mealPlan?.title)
    const allParticipantsReady =
        participantCount > 0 && readyCount === participantCount && status === 'READY'
    const canConfirm =
        isOwner && allParticipantsReady && Boolean(permissions?.canConfirmMealPlan)

    useMealPlanDecisionChrome({ mealPlanId, title })

    return (
        <div className="flex min-h-full flex-col">
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
                onPrimaryAction={
                    canConfirm
                        ? () =>
                              navigate(
                                  `/meal-plans/${mealPlanId}/decision/final`
                              )
                        : undefined
                }
                primaryLabel={canConfirm ? '최종 확정하기' : undefined}
                onFriends={() => setShareOpen(true)}
                friendsActive={shareOpen}
                actionIcon="send"
                actionLabel="공유"
                actionPosition="right"
            />
            {shareOpen && (
                <MealPlanShareSheet
                    mealPlanId={mealPlanId}
                    onClose={() => setShareOpen(false)}
                />
            )}
        </div>
    )
}
