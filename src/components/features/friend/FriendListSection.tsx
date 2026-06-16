import { FriendCard } from './FriendMealStatusCard'

export interface Friend {
    memberId: number
    /** 화면 legacy view model 필드. 신규 데이터는 username을 우선 사용한다. */
    userName?: string
    /** Shared domain FriendMealItemResponse 필드. */
    username?: string
    profileImageUrl?: string | null
    hungry: boolean
    label: string
}
export function FriendListSection({
    friendList,
    activeFilter
}: {
    friendList: Friend[]
    activeFilter: {
        key: string
        label: string
    }
}) {
    return (
        <div className="flex flex-col gap-10">
            {friendList
                .filter(friend =>
                    activeFilter.key === 'all'
                        ? true
                        : friend.hungry === (activeFilter.key === 'hungry')
                )
                .map(friend => (
                    <FriendCard
                        friend={friend}
                        key={friend.memberId}
                    />
                ))}
        </div>
    )
}
