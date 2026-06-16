import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FriendListSection, MealStatusToggleButton } from '@/components'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'
import {
    useAcceptMealPlanInvite,
    useAllFriendMeals,
    useDeclineMealPlanInvite,
    useReceivedMealPlanInvites,
    useSentMealPlanInvites
} from '@/apis'
import { useHeaderStore } from '@/store/headerStore'

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const getString = (value: unknown, keys: string[], fallback = '-'): string => {
    const record = asRecord(value)
    for (const key of keys) {
        const current = record[key]
        if (typeof current === 'string' && current.trim() !== '') return current
        if (typeof current === 'number') return String(current)
    }
    return fallback
}

const getNumber = (value: unknown, keys: string[]): number | null => {
    const record = asRecord(value)
    for (const key of keys) {
        const current = record[key]
        if (typeof current === 'number') return current
        if (typeof current === 'string' && current.trim() !== '') {
            const parsed = Number(current)
            if (!Number.isNaN(parsed)) return parsed
        }
    }
    return null
}

const getMemberId = (value: unknown): number | null =>
    getNumber(value, ['memberId', 'friendMemberId', 'targetMemberId', 'userId', 'id'])

const getDisplayName = (value: unknown): string =>
    getString(value, ['userName', 'username', 'nickname', 'name', 'email'])

const inviteStatusLabel = (status: string): string => {
    switch (status) {
        case 'PENDING':
            return '응답 대기'
        case 'ACCEPTED':
            return '수락됨'
        case 'DECLINED':
            return '거절됨'
        case 'CANCELLED':
            return '취소됨'
        case 'EXPIRED':
            return '만료됨'
        default:
            return status
    }
}

export function FriendPage() {
    const navigate = useNavigate()
    const { hideLeftButton, setTitle, showRightButton, resetHeader } =
        useHeaderStore()
    const [keyword, setKeyword] = useState('')
    const { data: friendMeals, isLoading: isFriendMealsLoading } = useAllFriendMeals()
    const { data: receivedInvites } = useReceivedMealPlanInvites()
    const { data: sentInvites } = useSentMealPlanInvites()
    const { mutate: acceptInvite } = useAcceptMealPlanInvite({
        onSuccess: mealPlan => {
            if (mealPlan) navigate(`/meal-plans/${mealPlan.mealPlanId}`)
        }
    })
    const { mutate: declineInvite } = useDeclineMealPlanInvite()

    useEffect(() => {
        hideLeftButton()
        setTitle('친구')
        showRightButton()
        return () => resetHeader()
    }, [hideLeftButton, setTitle, showRightButton, resetHeader])

    const friendList = useMemo(
        () =>
            (friendMeals ?? [])
                .filter((friend: unknown) => getDisplayName(friend).includes(keyword))
                .map((friend: unknown) => ({
                    memberId: getMemberId(friend) ?? 0,
                    userName: getDisplayName(friend),
                    profileImageUrl: getString(friend, ['profileImageUrl'], ''),
                    hungry: Boolean(asRecord(friend).hungry),
                    label: getString(friend, ['label'], '')
                })),
        [friendMeals, keyword]
    )

    return (
        <div className="mt-20 flex flex-col gap-24">
            <section className="flex flex-col gap-10">
                <FriendSearchInput handleSearch={setKeyword} />
                <Link
                    to="/meal-plans/start"
                    className="rounded-12 bg-primary-100 border-primary-400 flex items-center justify-between border px-16 py-18">
                    <div>
                        <span className="text-body1-semibold text-gray-8">
                            친구와 새 밥약 시작
                        </span>
                        <p className="text-caption-regular text-gray-5">
                            친구를 초대할 MealPlan을 먼저 만듭니다.
                        </p>
                    </div>
                </Link>
            </section>
            <MealStatusToggleButton />
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">받은 MealPlan 초대</h2>
                {receivedInvites?.length ? (
                    <div className="flex flex-col gap-10">
                        {receivedInvites.map(invite => {
                            const isPending = invite.status === 'PENDING'
                            return (
                                <article
                                    key={invite.inviteId}
                                    className="rounded-20 flex flex-col gap-10 bg-white p-16">
                                    <div className="flex items-start justify-between gap-10">
                                        <div className="flex min-w-0 flex-col gap-4">
                                            <span className="text-body1-semibold text-gray-8">
                                                {invite.inviter.username}님의 밥약 초대
                                            </span>
                                            <p className="text-caption-regular text-gray-5">
                                                {invite.message || '같이 밥 먹자는 초대가 도착했습니다.'}
                                            </p>
                                        </div>
                                        <span className="rounded-20 bg-gray-1 px-10 py-5 text-caption-medium text-gray-6">
                                            {inviteStatusLabel(invite.status)}
                                        </span>
                                    </div>
                                    {isPending ? (
                                        <div className="grid grid-cols-2 gap-8">
                                            <button
                                                type="button"
                                                onClick={() => acceptInvite(invite.inviteId)}
                                                className="rounded-30 bg-gray-8 py-10 text-caption-medium text-white">
                                                수락
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => declineInvite(invite.inviteId)}
                                                className="rounded-30 bg-gray-2 py-10 text-caption-medium text-gray-7">
                                                거절
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to={`/meal-plans/${invite.mealPlanId}`}
                                            className="rounded-30 bg-gray-1 py-10 text-center text-caption-medium text-gray-7">
                                            밥약 보기
                                        </Link>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                        받은 MealPlan 초대가 없습니다.
                    </div>
                )}
            </section>
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">보낸 MealPlan 초대</h2>
                {sentInvites?.length ? (
                    <div className="flex flex-col gap-8">
                        {sentInvites.map(invite => (
                            <Link
                                key={invite.inviteId}
                                to={`/meal-plans/${invite.mealPlanId}`}
                                className="rounded-20 bg-white p-16">
                                <span className="text-body2-medium text-gray-8">
                                    {invite.invitee.username}님에게 보낸 초대
                                </span>
                                <p className="text-caption-regular text-gray-5">
                                    {inviteStatusLabel(invite.status)}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-20 bg-white p-16 text-caption-regular text-gray-5">
                        보낸 MealPlan 초대가 없습니다.
                    </div>
                )}
            </section>
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">친구 목록</h2>
                {isFriendMealsLoading ? (
                    <span className="text-caption-regular text-gray-5">
                        친구 식사 상태를 불러오는 중입니다.
                    </span>
                ) : (
                    <FriendListSection
                        friendList={friendList}
                        activeFilter={{ key: 'all', label: '전체' }}
                    />
                )}
            </section>
        </div>
    )
}
