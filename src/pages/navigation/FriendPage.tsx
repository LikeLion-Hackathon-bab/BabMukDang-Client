import { useMemo, useState, type ReactNode } from 'react'
import { MealStatusToggleButton } from '@/components'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'
import {
    useAcceptFriendRequest,
    useAllFriendMeals,
    useBlockMember,
    useIncomingFriendRequests,
    useRejectFriendRequest,
    useRemoveFriend,
    useSearchFriends,
    useSendFriendRequest
} from '@/apis'
import { usePageChrome } from '@/hooks/usePageChrome'

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
    const [keyword, setKeyword] = useState('')
    const pageChromeConfig = useMemo(
        () => ({
            header: {
                title: '친구',
                showLeftButton: false,
                showRightButton: false,
                right: (
                    <div
                        className="h-34 w-34"
                        aria-hidden
                    />
                )
            }
        }),
        []
    )
    usePageChrome(pageChromeConfig)

    const { data: friendMeals, isLoading: isFriendMealsLoading } =
        useAllFriendMeals()
    const { data: searchResults, isFetching: isSearching } =
        useSearchFriends(keyword)
    const { data: incomingRequests, isLoading: isIncomingLoading } =
        useIncomingFriendRequests()
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
        <div className="mt-20 flex flex-col gap-24">
            <section className="flex flex-col gap-10">
                <FriendSearchInput handleSearch={setKeyword} />
                {keyword.trim() && (
                    <div className="rounded-20 flex flex-col gap-10 bg-white p-14">
                        <div className="flex items-center justify-between">
                            <h2 className="text-body1-semibold text-gray-8">
                                멤버 검색
                            </h2>
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
                                    profileImageUrl={member.profileImageUrl}
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

            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">
                    받은 친구 요청
                </h2>
                {isIncomingLoading ? (
                    <span className="text-caption-regular text-gray-5">
                        친구 요청을 불러오는 중입니다.
                    </span>
                ) : requests.length ? (
                    <div className="flex flex-col gap-10">
                        {requests.map(request => (
                            <FriendActionRow
                                key={request.requestId}
                                name={request.userName}
                                profileImageUrl={request.profileImageUrl}
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
                ) : (
                    <span className="text-caption-regular text-gray-5">
                        받은 친구 요청이 없습니다.
                    </span>
                )}
            </section>

            <MealStatusToggleButton />
            <section className="flex flex-col gap-12">
                <h2 className="text-body1-semibold text-gray-8">친구 목록</h2>
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
                                profileImageUrl={friend.profileImageUrl}
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
                                            disabled={blockMember.isPending}
                                            onClick={() =>
                                                blockMember.mutate(
                                                    friend.memberId
                                                )
                                            }
                                        />
                                        <ActionButton
                                            label="삭제"
                                            tone="danger"
                                            disabled={removeFriend.isPending}
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
                    <span className="text-caption-regular text-gray-5">
                        친구 목록이 없습니다.
                    </span>
                )}
            </section>
        </div>
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
