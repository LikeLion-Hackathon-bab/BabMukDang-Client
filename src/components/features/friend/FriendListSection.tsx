import { FriendCard } from './InvitationFriendCard'

export interface Friend {
    memberId: number
    userName: string
    profileImageUrl: string
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
