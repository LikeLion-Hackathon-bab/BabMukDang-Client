import { useMemo, useState } from 'react'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'
import { useSearchFriends, useSendFriendRequest } from '@/apis'
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

interface MemberSearchRow {
    memberId: number
    userName: string
    profileImageUrl: string
}

export function FriendAddPage() {
    const [keyword, setKeyword] = useState('')
    const { data: searchResults, isFetching } = useSearchFriends(keyword)
    const sendFriendRequest = useSendFriendRequest()
    const pageChromeConfig = useMemo(
        () => ({
            header: {
                title: '친구 추가'
            },
            bottomNav: {
                visible: false
            }
        }),
        []
    )
    usePageChrome(pageChromeConfig)

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

    return (
        <div className="flex flex-col gap-18 pt-18">
            <FriendSearchInput handleSearch={setKeyword} />

            {!keyword.trim() ? (
                <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                    친구 이름을 검색해보세요.
                </div>
            ) : isFetching ? (
                <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                    친구를 검색하는 중입니다.
                </div>
            ) : memberSearchResults.length ? (
                <section className="flex flex-col gap-10">
                    {memberSearchResults.map(member => (
                        <div
                            key={member.memberId}
                            className="rounded-18 flex items-center gap-12 bg-white p-13">
                            {member.profileImageUrl ? (
                                <img
                                    src={member.profileImageUrl}
                                    alt=""
                                    className="h-42 w-42 rounded-full object-cover"
                                />
                            ) : (
                                <div className="bg-primary-100 text-primary-main text-body2-semibold grid h-42 w-42 place-items-center rounded-full">
                                    {member.userName.slice(0, 1)}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <span className="text-body2-semibold text-gray-8 block truncate">
                                    {member.userName}
                                </span>
                                <span className="text-caption-regular text-gray-5 block truncate">
                                    밥먹댕 멤버
                                </span>
                            </div>
                            <button
                                type="button"
                                disabled={sendFriendRequest.isPending}
                                onClick={() =>
                                    sendFriendRequest.mutate(member.memberId)
                                }
                                className="bg-gray-8 text-caption-medium rounded-full px-12 py-8 text-white disabled:opacity-40">
                                요청
                            </button>
                        </div>
                    ))}
                </section>
            ) : (
                <div className="rounded-20 text-caption-regular text-gray-5 bg-white p-16">
                    검색 결과가 없습니다.
                </div>
            )}
        </div>
    )
}
