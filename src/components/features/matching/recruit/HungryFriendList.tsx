import { ProfileDefaultIcon } from '@/assets/icons'
import { Friend } from '../../friend/FriendListSection'
import { cn } from '@/lib'

export function HungryFriendList({
    hungryFriendList,
    className
}: {
    hungryFriendList: Friend[]
    className?: string
}) {
    return (
        <div
            className={cn(
                'rounded-12 shadow-drop-1 bg-primary-200 flex w-full flex-col gap-16 py-16',
                className
            )}>
            <span className="text-body2-semibold text-gray-8 px-16">
                밥 안 먹은 친구들
            </span>
            <div className="flex flex-row justify-start gap-4 overflow-x-auto px-16">
                {hungryFriendList.map(hungryFriend => (
                    <div
                        key={hungryFriend.memberId}
                        className="flex flex-col items-center justify-center gap-4 px-5">
                        <ProfileDefaultIcon className="size-40" />
                        <span className="text-caption-medium text-gray-5 text-center">
                            {hungryFriend.userName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
