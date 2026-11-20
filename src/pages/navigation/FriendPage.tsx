import { useMemo, useState, type ReactNode } from 'react'
import { MealStatusToggleButton, TabHeader } from '@/components'
import { BottomSheetPortal } from '@/components/shared'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'
import {
    useAcceptFriendRequest,
    useAcceptMealPlanInvite,
    useAllFriendMeals,
    useBlockMember,
    useDeclineMealPlanInvite,
    useIncomingFriendRequests,
    useNearbyFriendMealPlans,
    useReceivedMealPlanInvites,
    useRejectFriendRequest,
    useRemoveFriend,
    useRequestJoinMealPlan,
    useSearchFriends,
    useSendFriendRequest,
    useSentMealPlanInvites
} from '@/apis'
import { usePageChrome } from '@/hooks/usePageChrome'
import { Link, useNavigate } from '@/navigation'

type FriendTopTabKey = 'friends' | 'nearby' | 'invites'

const FRIEND_SHEET_CLOSED_SNAP_POINT = 28
const FRIEND_SHEET_Z_INDEX = 0
const FRIEND_SHEET_OPEN_Z_INDEX = 1000

const friendTopTabs: Array<{ key: FriendTopTabKey; label: string }> = [
    { key: 'nearby', label: '근처 밥약' },
    { key: 'invites', label: '초대' }
]

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
    getNumber(value, [
        'memberId',
        'friendMemberId',
        'targetMemberId',
        'userId',
        'id'
    ])

const getDisplayName = (value: unknown): string =>
    getString(value, ['userName', 'username', 'nickname', 'name', 'email'])

const getRequester = (value: unknown) => asRecord(value).requester

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

interface FriendRow {
    memberId: number
    userName: string
    profileImageUrl: string
    hungry: boolean
    label: string
}

interface MemberSearchRow {
    memberId: number
    userName: string
    profileImageUrl: string
}

interface FriendRequestRow extends MemberSearchRow {
    requestId: number
}

export function FriendPage() {
    const [activeTopTab, setActiveTopTab] = useState<FriendTopTabKey>('nearby')
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
        <div className="flex min-h-full flex-col gap-18 pt-12">
            <TabHeader
                tabs={friendTopTabs}
                activeTab={activeTopTab}
                onTabChange={tab => setActiveTopTab(tab as FriendTopTabKey)}
            />

            {activeTopTab === 'nearby' && <NearbyMealPlansTab />}
            {activeTopTab === 'invites' && <MealPlanInvitesTab />}

            <FriendManagementSheet />
        </div>
    )
}

function FriendManagementSheet() {
    const navigate = useNavigate()
    const [keyword, setKeyword] = useState('')
    const { data: friendMeals, isLoading: isFriendMealsLoading } =
        useAllFriendMeals()
    const { data: searchResults, isFetching: isSearching } =
        useSearchFriends(keyword)
    const { data: incomingRequests } = useIncomingFriendRequests()
    const sendFriendRequest = useSendFriendRequest()
    const acceptFriendRequest = useAcceptFriendRequest()
    const rejectFriendRequest = useRejectFriendRequest()
    const blockMember = useBlockMember()
    const removeFriend = useRemoveFriend()

    const friendList = useMemo<FriendRow[]>(
        () =>
            ((friendMeals ?? []) as unknown[])
                .filter((friend: unknown) =>
                    getDisplayName(friend).includes(keyword)
                )
                .map((friend: unknown) => ({
                    memberId: getMemberId(friend) ?? 0,
                    userName: getDisplayName(friend),
                    profileImageUrl: getString(friend, ['profileImageUrl'], ''),
                    hungry: Boolean(asRecord(friend).hungry),
                    label: getString(friend, ['label'], '')
                })),
        [friendMeals, keyword]
    )
    const memberSearchResults = useMemo<MemberSearchRow[]>(
        () =>
            ((searchResults ?? []) as unknown[])
                .map((member: unknown) => ({
                    memberId: getMemberId(member) ?? 0,
                    userName: getDisplayName(member),
                    profileImageUrl: getString(member, ['profileImageUrl'], '')
                }))
                .filter(member => member.memberId > 0),
        [searchResults]
    )
    const requests = useMemo<FriendRequestRow[]>(
        () =>
            ((incomingRequests ?? []) as unknown[])
                .map((request: unknown) => {
                    const requester = getRequester(request)
                    return {
                        requestId: getNumber(request, ['requestId']) ?? 0,
                        memberId: getMemberId(requester) ?? 0,
                        userName: getDisplayName(requester),
                        profileImageUrl: getString(
                            requester,
                            ['profileImageUrl'],
                            ''
                        )
                    }
                })
                .filter(request => request.requestId > 0),
        [incomingRequests]
    )

    return (
        <BottomSheetPortal
            open={false}
            onClose={() => undefined}
            persistent
            snapPoints={[FRIEND_SHEET_CLOSED_SNAP_POINT, 100]}
            bottomOffset={60}
            zIndex={FRIEND_SHEET_Z_INDEX}
            openZIndex={FRIEND_SHEET_OPEN_Z_INDEX}
            renderInline
            className="max-h-[78vh] w-full overflow-hidden rounded-t-[22px] bg-white shadow-2xl">
            <div className="flex max-h-[78vh] flex-col">
                <div className="flex flex-col gap-13 px-18 pt-10 pb-13">
                    <div className="bg-gray-2 h-4 w-40 self-center rounded-full" />
                    <div>
                        <h2 className="text-title2-semibold text-gray-8">
                            친구 관리
                        </h2>
                        <p className="text-caption-regular text-gray-5 mt-4">
                            친구를 찾고 요청을 확인해요.
                        </p>
                    </div>
                </div>

                <div className="no-drag min-h-0 flex-1 overflow-y-auto px-18 pb-16">
                    <div className="flex flex-col gap-18">
                        <section className="flex flex-col gap-10">
                            <FriendSearchInput handleSearch={setKeyword} />
                            {keyword.trim() && (
                                <div className="rounded-20 bg-gray-1 flex flex-col gap-10 p-14">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-body1-semibold text-gray-8">
                                            멤버 검색
                                        </h3>
                                        {isSearching && (
                                            <span className="text-caption-regular text-gray-5">
                                                검색 중
                                            </span>
                                        )}
                                    </div>
                                    {memberSearchResults.length ? (
                                        memberSearchResults.map(member => (
                                            <FriendActionRow
                                                key={member.memberId}
                                                name={member.userName}
                                                profileImageUrl={
                                                    member.profileImageUrl
                                                }
                                                description="밥먹댕 멤버"
                                                actions={
                                                    <ActionButton
                                                        label="친구 요청"
                                                        disabled={
                                                            sendFriendRequest.isPending
                                                        }
                                                        onClick={() =>
                                                            sendFriendRequest.mutate(
                                                                member.memberId
                                                            )
                                                        }
                                                    />
                                                }
                                            />
                                        ))
                                    ) : (
                                        <span className="text-caption-regular text-gray-5">
                                            검색 결과가 없습니다.
                                        </span>
                                    )}
                                </div>
                            )}
                        </section>

                        {requests.length > 0 && (
                            <section className="flex flex-col gap-12">
                                <h3 className="text-body1-semibold text-gray-8">
                                    받은 친구 요청
                                </h3>
                                <div className="flex flex-col gap-10">
                                    {requests.map(request => (
                                        <FriendActionRow
                                            key={request.requestId}
                                            name={request.userName}
                                            profileImageUrl={
                                                request.profileImageUrl
                                            }
                                            description="친구 요청을 보냈어요."
                                            actions={
                                                <div className="flex gap-6">
                                                    <ActionButton
                                                        label="수락"
                                                        disabled={
                                                            acceptFriendRequest.isPending
                                                        }
                                                        onClick={() =>
                                                            acceptFriendRequest.mutate(
                                                                request.requestId
                                                            )
                                                        }
                                                    />
                                                    <ActionButton
                                                        label="거절"
                                                        tone="muted"
                                                        disabled={
                                                            rejectFriendRequest.isPending
                                                        }
                                                        onClick={() =>
                                                            rejectFriendRequest.mutate(
                                                                request.requestId
                                                            )
                                                        }
                                                    />
                                                </div>
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        <MealStatusToggleButton />

                        <section className="flex flex-col gap-12">
                            <h3 className="text-body1-semibold text-gray-8">
                                친구 목록
                            </h3>
                            {isFriendMealsLoading ? (
                                <span className="text-caption-regular text-gray-5">
                                    친구 식사 상태를 불러오는 중입니다.
                                </span>
                            ) : friendList.length ? (
                                <div className="flex flex-col gap-10">
                                    {friendList.map(friend => (
                                        <FriendActionRow
                                            key={friend.memberId}
                                            name={friend.userName}
                                            profileImageUrl={
                                                friend.profileImageUrl
                                            }
                                            description={
                                                friend.hungry
                                                    ? '지금 밥약 가능'
                                                    : friend.label || '친구'
                                            }
                                            actions={
                                                <div className="flex gap-6">
                                                    <ActionButton
                                                        label="차단"
                                                        tone="muted"
                                                        disabled={
                                                            blockMember.isPending
                                                        }
                                                        onClick={() =>
                                                            blockMember.mutate(
                                                                friend.memberId
                                                            )
                                                        }
                                                    />
                                                    <ActionButton
                                                        label="삭제"
                                                        tone="danger"
                                                        disabled={
                                                            removeFriend.isPending
                                                        }
                                                        onClick={() =>
                                                            removeFriend.mutate(
                                                                friend.memberId
                                                            )
                                                        }
                                                    />
                                                </div>
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-18 bg-gray-1 flex flex-col gap-12 p-14">
                                    <span className="text-caption-regular text-gray-5">
                                        친구 목록이 없습니다.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/friend/add')}
                                        className="bg-gray-8 text-body2-semibold h-44 rounded-full text-white">
                                        친구 추가하기
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </BottomSheetPortal>
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

function FriendActionRow({
    name,
    profileImageUrl,
    description,
    actions
}: {
    name: string
    profileImageUrl?: string
    description: string
    actions: ReactNode
}) {
    return (
        <div className="rounded-18 flex items-center gap-12 bg-white p-13">
            {profileImageUrl ? (
                <img
                    src={profileImageUrl}
                    alt=""
                    className="h-42 w-42 rounded-full object-cover"
                />
            ) : (
                <div className="bg-primary-100 text-primary-main text-body2-semibold grid h-42 w-42 place-items-center rounded-full">
                    {name.slice(0, 1)}
                </div>
            )}
            <div className="min-w-0 flex-1">
                <span className="text-body2-semibold text-gray-8 block truncate">
                    {name}
                </span>
                <span className="text-caption-regular text-gray-5 block truncate">
                    {description}
                </span>
            </div>
            {actions}
        </div>
    )
}

function ActionButton({
    label,
    tone = 'primary',
    disabled,
    onClick
}: {
    label: string
    tone?: 'primary' | 'muted' | 'danger'
    disabled?: boolean
    onClick: () => void
}) {
    const toneClass =
        tone === 'danger'
            ? 'bg-red-50 text-red-500'
            : tone === 'muted'
              ? 'bg-gray-1 text-gray-6'
              : 'bg-gray-8 text-white'

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`text-caption-medium rounded-full px-12 py-8 disabled:opacity-40 ${toneClass}`}>
            {label}
        </button>
    )
}
