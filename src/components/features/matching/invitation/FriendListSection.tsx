import { useState } from 'react'
import { FriendCard } from './InvitationFriendCard'
import { FilterList, SearchInput } from '@/components'
import { INVITATION_FILTER_LIST } from '@/constants/filters'

type Friend = {
    memberId: number
    userName: string
    profileImageUrl: string
    hungry: boolean
    label: string
}

export function FriendListSection({ friendList }: { friendList: Friend[] }) {
    const [activeFilter, setActiveFilter] = useState<{
        key: string
        label: string
    }>(INVITATION_FILTER_LIST[0])
    const [filteredFriendList, setFilteredFriendList] =
        useState<Friend[]>(friendList)
    const handleSearch = (search: string) => {
        setFilteredFriendList(
            friendList.filter(friend => friend.userName.includes(search))
        )
    }
    console.log('filteredFriendList', filteredFriendList)
    return (
        <div className="flex w-full flex-col gap-16">
            <div className="flex flex-col gap-16">
                <span className="text-title2-bold text-gray-8">친구목록</span>
                <SearchInput
                    handleSearch={handleSearch}
                    placeholder="친구 검색하기"
                />
            </div>
            <div className="flex flex-col gap-12">
                <FilterList
                    filterList={INVITATION_FILTER_LIST}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    className="self-start"
                />
                <div className="flex flex-col gap-10">
                    {filteredFriendList
                        .filter(friend =>
                            activeFilter.key === 'all'
                                ? true
                                : friend.hungry ===
                                  (activeFilter.key === 'hungry')
                        )
                        .map(friend => (
                            <FriendCard
                                friend={friend}
                                key={friend.memberId}
                            />
                        ))}
                </div>
            </div>
        </div>
    )
}
