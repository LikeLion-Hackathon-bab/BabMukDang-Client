import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FriendListSection, MealStatusToggleButton } from '@/components'
import { FriendInviteButton } from '@/components/features/friend/FriendInviteButton'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'
import {
    useAcceptFriendRequest,
    useAcceptMealPlanInvite,
    useAllFriendMeals,
    useBlockMember,
    useBlockedMembers,
    useDeclineMealPlanInvite,
    useFriends,
    useIncomingFriendRequests,
    useOutgoingFriendRequests,
    useReceivedMealPlanInvites,
    useRejectFriendRequest,
    useRemoveFriend,
    useSearchFriends,
    useSendFriendRequest,
    useSentMealPlanInvites
} from '@/apis'
import type {
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendRequestItemResponse
} from '@/apis'
import type { MemberCore } from '@kimdaegyu/babmukdang-shared/domain'

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

const getNestedValue = (value: unknown, key: string): unknown =>
    asRecord(value)[key]

const getRequestMember = (value: unknown, key: 'requester' | 'recipient') =>
    getNestedValue(value, key)

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
    const [keyword, setKeyword] = useState('')
    const [memberSearchKeyword, setMemberSearchKeyword] = useState('')
    const { data: friendMeals, isLoading: isFriendMealsLoading } =
        useAllFriendMeals()
    const { data: friends } = useFriends()
    const { data: memberSearchResults, isFetching: isMemberSearchFetching } =
        useSearchFriends(memberSearchKeyword.trim())
    const { data: incomingFriendRequests } = useIncomingFriendRequests()
    const { data: outgoingFriendRequests } = useOutgoingFriendRequests()
    const { data: blockedMembers } = useBlockedMembers()
    const { data: receivedInvites } = useReceivedMealPlanInvites()
    const { data: sentInvites } = useSentMealPlanInvites()
    const { mutate: sendFriendRequest, isPending: isSendingFriendRequest } =
        useSendFriendRequest()
    const { mutate: acceptFriendRequest, isPending: isAcceptingFriendRequest } =
        useAcceptFriendRequest()
    const { mutate: rejectFriendRequest, isPending: isRejectingFriendRequest } =
        useRejectFriendRequest()
    const { mutate: blockMember, isPending: isBlockingMember } =
        useBlockMember()
    const { mutate: removeFriend, isPending: isRemovingFriend } =
        useRemoveFriend()
    const { mutate: acceptInvite } = useAcceptMealPlanInvite({
        onSuccess: mealPlan => {
            if (mealPlan) navigate(`/meal-plans/${mealPlan.mealPlanId}`)
        }
    })
    const { mutate: declineInvite } = useDeclineMealPlanInvite()

    const friendList = useMemo(
        () =>
            (friendMeals ?? [])
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

    const friendActionPending =
        isSendingFriendRequest ||
        isAcceptingFriendRequest ||
        isRejectingFriendRequest ||
        isBlockingMember ||
        isRemovingFriend

    return (
        <div className="mt-20 flex flex-col gap-24">
            <section className="flex flex-col gap-10">
                <FriendSearchInput handleSearch={setKeyword} />
                <FriendInviteButton />
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
            <section className="flex flex-col gap-12">
                <div>
                    <h2 className="text-body1-semibold text-gray-8">
                        친구 관리
                    </h2>
                </div>
                <div className="rounded-20 flex flex-col gap-12 bg-white p-16">
                    <label className="flex flex-col gap-6">
                        <span className="text-caption-medium text-gray-6">
                            member username 검색
                        </span>
                        <input
                            value={memberSearchKeyword}
                            onChange={event =>
                                setMemberSearchKeyword(event.target.value)
                            }
                            placeholder="username을 입력하세요"
                            className="rounded-12 border-gray-2 text-body2-regular text-gray-8 placeholder:text-gray-4 border px-12 py-10 outline-none"
                        />
                    </label>
                    {memberSearchKeyword.trim() ? (
                        <div className="flex flex-col gap-8">
                            {isMemberSearchFetching ? (
                                <span className="text-caption-regular text-gray-5">
                                    member를 검색하는 중입니다.
                                </span>
                            ) : memberSearchResults?.length ? (
                                memberSearchResults.map(
                                    (member: MemberCore) => (
                                        <FriendActionRow
                                            key={member.memberId}
                                            title={member.username}
                                            description={`memberId: ${member.memberId}`}
                                            actions={
                                                <>
                                                    <FriendActionButton
                                                        disabled={
                                                            friendActionPending
                                                        }
                                                        onClick={() =>
                                                            sendFriendRequest(
                                                                member.memberId
                                                            )
                                                        }>
                                                        친구 요청
                                                    </FriendActionButton>
                                                    <FriendActionButton
                                                        variant="danger"
                                                        disabled={
                                                            friendActionPending
                                                        }
                                                        onClick={() =>
                                                            blockMember(
                                                                member.memberId
                                                            )
                                                        }>
                                                        차단
                                                    </FriendActionButton>
                                                </>
                                            }
                                        />
                                    )
                                )
                            ) : (
                                <span className="text-caption-regular text-gray-5">
                                    검색 결과가 없습니다.
                                </span>
                            )}
                        </div>
                    ) : null}
                </div>
                <div className="grid gap-12">
                    <FriendActionPanel title="받은 친구 요청">
                        {incomingFriendRequests?.length ? (
                            incomingFriendRequests.map(
                                (request: FriendRequestItemResponse) => {
                                    const requester = getRequestMember(
                                        request,
                                        'requester'
                                    )
                                    return (
                                        <FriendActionRow
                                            key={request.requestId}
                                            title={getDisplayName(requester)}
                                            description={`requestId: ${request.requestId} · ${request.status}`}
                                            actions={
                                                <>
                                                    <FriendActionButton
                                                        disabled={
                                                            friendActionPending
                                                        }
                                                        onClick={() =>
                                                            acceptFriendRequest(
                                                                request.requestId
                                                            )
                                                        }>
                                                        수락
                                                    </FriendActionButton>
                                                    <FriendActionButton
                                                        variant="muted"
                                                        disabled={
                                                            friendActionPending
                                                        }
                                                        onClick={() =>
                                                            rejectFriendRequest(
                                                                request.requestId
                                                            )
                                                        }>
                                                        거절
                                                    </FriendActionButton>
                                                </>
                                            }
                                        />
                                    )
                                }
                            )
                        ) : (
                            <EmptyActionText>
                                받은 친구 요청이 없습니다.
                            </EmptyActionText>
                        )}
                    </FriendActionPanel>
                    <FriendActionPanel title="보낸 친구 요청">
                        {outgoingFriendRequests?.length ? (
                            outgoingFriendRequests.map(
                                (request: FriendRequestItemResponse) => {
                                    const recipient = getRequestMember(
                                        request,
                                        'recipient'
                                    )
                                    return (
                                        <FriendActionRow
                                            key={request.requestId}
                                            title={getDisplayName(recipient)}
                                            description={`requestId: ${request.requestId} · ${request.status}`}
                                        />
                                    )
                                }
                            )
                        ) : (
                            <EmptyActionText>
                                보낸 친구 요청이 없습니다.
                            </EmptyActionText>
                        )}
                    </FriendActionPanel>
                    <FriendActionPanel title="친구 삭제/차단">
                        {friends?.length ? (
                            friends.map((friend: FriendListItemResponse) => (
                                <FriendActionRow
                                    key={friend.memberId}
                                    title={friend.username}
                                    description={`memberId: ${friend.memberId}`}
                                    actions={
                                        <>
                                            <FriendActionButton
                                                variant="danger"
                                                disabled={friendActionPending}
                                                onClick={() =>
                                                    blockMember(friend.memberId)
                                                }>
                                                차단
                                            </FriendActionButton>
                                            <FriendActionButton
                                                variant="muted"
                                                disabled={friendActionPending}
                                                onClick={() =>
                                                    removeFriend(
                                                        friend.memberId
                                                    )
                                                }>
                                                삭제
                                            </FriendActionButton>
                                        </>
                                    }
                                />
                            ))
                        ) : (
                            <EmptyActionText>친구가 없습니다.</EmptyActionText>
                        )}
                    </FriendActionPanel>
                    <FriendActionPanel title="차단한 member">
                        {blockedMembers?.length ? (
                            blockedMembers.map(
                                (member: FriendBlockItemResponse) => (
                                    <FriendActionRow
                                        key={member.memberId}
                                        title={member.username}
                                        description={`memberId: ${member.memberId}`}
                                    />
                                )
                            )
                        ) : (
                            <EmptyActionText>
                                차단한 member가 없습니다.
                            </EmptyActionText>
                        )}
                    </FriendActionPanel>
                </div>
            </section>
            <MealStatusToggleButton />
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">
                    받은 MealPlan 초대
                </h2>
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
                                                data-testid={`meal-plan-invite-accept-${invite.inviteId}`}
                                                onClick={() =>
                                                    acceptInvite(
                                                        invite.inviteId
                                                    )
                                                }
                                                className="rounded-30 bg-gray-8 text-caption-medium py-10 text-white">
                                                수락
                                            </button>
                                            <button
                                                type="button"
                                                data-testid={`meal-plan-invite-decline-${invite.inviteId}`}
                                                onClick={() =>
                                                    declineInvite(
                                                        invite.inviteId
                                                    )
                                                }
                                                className="rounded-30 bg-gray-2 text-caption-medium text-gray-7 py-10">
                                                거절
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to={`/meal-plans/${invite.mealPlanId}`}
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
            </section>
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">
                    보낸 MealPlan 초대
                </h2>
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
                    <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
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

function FriendActionPanel({
    title,
    children
}: {
    title: string
    children: ReactNode
}) {
    return (
        <section className="rounded-20 flex flex-col gap-10 bg-white p-16">
            <h3 className="text-body2-semibold text-gray-8">{title}</h3>
            <div className="flex flex-col gap-8">{children}</div>
        </section>
    )
}

function FriendActionRow({
    title,
    description,
    actions
}: {
    title: string
    description?: string
    actions?: ReactNode
}) {
    return (
        <div className="rounded-12 bg-gray-1 flex items-center justify-between gap-10 px-12 py-10">
            <div className="min-w-0">
                <p className="text-body2-medium text-gray-8 truncate">
                    {title}
                </p>
                {description ? (
                    <p className="text-caption-regular text-gray-5 truncate">
                        {description}
                    </p>
                ) : null}
            </div>
            {actions ? (
                <div className="flex shrink-0 gap-6">{actions}</div>
            ) : null}
        </div>
    )
}

function FriendActionButton({
    children,
    disabled,
    onClick,
    variant = 'primary'
}: {
    children: ReactNode
    disabled?: boolean
    onClick: () => void
    variant?: 'primary' | 'danger' | 'muted'
}) {
    const className =
        variant === 'danger'
            ? 'bg-red-100 text-red-600'
            : variant === 'muted'
              ? 'bg-gray-2 text-gray-7'
              : 'bg-gray-8 text-white'

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`rounded-30 text-caption-medium px-10 py-8 disabled:opacity-50 ${className}`}>
            {children}
        </button>
    )
}

function EmptyActionText({ children }: { children: ReactNode }) {
    return <span className="text-caption-regular text-gray-5">{children}</span>
}
