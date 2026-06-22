import { useEffect, useMemo } from 'react'
import { Link, useParams } from '@/navigation'
import {
    DecisionAppBar,
    ReadyFooter,
    StageBoard,
    mealPlanTitle,
    useDecisionStages
} from '@/components/features/meal-plan/decision'
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
                    className="rounded-30 bg-gray-8 text-body1-semibold py-14 text-white">
                    링크 미리보기로 돌아가기
                </Link>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="text-gray-5 py-40 text-center">
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
                    className="rounded-30 bg-gray-8 text-body1-semibold py-14 text-white">
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
    const isSelfReady = useMealPlanStore(state => state.isSelfReady)
    const status = useMealPlanStore(state => state.status)
    const setIsSelfReady = useMealPlanStore(state => state.setIsSelfReady)
    const { commands, guestSessionToken } = useSocket()
    const { stages, participants, readyCount, participantCount } =
        useDecisionStages()

    if (!mealPlan) {
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
                sub={`${nickname} · 게스트`}
                mealPlanId={mealPlan.mealPlanId}
                showChat={false}
            />
            <StageBoard
                mealPlanId={mealPlan.mealPlanId}
                stages={stages}
                readyCount={readyCount}
                participantCount={participantCount}
                participants={participants}
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
                mealPlanId={mealPlan.mealPlanId}
                isSelfReady={isSelfReady}
                status={status ?? mealPlan.status}
                canReady={mealPlan.viewerPermissions?.canReadyMealPlan}
                label={isSelfReady ? 'Ready 취소' : '내 몫 다 정했어요 (Ready)'}
                onToggleReady={() => {
                    if (isSelfReady) {
                        commands?.unready(mealPlan.mealPlanId)
                        setIsSelfReady(false)
                        return
                    }
                    commands?.ready(mealPlan.mealPlanId)
                    setIsSelfReady(true)
                }}
                isTogglePending={!commands || !guestSessionToken}
            />
        </div>
    )
}
