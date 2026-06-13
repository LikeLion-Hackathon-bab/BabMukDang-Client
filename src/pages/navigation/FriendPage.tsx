import {
    FilterList,
    FriendInviteModal,
    FriendListSection,
    InvitationToggleButton
} from '@/components'
import { FriendInviteButton } from '@/components/features/friend/FriendInviteButton'
import { useEffect, useMemo, useState } from 'react'
import { useHeaderStore } from '@/store/headerStore'
import { INVITATION_FILTER_LIST } from '@/constants/filters'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'
import {
    useAcceptFriendRequest,
    useAllFriendMeals,
    useBlockMember,
    useBlockedMembers,
    useCancelFriendRequest,
    useFriends,
    useIncomingFriendRequests,
    useOutgoingFriendRequests,
    useRejectFriendRequest,
    useRemoveFriend,
    useSearchFriends,
    useSendFriendRequest,
    useUnblockMember
} from '@/apis'
import type { MemberResponse } from '@/apis/types'

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

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

const getString = (value: unknown, keys: string[], fallback = '-'): string => {
    const record = asRecord(value)
    for (const key of keys) {
        const current = record[key]
        if (typeof current === 'string' && current.trim() !== '') return current
        if (typeof current === 'number') return String(current)
    }
    return fallback
}

const getMemberId = (value: unknown): number | null =>
    getNumber(value, [
        'memberId',
        'friendMemberId',
        'targetMemberId',
        'userId',
        'id'
    ])

const getRequestId = (value: unknown): number | null =>
    getNumber(value, ['requestId', 'friendRequestId', 'id'])

const getDisplayName = (value: unknown): string =>
    getString(value, ['userName', 'username', 'nickname', 'name', 'email'])

const getSubText = (value: unknown): string =>
    getString(value, ['email', 'status', 'mealStatus', 'message'], '')

export function FriendPage() {
    /**
     * Header Store
     */
    const { hideLeftButton, setTitle, showRightButton, resetHeader } =
        useHeaderStore()
    useEffect(() => {
        hideLeftButton()
        setTitle('친구')
        return () => {
            resetHeader()
        }
    }, [])

    const [keyword, setKeyword] = useState('')
    const [requestMemberId, setRequestMemberId] = useState('')
    const [blockMemberId, setBlockMemberId] = useState('')

    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(INVITATION_FILTER_LIST[0])

    /**
     * Friend List (식사 상태 기준 친구 목록: GET /friends/me/meals)
     */
    const {
        data: friendMeals,
        isLoading: isFriendMealsLoading,
        error: friendMealsError
    } = useAllFriendMeals()
    const { data: friends, isLoading: isFriendsLoading } = useFriends()
    const { data: searchedFriends, isLoading: isSearchLoading } =
        useSearchFriends(keyword)
    const { data: blockedMembers, isLoading: isBlocksLoading } =
        useBlockedMembers()
    const { data: incomingRequests, isLoading: isIncomingLoading } =
        useIncomingFriendRequests()
    const { data: outgoingRequests, isLoading: isOutgoingLoading } =
        useOutgoingFriendRequests()

    const { mutate: sendRequest, isPending: isSendPending } =
        useSendFriendRequest({
            onSuccess: () => setRequestMemberId('')
        })
    const { mutate: acceptRequest, isPending: isAcceptPending } =
        useAcceptFriendRequest()
    const { mutate: rejectRequest, isPending: isRejectPending } =
        useRejectFriendRequest()
    const { mutate: cancelRequest, isPending: isCancelPending } =
        useCancelFriendRequest()
    const { mutate: blockMember, isPending: isBlockPending } = useBlockMember({
        onSuccess: () => setBlockMemberId('')
    })
    const { mutate: unblockMember, isPending: isUnblockPending } =
        useUnblockMember()
    const { mutate: removeFriend, isPending: isRemovePending } =
        useRemoveFriend()

    const friendList = useMemo(
        () =>
            (friendMeals ?? [])
                .filter(friend => getDisplayName(friend).includes(keyword))
                .map(friend => ({
                    memberId: getMemberId(friend) ?? 0,
                    userName: getDisplayName(friend),
                    profileImageUrl: getString(friend, ['profileImageUrl'], ''),
                    hungry: Boolean(asRecord(friend).hungry),
                    label: getString(friend, ['label'], '')
                })),
        [friendMeals, keyword]
    )

    const searchResultList: MemberResponse[] = searchedFriends ?? []
    const myFriendList = friends ?? []
    const blockedMemberList = blockedMembers ?? []
    const incomingRequestList = incomingRequests ?? []
    const outgoingRequestList = outgoingRequests ?? []

    const handleSearch = (search: string) => setKeyword(search)

    const handleSendRequest = () => {
        const memberId = Number(requestMemberId)
        // if (!Number.isFinite(memberId) || memberId <= 0) return
        sendRequest(memberId)
    }

    const handleBlockMember = () => {
        const memberId = Number(blockMemberId)
        if (!Number.isFinite(memberId) || memberId <= 0) return
        blockMember(memberId)
    }

    const actionDisabled =
        isSendPending ||
        isAcceptPending ||
        isRejectPending ||
        isCancelPending ||
        isBlockPending ||
        isUnblockPending ||
        isRemovePending

    return (
        <div className="mt-20 flex flex-col gap-24">
            <div className="flex flex-col gap-10">
                <FriendSearchInput handleSearch={handleSearch} />
                <FriendInviteButton className="border-0" />
            </div>
            <InvitationToggleButton />
            <div className="flex w-full flex-col gap-10">
                <span className="text-body1-semibold text-gray-8">
                    친구목록
                </span>
                <div className="flex flex-col gap-12">
                    <FilterList
                        filterList={INVITATION_FILTER_LIST}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        className="text-caption-medium self-start"
                    />
                    {isFriendMealsLoading ? (
                        <span className="text-caption-regular text-gray-5">
                            친구 식사 상태를 불러오는 중입니다.
                        </span>
                    ) : friendMealsError ? (
                        <span className="text-caption-regular text-red-500">
                            친구 식사 상태를 불러오지 못했습니다.
                        </span>
                    ) : (
                        <FriendListSection
                            friendList={friendList}
                            activeFilter={activeFilter}
                        />
                    )}
                </div>
            </div>

            <section className="flex flex-col gap-10">
                <span className="text-body1-semibold text-gray-8">
                    친구 검색 결과
                </span>
                {keyword.trim().length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        이름을 검색하면 친구 요청을 보낼 수 있습니다.
                    </span>
                ) : isSearchLoading ? (
                    <span className="text-caption-regular text-gray-5">
                        검색 중입니다.
                    </span>
                ) : searchResultList.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        검색 결과가 없습니다.
                    </span>
                ) : (
                    <div className="flex flex-col gap-8">
                        {searchResultList.map((member: MemberResponse) => {
                            const memberId = getMemberId(member)
                            return (
                                <div
                                    key={`search-${memberId ?? getDisplayName(member)}`}
                                    className="rounded-12 border-gray-2 flex items-center justify-between border p-12">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-body2-semibold text-gray-8">
                                            {getDisplayName(member)}
                                        </span>
                                        {getSubText(member) && (
                                            <span className="text-caption-regular text-gray-5">
                                                {getSubText(member)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!memberId || actionDisabled}
                                        onClick={() =>
                                            memberId && sendRequest(memberId)
                                        }
                                        className="text-caption-medium bg-primary-500 rounded-full px-12 py-6 text-white disabled:opacity-40">
                                        친구 요청
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-10">
                <span className="text-body1-semibold text-gray-8">
                    멤버 ID로 친구 요청
                </span>
                <div className="flex gap-8">
                    <input
                        value={requestMemberId}
                        onChange={e => setRequestMemberId(e.target.value)}
                        inputMode="numeric"
                        placeholder="요청할 멤버 ID"
                        className="text-body2-regular rounded-12 border-gray-2 flex-1 border px-12 py-10"
                    />
                    <button
                        type="button"
                        disabled={isSendPending}
                        onClick={handleSendRequest}
                        className="text-body2-semibold rounded-12 bg-primary-500 px-14 py-10 text-white disabled:opacity-40">
                        요청
                    </button>
                </div>
            </section>

            <section className="flex flex-col gap-10">
                <span className="text-body1-semibold text-gray-8">내 친구</span>
                {isFriendsLoading ? (
                    <span className="text-caption-regular text-gray-5">
                        친구 목록을 불러오는 중입니다.
                    </span>
                ) : myFriendList.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        아직 친구가 없습니다.
                    </span>
                ) : (
                    <div className="flex flex-col gap-8">
                        {myFriendList.map(friend => {
                            const memberId = getMemberId(friend)
                            return (
                                <div
                                    key={`friend-${memberId ?? getDisplayName(friend)}`}
                                    className="rounded-12 border-gray-2 flex items-center justify-between border p-12">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-body2-semibold text-gray-8">
                                            {getDisplayName(friend)}
                                        </span>
                                        {getSubText(friend) && (
                                            <span className="text-caption-regular text-gray-5">
                                                {getSubText(friend)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-6">
                                        <button
                                            type="button"
                                            disabled={
                                                !memberId || actionDisabled
                                            }
                                            onClick={() =>
                                                memberId &&
                                                blockMember(memberId)
                                            }
                                            className="text-caption-medium border-gray-3 text-gray-6 rounded-full border px-10 py-6 disabled:opacity-40">
                                            차단
                                        </button>
                                        <button
                                            type="button"
                                            disabled={
                                                !memberId || actionDisabled
                                            }
                                            onClick={() =>
                                                memberId &&
                                                removeFriend(memberId)
                                            }
                                            className="text-caption-medium rounded-full border border-red-300 px-10 py-6 text-red-500 disabled:opacity-40">
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-10">
                <span className="text-body1-semibold text-gray-8">
                    받은 친구 요청
                </span>
                {isIncomingLoading ? (
                    <span className="text-caption-regular text-gray-5">
                        받은 요청을 불러오는 중입니다.
                    </span>
                ) : incomingRequestList.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        받은 친구 요청이 없습니다.
                    </span>
                ) : (
                    <div className="flex flex-col gap-8">
                        {incomingRequestList.map(request => {
                            const requestId = getRequestId(request)
                            return (
                                <div
                                    key={`incoming-${requestId ?? getDisplayName(request)}`}
                                    className="rounded-12 border-gray-2 flex items-center justify-between border p-12">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-body2-semibold text-gray-8">
                                            {getDisplayName(request)}
                                        </span>
                                        {getSubText(request) && (
                                            <span className="text-caption-regular text-gray-5">
                                                {getSubText(request)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-6">
                                        <button
                                            type="button"
                                            disabled={
                                                !requestId || actionDisabled
                                            }
                                            onClick={() =>
                                                requestId &&
                                                acceptRequest(requestId)
                                            }
                                            className="text-caption-medium bg-primary-500 rounded-full px-10 py-6 text-white disabled:opacity-40">
                                            수락
                                        </button>
                                        <button
                                            type="button"
                                            disabled={
                                                !requestId || actionDisabled
                                            }
                                            onClick={() =>
                                                requestId &&
                                                rejectRequest(requestId)
                                            }
                                            className="text-caption-medium border-gray-3 text-gray-6 rounded-full border px-10 py-6 disabled:opacity-40">
                                            거절
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-10">
                <span className="text-body1-semibold text-gray-8">
                    보낸 친구 요청
                </span>
                {isOutgoingLoading ? (
                    <span className="text-caption-regular text-gray-5">
                        보낸 요청을 불러오는 중입니다.
                    </span>
                ) : outgoingRequestList.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        보낸 친구 요청이 없습니다.
                    </span>
                ) : (
                    <div className="flex flex-col gap-8">
                        {outgoingRequestList.map(request => {
                            const requestId = getRequestId(request)
                            return (
                                <div
                                    key={`outgoing-${requestId ?? getDisplayName(request)}`}
                                    className="rounded-12 border-gray-2 flex items-center justify-between border p-12">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-body2-semibold text-gray-8">
                                            {getDisplayName(request)}
                                        </span>
                                        {getSubText(request) && (
                                            <span className="text-caption-regular text-gray-5">
                                                {getSubText(request)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!requestId || actionDisabled}
                                        onClick={() =>
                                            requestId &&
                                            cancelRequest(requestId)
                                        }
                                        className="text-caption-medium border-gray-3 text-gray-6 rounded-full border px-10 py-6 disabled:opacity-40">
                                        취소
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-10">
                <span className="text-body1-semibold text-gray-8">
                    차단 관리
                </span>
                <div className="flex gap-8">
                    <input
                        value={blockMemberId}
                        onChange={e => setBlockMemberId(e.target.value)}
                        inputMode="numeric"
                        placeholder="차단할 멤버 ID"
                        className="text-body2-regular rounded-12 border-gray-2 flex-1 border px-12 py-10"
                    />
                    <button
                        type="button"
                        disabled={isBlockPending}
                        onClick={handleBlockMember}
                        className="text-body2-semibold rounded-12 bg-gray-8 px-14 py-10 text-white disabled:opacity-40">
                        차단
                    </button>
                </div>
                {isBlocksLoading ? (
                    <span className="text-caption-regular text-gray-5">
                        차단 목록을 불러오는 중입니다.
                    </span>
                ) : blockedMemberList.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        차단한 멤버가 없습니다.
                    </span>
                ) : (
                    <div className="flex flex-col gap-8">
                        {blockedMemberList.map(member => {
                            const memberId = getMemberId(member)
                            return (
                                <div
                                    key={`blocked-${memberId ?? getDisplayName(member)}`}
                                    className="rounded-12 border-gray-2 flex items-center justify-between border p-12">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-body2-semibold text-gray-8">
                                            {getDisplayName(member)}
                                        </span>
                                        {getSubText(member) && (
                                            <span className="text-caption-regular text-gray-5">
                                                {getSubText(member)}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!memberId || actionDisabled}
                                        onClick={() =>
                                            memberId && unblockMember(memberId)
                                        }
                                        className="text-caption-medium border-gray-3 text-gray-6 rounded-full border px-10 py-6 disabled:opacity-40">
                                        차단 해제
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            <FriendInviteModal id="friend-invite-notify-modal" />
        </div>
    )
}
