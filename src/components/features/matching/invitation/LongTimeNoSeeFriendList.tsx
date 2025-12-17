import { ProfileDefaultIcon } from '@/assets/icons'

interface LongTimeNoSeeFriend {
    memberId: number
    userName: string
    profileImageUrl: string
    lastMeetingDate: string
}

export function LongTimeNoSeeFriendList({
    longTimeNoSeeFriendList
}: {
    longTimeNoSeeFriendList: LongTimeNoSeeFriend[]
}) {
    return (
        <div className="rounded-12 shadow-drop-1 flex w-full flex-col gap-16 bg-white py-16">
            {/* 상단 */}
            <div className="flex flex-row items-center justify-between px-16">
                <span className="text-body1-semibold text-gray-8">
                    만날 때 된 친구
                </span>
                {/* <span className="text-caption-medium text-right text-gray-300">
                    더보기 +
                </span> */}
            </div>
            {/* 하단 */}
            <div className="flex flex-row justify-start gap-20 overflow-x-auto px-16">
                {longTimeNoSeeFriendList.map(friend => (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <ProfileDefaultIcon className="size-50" />
                        <span className="text-caption-medium text-gray-5 text-center">
                            {friend.userName}
                        </span>
                        <span className="text-caption-10 text-gray-5 text-center">
                            마지막 만남
                            <br />
                            {friend.lastMeetingDate
                                .split('T')[0]
                                .split('-')
                                .splice(1, 2)
                                .join('. ')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
