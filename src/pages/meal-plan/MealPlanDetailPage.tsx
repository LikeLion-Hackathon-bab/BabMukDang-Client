import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    MealPlanChatPanel,
    MealPlanCompleteCTA,
    MealPlanInvitePanel,
    MealPlanJoinRequestPanel,
    MealPlanLiveActivityPanel,
    MealPlanParticipantPanel,
    MealPlanRecommendationPanel,
    MealPlanReceivedInviteBanner,
    MealPlanRecordCTA,
    MealPlanShareLinkPanel,
    MealPlanStatusCard,
    NearbyFriendExposurePanel
} from '@/components/features/meal-plan'
import { MealGroupCreateFromMealPlanButton } from '@/components/features/meal-group'
import { useMealPlanDetail } from '@/apis'
import { SocketProvider } from '@/contexts/SocketContext'
import { useMealPlanStore } from '@/store'

export function MealPlanDetailPage() {
    return (
        <SocketProvider>
            <MealPlanDetailContent />
        </SocketProvider>
    )
}

function MealPlanDetailContent() {
    const { mealPlanId = '' } = useParams<{ mealPlanId: string }>()
    const navigate = useNavigate()
    const { data, isLoading, error } = useMealPlanDetail(mealPlanId, {
        enabled: Boolean(mealPlanId)
    })
    const setCurrentMealPlan = useMealPlanStore(
        state => state.setCurrentMealPlan
    )
    const storeCurrent = useMealPlanStore(state => state.current)
    const participants = useMealPlanStore(state => state.participants)
    const decisionStages = useMealPlanStore(state => state.decisionStages)
    const readyCount = useMealPlanStore(state => state.readyCount)
    const participantCount = useMealPlanStore(state => state.participantCount)
    const mealPlan = storeCurrent ?? data
    const permissions = mealPlan?.viewerPermissions
    const isOwner = mealPlan?.viewerRole === 'OWNER'

    useEffect(() => {
        if (data) setCurrentMealPlan(data)
    }, [data, setCurrentMealPlan])

    if (isLoading) {
        return (
            <div className="py-40 text-center text-gray-5">
                밥약을 불러오는 중입니다.
            </div>
        )
    }

    if (error || !mealPlan) {
        return (
            <div className="py-40 text-center text-red-500">
                밥약을 불러오지 못했습니다.
            </div>
        )
    }

    const shouldShowCompleteCta = ['CONFIRMED', 'LOCKED'].includes(
        mealPlan.status
    )
    const shouldShowRecordCta = ['COMPLETED', 'RECORDED'].includes(
        mealPlan.status
    )
    const activeParticipantCount = participants.filter(participant =>
        ['JOINED', 'READY'].includes(participant.status)
    ).length
    const isChatActive =
        Boolean(mealPlan.chatRoom) || activeParticipantCount >= 2

    return (
        <div className="flex flex-col gap-20 py-20">
            <MealPlanStatusCard mealPlan={mealPlan} />
            <MealPlanReceivedInviteBanner mealPlanId={mealPlanId} />
            <MealPlanParticipantPanel
                mealPlanId={mealPlanId}
                participants={participants}
                pendingInvites={mealPlan.pendingInvites}
                canManageParticipants={permissions?.canManageParticipants}
            />
            <MealPlanRecommendationPanel
                mealPlanId={mealPlanId}
                stages={decisionStages}
                canComplete={permissions?.canConfirmDecisionSnapshot}
                canVote={permissions?.canVote}
            />
            <section className="rounded-20 flex flex-col gap-12 bg-white p-16">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">
                        의사결정
                    </h2>
                    <p className="text-caption-regular text-gray-5">
                        {readyCount}/{participantCount || participants.length}명
                        준비 · 날짜·시간·지역·메뉴·식당을 결정 화면에서 정하고
                        Ready 합니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/meal-plans/${mealPlanId}/decision`)
                    }
                    className="rounded-30 bg-gray-8 text-body1-semibold py-12 text-white">
                    결정하러 가기
                </button>
            </section>
            {isOwner && (
                <>
                    {permissions?.canInviteFriends && (
                        <MealPlanInvitePanel
                            mealPlanId={mealPlanId}
                            participants={participants}
                            pendingInvites={mealPlan.pendingInvites}
                        />
                    )}
                    <MealPlanJoinRequestPanel
                        requests={mealPlan.pendingJoinRequests}
                        canManageParticipants={
                            permissions?.canManageParticipants
                        }
                    />
                    {permissions?.canCreateShareLink && (
                        <MealPlanShareLinkPanel mealPlanId={mealPlanId} />
                    )}
                    {permissions?.canExposeNearbyFriends && (
                        <NearbyFriendExposurePanel mealPlanId={mealPlanId} />
                    )}
                </>
            )}
            {!['CANCELLED', 'RECORDED'].includes(mealPlan.status) && (
                <MealPlanLiveActivityPanel mealPlanId={mealPlanId} />
            )}
            <MealPlanChatPanel
                mealPlanId={mealPlanId}
                active={isChatActive && Boolean(permissions?.canChat)}
            />
            {shouldShowCompleteCta && (
                <MealPlanCompleteCTA
                    mealPlanId={mealPlanId}
                    canComplete={permissions?.canCompleteMealPlan}
                />
            )}
            {shouldShowRecordCta && permissions?.canRecordMealPlan && (
                <MealPlanRecordCTA mealPlanId={mealPlanId} />
            )}
            {mealPlan.status === 'RECORDED' && (
                <MealGroupCreateFromMealPlanButton mealPlan={mealPlan} />
            )}
        </div>
    )
}
