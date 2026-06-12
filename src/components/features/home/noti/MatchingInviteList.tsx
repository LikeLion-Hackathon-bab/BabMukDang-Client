import {
    SwipeableCard,
    MatchingInviteNotiCard,
    EmptyNotiView
} from '@/components'

type MatchingInviteNoti = {
    id: string
    type: 'invitation' | 'recruit'
    title: string
    time: string
    message: string
    period: string
    imageUrl: string
    roomId: string
}
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
                    key={noti.id}
                    onDelete={() => handleDeleteMatchingNoti(noti.id)}>
                    <MatchingInviteNotiCard
                        noti={noti}
                        onClick={() => handleMatchingInviteNotiClick(noti)}
                    />
                </SwipeableCard>
            ))}
        </div>
    )
}
