import {
    SwipeableCard,
    MatchingInviteNotiCard,
    EmptyNotiView
} from '@/components'
import type { MatchingInviteNoti } from '@/pages/home/NotiStoragePage'
export function MatchingInviteList({
    matchingNotis,
    handleDeleteMatchingNoti,
    handleMatchingInviteNotiClick
}: {
    matchingNotis: MatchingInviteNoti[]
    handleDeleteMatchingNoti: (id: string) => void
    handleMatchingInviteNotiClick: (noti: MatchingInviteNoti) => void
}) {
    if (matchingNotis.length === 0) {
        return <EmptyNotiView isMatching />
    }
    return (
        <div className="flex flex-col">
            {matchingNotis.map(noti => (
                <SwipeableCard
                    key={noti.notificationId}
                    onDelete={() =>
                        handleDeleteMatchingNoti(noti.notificationId)
                    }>
                    <MatchingInviteNotiCard
                        noti={noti}
                        onClick={() => handleMatchingInviteNotiClick(noti)}
                    />
                </SwipeableCard>
            ))}
        </div>
    )
}
