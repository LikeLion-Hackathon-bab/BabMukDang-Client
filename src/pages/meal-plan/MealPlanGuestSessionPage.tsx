import { useEffect, useMemo } from 'react'
import { Link, useParams } from '@/navigation'
import {
    MealPlanChatPanel,
    MealPlanDecisionWorkflowPanel,
    MealPlanParticipantPanel,
    MealPlanRecommendationPanel,
    MealPlanStatusCard
} from '@/components/features/meal-plan'
import { useMealPlanGuestSession } from '@/apis'
import { SocketProvider, useSocket } from '@/contexts/SocketContext'
import { useMealPlanStore } from '@/store'

const guestSessionStorageKey = (token: string) =>
    `mealPlanGuestSession:${token}`

export function MealPlanGuestSessionPage() {
    const { token = '' } = useParams<{ token: string }>()
    const sessionToken = useMemo(
        () => window.localStorage.getItem(guestSessionStorageKey(token)),
        [token]
    )
    const { data, isLoading, error } = useMealPlanGuestSession(
        token,
        sessionToken,
        { enabled: Boolean(token && sessionToken) }
    )
    const setCurrentMealPlan = useMealPlanStore(
        state => state.setCurrentMealPlan
    )

    useEffect(() => {
        if (data?.mealPlan) setCurrentMealPlan(data.mealPlan)
    }, [data?.mealPlan, setCurrentMealPlan])

    if (!sessionToken) {
        return (
            <div className="flex flex-col gap-16 py-40 text-center">
                <h1 className="text-title2-semibold text-gray-8">
                    게스트 참여 정보가 없습니다.
                </h1>
                <p className="text-body2-medium text-gray-5">
                    공유 링크에서 닉네임을 입력하고 다시 참여해주세요.
                </p>
                <Link
                    to={`/meal-plan-links/${token}`}
                    className="rounded-30 bg-gray-8 py-14 text-body1-semibold text-white">
                    링크 미리보기로 돌아가기
                </Link>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="py-40 text-center text-gray-5">
                게스트 밥약을 불러오는 중입니다.
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex flex-col gap-16 py-40 text-center">
                <h1 className="text-title2-semibold text-red-500">
                    게스트 세션을 확인하지 못했습니다.
                </h1>
                <p className="text-body2-medium text-gray-5">
                    링크가 만료되었거나 게스트 참여 정보가 유효하지 않습니다.
                </p>
                <Link
                    to={`/meal-plan-links/${token}`}
                    className="rounded-30 bg-gray-8 py-14 text-body1-semibold text-white">
                    링크 미리보기로 돌아가기
                </Link>
            </div>
        )
    }

    return (
        <SocketProvider
            mealPlanId={data.mealPlan.mealPlanId}
            guestSessionToken={data.sessionToken}
            shareLinkToken={token}>
            <MealPlanGuestSessionContent nickname={data.nickname} />
        </SocketProvider>
    )
}

function MealPlanGuestSessionContent({ nickname }: { nickname: string }) {
    const mealPlan = useMealPlanStore(state => state.current)
    const participants = useMealPlanStore(state => state.participants)
    const decisionStages = useMealPlanStore(state => state.decisionStages)
    const decisionProgress = useMealPlanStore(state => state.decisionProgress)
    const { commands, guestSessionToken } = useSocket()

    if (!mealPlan) {
        return (
            <div className="py-40 text-center text-gray-5">
                밥약 정보를 준비하는 중입니다.
            </div>
        )
    }

    const activeParticipantCount = participants.filter(participant =>
        ['JOINED', 'READY'].includes(participant.status)
    ).length
    const isChatActive =
        Boolean(mealPlan.chatRoom) || activeParticipantCount >= 2

    return (
        <div className="flex flex-col gap-20 py-20">
            <section className="rounded-20 bg-primary-100 border-primary-300 border p-16">
                <h1 className="text-body1-semibold text-gray-8">
                    {nickname}님은 게스트로 참여 중입니다.
                </h1>
                <p className="mt-6 text-caption-regular text-gray-6">
                    게스트는 이 밥약방의 채팅과 결정 내용을 확인할 수 있지만,
                    친구 목록, 프로필 상세, 내 밥그릇 기능에는 접근하지
                    않습니다.
                </p>
            </section>
            <MealPlanStatusCard mealPlan={mealPlan} />
            <MealPlanParticipantPanel
                participants={participants}
                pendingInvites={mealPlan.pendingInvites}
            />
            <MealPlanDecisionWorkflowPanel
                mealPlanId={mealPlan.mealPlanId}
                progress={decisionProgress ?? mealPlan.decisionProgress ?? null}
                isOwner={mealPlan.viewerRole === 'OWNER'}
                permissions={mealPlan.viewerPermissions}
                viewerTaskReadyMap={mealPlan.viewerTaskReadyMap}
                onTaskReady={(taskKey, isReady) =>
                    commands?.taskReady({
                        mealPlanId: mealPlan.mealPlanId,
                        taskKey,
                        isReady,
                        guestSessionToken: guestSessionToken ?? undefined
                    })
                }
            />
            <MealPlanRecommendationPanel
                mealPlanId={mealPlan.mealPlanId}
                stages={decisionStages}
                interactionMode="vote"
                canVote={mealPlan.viewerPermissions?.canVote}
            />
            <MealPlanChatPanel
                mealPlanId={mealPlan.mealPlanId}
                active={isChatActive}
            />
            <section className="rounded-20 bg-white p-16">
                <h2 className="text-body1-semibold text-gray-8">
                    가입하면 더 편해져요
                </h2>
                <p className="mt-6 text-caption-regular text-gray-5">
                    기록 작성, 반복 참여, 친구 초대를 사용하려면 회원 가입이
                    필요합니다.
                </p>
                <Link
                    to="/login"
                    className="mt-12 inline-flex rounded-30 bg-gray-8 px-16 py-10 text-caption-medium text-white">
                    가입하고 이어가기
                </Link>
            </section>
        </div>
    )
}
