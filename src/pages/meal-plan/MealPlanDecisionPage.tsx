import { useState } from 'react'
import { SocketProvider } from '@/contexts/SocketContext'
import { MealPlanShareSheet } from '@/components/features/meal-plan'
import {
    ReadyFooter,
    StageBoard,
    useDecisionPageData,
    useDecisionStages,
    useMealPlanDecisionChrome,
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
    const [shareOpen, setShareOpen] = useState(false)
    const { mealPlanId, mealPlan, permissions, isSelfReady, status } =
        useDecisionPageData()
    const { stages, participants, readyCount, participantCount } =
        useDecisionStages()
    const title = mealPlanTitle(mealPlan?.title)
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
