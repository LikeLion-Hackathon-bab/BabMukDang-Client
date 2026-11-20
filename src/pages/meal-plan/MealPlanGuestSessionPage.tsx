import {
    DecisionAppBar,
    GuestDecisionSessionProvider,
    ReadyFooter,
    StageBoard,
    mealPlanTitle,
    useDecisionPageData,
    useDecisionStages
} from '@/components/features/meal-plan/decision'
import { useSocket } from '@/contexts/SocketContext'

export function MealPlanGuestSessionPage() {
    return (
        <GuestDecisionSessionProvider>
            <MealPlanGuestSessionContent />
        </GuestDecisionSessionProvider>
    )
}

function MealPlanGuestSessionContent() {
    const {
        mealPlan,
        mealPlanId,
        isSelfReady,
        status,
        guestNickname,
        shareLinkToken
    } = useDecisionPageData()
    const setIsSelfReady = useSocket().setIsSelfReady
    const { commands, guestSessionToken } = useSocket()
    const { stages, participants, readyCount, participantCount } =
        useDecisionStages()

    if (!mealPlan || !shareLinkToken) {
        return (
            <div className="text-gray-5 py-40 text-center">
                밥약 정보를 준비하는 중입니다.
            </div>
        )
    }

    return (
        <div className="flex min-h-full flex-col">
            <DecisionAppBar
                title={mealPlanTitle(mealPlan.title)}
                sub={`${guestNickname ?? '게스트'} · 게스트`}
                mealPlanId={mealPlanId}
                showChat={false}
            />
            <StageBoard
                mealPlanId={mealPlanId}
                stages={stages}
                readyCount={readyCount}
                participantCount={participantCount}
                participants={participants}
                stagePathFor={
                    stageKey =>
                        `/meal-plan-links/${shareLinkToken}/session/decision/${stageKey}`
                }
                finalPath={null}
            />
            <section className="rounded-20 bg-gray-1 mx-16 mb-14 p-14">
                <h2 className="text-body2-semibold text-gray-8">
                    게스트로 참여 중
                </h2>
                <p className="text-caption-regular text-gray-5 mt-4 leading-5">
                    채팅과 결정에는 함께 참여하고, 친구 목록·프로필·내 밥그릇은
                    보이지 않아요.
                </p>
            </section>
            <ReadyFooter
                mealPlanId={mealPlanId}
                isSelfReady={isSelfReady}
                status={status ?? mealPlan.status}
                canReady={mealPlan.viewerPermissions?.canReadyMealPlan}
                label={isSelfReady ? 'Ready 취소' : '내 몫 다 정했어요 (Ready)'}
                onToggleReady={() => {
                    if (isSelfReady) {
                        commands?.unready(mealPlanId)
                        setIsSelfReady(false)
                        return
                    }
                    commands?.ready(mealPlanId)
                    setIsSelfReady(true)
                }}
                isTogglePending={!commands || !guestSessionToken}
            />
        </div>
    )
}
