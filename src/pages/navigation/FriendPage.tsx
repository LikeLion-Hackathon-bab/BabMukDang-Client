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
import { Friend } from '@/components/features/friend/FriendListSection'
import { FriendSearchInput } from '@/components/features/friend/FriendSearchInput'

// TODO: fixture 제거
const friendFixture: Friend[] = [
    {
        memberId: 1,
        userName: '김철수',
        profileImageUrl: '',
        hungry: true,
        label: '밥이 먹고싶어요'
    },
    {
        memberId: 2,
        userName: '김영희',
        profileImageUrl: '',
        hungry: false,
        label: '밥이 먹고싶어요'
    },
    {
        memberId: 3,
        userName: '김민수',
        profileImageUrl: '',
        hungry: true,
        label: '밥이 먹고싶어요'
    },
    {
        memberId: 4,
        userName: '김민희',
        profileImageUrl: '',
        hungry: false,
        label: '밥이 먹고싶어요'
    }
]
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
     * Friend List
     */
    // TODO: Friend List API Call
    const [friendList, setFriendList] = useState<Friend[]>(friendFixture)
    const handleSearch = (search: string) => {
        setFriendList(
            friendList.filter(friend => friend.userName.includes(search))
        )
    }

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
