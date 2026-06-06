import {
    FilterList,
    FriendInviteModal,
    FriendListSection,
    InvitationToggleButton
} from '@/components'
import { FriendInviteButton } from '@/components/features/friend/FriendInviteButton'
import { useEffect, useState } from 'react'
import { useHeaderStore } from '@/store/headerStore'
import { INVITATION_FILTER_LIST } from '@/constants/filters'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'
import { useAllFriendMeals } from '@/apis'

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

    /**
     * Friend List (식사 상태 기준 친구 목록: GET /friends/me/meals)
     */
    const { data: friendMeals } = useAllFriendMeals()
    const [keyword, setKeyword] = useState('')
    const friendList = (friendMeals ?? []).filter(friend =>
        friend.userName.includes(keyword)
    )
    const handleSearch = (search: string) => setKeyword(search)

    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(INVITATION_FILTER_LIST[0])
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
                    <FriendListSection
                        friendList={friendList}
                        activeFilter={activeFilter}
                    />
                </div>
            </div>
            <FriendInviteModal id="friend-invite-notify-modal" />
        </div>
    )
}
