import { useMemo, useState } from 'react'
import {
    FilterList,
    MealPlanCreateSheet,
    MyMealPlanCard,
    TabHeader
} from '@/components'
import {
    useAcceptMealPlanInvite,
    useDeclineMealPlanInvite,
    useMyMealPlanCards,
    useNearbyFriendMealPlans,
    useReceivedMealPlanInvites,
    useRequestJoinMealPlan,
    useSentMealPlanInvites
} from '@/apis'
import { usePageChrome } from '@/hooks/usePageChrome'
import { Link, useNavigate } from '@/navigation'
import type { MealPlanCardView } from '@/viewModels'

type TopTabKey = 'my' | 'nearby' | 'invites'
type MyMealPlanSegmentKey = 'deciding' | 'upcoming' | 'recordNeeded' | 'past'
type MyMealPlanGroups = Record<MyMealPlanSegmentKey, MealPlanCardView[]>

const emptyGroups: MyMealPlanGroups = {
    deciding: [],
    upcoming: [],
    recordNeeded: [],
    past: []
}

const topTabs: Array<{ key: TopTabKey; label: string }> = [
    { key: 'my', label: '내 밥약' },
    { key: 'nearby', label: '근처 밥약' },
    { key: 'invites', label: '초대' }
]

const segments: Array<{
    key: MyMealPlanSegmentKey
    label: string
    emptyText: string
}> = [
    {
        key: 'deciding',
        label: '정하는중',
        emptyText: '정하는 중인 밥약이 없습니다.'
    },
    { key: 'upcoming', label: '예정', emptyText: '예정된 밥약이 없습니다.' },
    {
        key: 'recordNeeded',
        label: '기록필요',
        emptyText: '기록이 필요한 밥약이 없습니다.'
    },
    { key: 'past', label: '지난', emptyText: '지난 밥약이 없습니다.' }
]

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

const joinRequestLabel = (status: string | null | undefined) => {
    if (status === 'PENDING') return '요청 중'
    if (status === 'ACCEPTED') return '참여 완료'
    if (status === 'REJECTED') return '거절됨'
    if (status === 'CANCELLED') return '취소됨'
    return '참여 요청'
}

const formatDistance = (distanceMeters: number) =>
    distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(1)}km`
        : `${distanceMeters}m`

export function MyMealPlansPage() {
    const [activeTopTab, setActiveTopTab] = useState<TopTabKey>('my')
    const [activeSegment, setActiveSegment] =
        useState<MyMealPlanSegmentKey>('deciding')
    const { data, isLoading, error } = useMyMealPlanCards()
    const rawGroups = data as Partial<MyMealPlanGroups> | undefined
    const groups: MyMealPlanGroups = {
        deciding: rawGroups?.deciding ?? [],
        upcoming: rawGroups?.upcoming ?? [],
        recordNeeded: rawGroups?.recordNeeded ?? [],
        past: rawGroups?.past ?? []
    }
    const activePlans = groups[activeSegment]
    const totalActiveCount = useMemo(
        () => groups.deciding.length + groups.recordNeeded.length,
        [groups.deciding.length, groups.recordNeeded.length]
    )
    const pageChromeConfig = useMemo(
        () => ({
            header: {
                visible: false
            }
        }),
        []
    )

    usePageChrome(pageChromeConfig)

    return (
        <div className="flex flex-col gap-20">
            <TabHeader
                tabs={topTabs}
                activeTab={activeTopTab}
                onTabChange={tab => setActiveTopTab(tab as TopTabKey)}
            />

            {activeTopTab === 'my' && (
                <MyMealPlansTab
                    groups={groups}
                    activeSegment={activeSegment}
                    activePlans={activePlans}
                    isLoading={isLoading}
                    error={error}
                    onChangeSegment={setActiveSegment}
                />
            )}
            {activeTopTab === 'nearby' && <NearbyMealPlansTab />}
            {activeTopTab === 'invites' && <MealPlanInvitesTab />}

            <MealPlanCreateSheet
                open={false}
                onClose={() => undefined}
                persistent
            />
        </div>
    )
}

function MyMealPlansTab({
    groups,
    activeSegment,
    activePlans,
    isLoading,
    error,
    onChangeSegment
}: {
    groups: MyMealPlanGroups
    activeSegment: MyMealPlanSegmentKey
    activePlans: MealPlanCardView[]
    isLoading: boolean
    error: unknown
    onChangeSegment: (segment: MyMealPlanSegmentKey) => void
}) {
    const activeSegmentMeta = segments.find(
        segment => segment.key === activeSegment
    )
    const segmentFilters = segments.map(segment => {
        const count = groups[segment.key].length
        return {
            key: segment.key,
            label: count > 0 ? `${segment.label} ${count}` : segment.label
        }
    })
    const activeFilter =
        segmentFilters.find(filter => filter.key === activeSegment) ??
        segmentFilters[0]

    return (
        <>
            <FilterList
                filterList={segmentFilters}
                activeFilter={activeFilter}
                setActiveFilter={filter =>
                    onChangeSegment(filter.key as MyMealPlanSegmentKey)
                }
                className="overflow-x-auto pb-2"
            />

            {isLoading ? (
                <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-18">
                    내 밥약을 불러오는 중입니다.
                </div>
            ) : error ? (
                <div className="rounded-20 text-caption-regular bg-white p-18 text-red-500">
                    내 밥약을 불러오지 못했습니다.
                </div>
            ) : (
                <section className="flex flex-col gap-12">
                    <h2 className="text-title2-semibold text-gray-8">
                        {activeSegmentMeta?.label}
                    </h2>
                    {activePlans.length === 0 ? (
                        <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-18">
                            {activeSegmentMeta?.emptyText}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-12">
                            {activePlans.map(mealPlan => (
                                <MyMealPlanCard
                                    key={mealPlan.mealPlanId}
                                    mealPlan={mealPlan}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </>
    )
}

function NearbyMealPlansTab() {
    const {
        data: nearbyFriendMealPlans,
        isLoading,
        error
    } = useNearbyFriendMealPlans()
    const { mutate: requestJoin, isPending: isRequesting } =
        useRequestJoinMealPlan()

    if (isLoading) {
        return (
            <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                근처 밥약을 불러오는 중입니다.
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-20 text-caption-regular bg-white p-16 text-red-500">
                근처 밥약을 불러오지 못했습니다.
            </div>
        )
    }

    return (
        <section className="flex flex-col gap-12">
            <h2 className="text-title2-semibold text-gray-8">근처 밥약</h2>
            {nearbyFriendMealPlans?.length ? (
                <div className="flex flex-col gap-10">
                    {nearbyFriendMealPlans.map(mealPlan => (
                        <article
                            key={mealPlan.mealPlanId}
                            className="rounded-20 flex flex-col gap-12 bg-white p-16">
                            <Link
                                to={`/meal-plans/${mealPlan.mealPlanId}/decision`}>
                                <span className="text-body1-semibold text-gray-8">
                                    {mealPlan.title}
                                </span>
                                <p className="text-caption-regular text-gray-5 mt-3">
                                    {mealPlan.owner.username} ·{' '}
                                    {formatDistance(mealPlan.distanceMeters)} ·{' '}
                                    {mealPlan.participantCount}명
                                </p>
                            </Link>
                            <button
                                type="button"
                                disabled={
                                    isRequesting ||
                                    mealPlan.joinRequestStatus === 'PENDING' ||
                                    mealPlan.joinRequestStatus === 'ACCEPTED'
                                }
                                onClick={() =>
                                    requestJoin({
                                        mealPlanId: mealPlan.mealPlanId,
                                        body: { message: '' }
                                    })
                                }
                                className="rounded-24 bg-gray-8 text-caption-medium disabled:bg-gray-3 disabled:text-gray-5 px-14 py-10 text-white">
                                {joinRequestLabel(mealPlan.joinRequestStatus)}
                            </button>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                    현재 노출된 친구 밥약이 없습니다.
                </div>
            )}
        </section>
    )
}

function MealPlanInvitesTab() {
    const navigate = useNavigate()
    const { data: receivedInvites, isLoading: isReceivedLoading } =
        useReceivedMealPlanInvites()
    const { data: sentInvites, isLoading: isSentLoading } =
        useSentMealPlanInvites()
    const { mutate: acceptInvite, isPending: isAccepting } =
        useAcceptMealPlanInvite({
            onSuccess: mealPlan => {
                if (mealPlan)
                    navigate(`/meal-plans/${mealPlan.mealPlanId}/decision`)
            }
        })
    const { mutate: declineInvite, isPending: isDeclining } =
        useDeclineMealPlanInvite()

    return (
        <section className="flex flex-col gap-18">
            <div className="flex flex-col gap-12">
                <h2 className="text-title2-semibold text-gray-8">받은 초대</h2>
                {isReceivedLoading ? (
                    <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                        받은 초대를 불러오는 중입니다.
                    </div>
                ) : receivedInvites?.length ? (
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
                                                {invite.inviter.username}님의
                                                밥약 초대
                                            </span>
                                            <p className="text-caption-regular text-gray-5">
                                                {invite.message ||
                                                    '같이 밥 먹자는 초대가 도착했습니다.'}
                                            </p>
                                        </div>
                                        <span className="rounded-20 bg-gray-1 text-caption-medium text-gray-6 px-10 py-5">
                                            {inviteStatusLabel(invite.status)}
                                        </span>
                                    </div>
                                    {isPending ? (
                                        <div className="grid grid-cols-2 gap-8">
                                            <button
                                                type="button"
                                                disabled={
                                                    isAccepting || isDeclining
                                                }
                                                data-testid={`meal-plan-invite-accept-${invite.inviteId}`}
                                                onClick={() =>
                                                    acceptInvite(
                                                        invite.inviteId
                                                    )
                                                }
                                                className="rounded-30 bg-gray-8 text-caption-medium py-10 text-white disabled:opacity-40">
                                                수락
                                            </button>
                                            <button
                                                type="button"
                                                disabled={
                                                    isAccepting || isDeclining
                                                }
                                                data-testid={`meal-plan-invite-decline-${invite.inviteId}`}
                                                onClick={() =>
                                                    declineInvite(
                                                        invite.inviteId
                                                    )
                                                }
                                                className="rounded-30 bg-gray-2 text-caption-medium text-gray-7 py-10 disabled:opacity-40">
                                                거절
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to={`/meal-plans/${invite.mealPlanId}/decision`}
                                            className="rounded-30 bg-gray-1 text-caption-medium text-gray-7 py-10 text-center">
                                            밥약 보기
                                        </Link>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                        받은 MealPlan 초대가 없습니다.
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-12">
                <h2 className="text-title2-semibold text-gray-8">보낸 초대</h2>
                {isSentLoading ? (
                    <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                        보낸 초대를 불러오는 중입니다.
                    </div>
                ) : sentInvites?.length ? (
                    <div className="flex flex-col gap-8">
                        {sentInvites.map(invite => (
                            <Link
                                key={invite.inviteId}
                                to={`/meal-plans/${invite.mealPlanId}/decision`}
                                className="rounded-20 bg-white p-16">
                                <span className="text-body2-medium text-gray-8">
                                    {invite.invitee.username}님에게 보낸 초대
                                </span>
                                <p className="text-caption-regular text-gray-5 mt-3">
                                    {inviteStatusLabel(invite.status)}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                        보낸 MealPlan 초대가 없습니다.
                    </div>
                )}
            </div>
        </section>
    )
}
