/**
 * Decision pages share one route-aware data source. Member routes use the
 * authenticated detail endpoint, while guest routes keep their signed guest
 * session and socket credentials together.
 */
import { useEffect, useMemo, type ReactNode } from 'react'
import { Link, useParams } from '@/navigation'
import { useMealPlanDetail, useMealPlanGuestSession } from '@/apis'
import { SocketProvider } from '@/contexts/SocketContext'
import { useMealPlanStore } from '@/store'

const DECISION_DETAIL_STALE_TIME = 60_000

export const guestSessionStorageKey = (token: string) =>
    `mealPlanGuestSession:${token}`

export function useDecisionPageData() {
    const { mealPlanId: routeMealPlanId = '', token = '' } = useParams<{
        mealPlanId: string
        token: string
    }>()
    const isGuest = Boolean(token) && !routeMealPlanId
    const guestSessionToken = useMemo(
        () =>
            isGuest
                ? window.localStorage.getItem(guestSessionStorageKey(token))
                : null,
        [isGuest, token]
    )
    const memberQuery = useMealPlanDetail(routeMealPlanId, {
        enabled: Boolean(routeMealPlanId),
        staleTime: DECISION_DETAIL_STALE_TIME,
        refetchOnMount: false
    })
    const guestQuery = useMealPlanGuestSession(token, guestSessionToken, {
        enabled: isGuest && Boolean(guestSessionToken),
        staleTime: DECISION_DETAIL_STALE_TIME,
        refetchOnMount: false
    })
    const setCurrentMealPlan = useMealPlanStore(
        state => state.setCurrentMealPlan
    )
    const current = useMealPlanStore(state => state.current)
    const isSelfReady = useMealPlanStore(state => state.isSelfReady)

    const response = isGuest ? guestQuery.data?.mealPlan : memberQuery.data
    const resolvedMealPlanId = routeMealPlanId || response?.mealPlanId || ''

    useEffect(() => {
        if (response) setCurrentMealPlan(response)
    }, [response, setCurrentMealPlan])

    const currentForRoute =
        current && current.mealPlanId === resolvedMealPlanId ? current : null
    const mealPlan = currentForRoute ?? response ?? null

    return {
        mealPlanId: resolvedMealPlanId,
        mealPlan,
        permissions: mealPlan?.viewerPermissions,
        isOwner: mealPlan?.viewerRole === 'OWNER',
        viewerRole: mealPlan?.viewerRole,
        isSelfReady,
        status: mealPlan?.status,
        isLoading: isGuest ? guestQuery.isLoading : memberQuery.isLoading,
        error: isGuest ? guestQuery.error : memberQuery.error,
        isGuest,
        shareLinkToken: isGuest ? token : null,
        guestSessionToken: isGuest ? guestSessionToken : null,
        guestNickname: isGuest ? (guestQuery.data?.nickname ?? null) : null,
        guestId: isGuest ? (guestQuery.data?.guestId ?? null) : null,
        hasGuestSession: !isGuest || Boolean(guestSessionToken)
    }
}

/**
 * Keeps a socket lease alive while a guest moves between its decision routes.
 * The child data hook uses the same React Query key, so it never triggers a
 * second session request while the first request is in flight or still fresh.
 */
export function GuestDecisionSessionProvider({
    children
}: {
    children: ReactNode
}) {
    const data = useDecisionPageData()

    if (!data.hasGuestSession) {
        return (
            <div className="flex flex-col gap-16 py-40 text-center">
                <h1 className="text-title2-semibold text-gray-8">
                    게스트 참여 정보가 없습니다.
                </h1>
                <p className="text-body2-medium text-gray-5">
                    공유 링크에서 닉네임을 입력하고 다시 참여해주세요.
                </p>
                <Link
                    to={`/meal-plan-links/${data.shareLinkToken ?? ''}/join`}
                    className="rounded-30 bg-gray-8 text-body1-semibold py-14 text-white">
                    게스트 참여로 돌아가기
                </Link>
            </div>
        )
    }

    if (data.isLoading || !data.mealPlanId) {
        return (
            <div className="text-gray-5 py-40 text-center">
                게스트 밥약을 불러오는 중입니다.
            </div>
        )
    }

    if (data.error || !data.mealPlan) {
        return (
            <div className="flex flex-col gap-16 py-40 text-center">
                <h1 className="text-title2-semibold text-red-500">
                    게스트 세션을 확인하지 못했습니다.
                </h1>
                <p className="text-body2-medium text-gray-5">
                    링크가 만료되었거나 게스트 참여 정보가 유효하지 않습니다.
                </p>
                <Link
                    to={`/meal-plan-links/${data.shareLinkToken ?? ''}/join`}
                    className="rounded-30 bg-gray-8 text-body1-semibold py-14 text-white">
                    게스트 참여로 돌아가기
                </Link>
            </div>
        )
    }

    return (
        <SocketProvider
            mealPlanId={data.mealPlanId}
            guestSessionToken={data.guestSessionToken}
            shareLinkToken={data.shareLinkToken}>
            {children}
        </SocketProvider>
    )
}

export function DecisionSessionProvider({ children }: { children: ReactNode }) {
    const { token, mealPlanId } = useParams<{
        token: string
        mealPlanId: string
    }>()

    if (token && !mealPlanId) {
        return (
            <GuestDecisionSessionProvider>
                {children}
            </GuestDecisionSessionProvider>
        )
    }

    return <SocketProvider mealPlanId={mealPlanId}>{children}</SocketProvider>
}

export function mealPlanTitle(title?: string | null) {
    return title ?? '밥약'
}
