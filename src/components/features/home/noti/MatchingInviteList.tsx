import {
    SwipeableCard,
    MatchingInviteNotiCard,
    EmptyNotiView
} from '@/components'
import { MeetingResponse, PlanType } from '@kimdaegyu/babmukdang-shared'

export function MatchingInviteList({
    matchingNotis,
    handleDeleteMatchingNoti,
    handleMatchingInviteNotiClick
}: {
    matchingNotis: MeetingResponse[]
    handleDeleteMatchingNoti: (id: number) => void
    handleMatchingInviteNotiClick: (type: PlanType) => void
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
                        onClick={() => handleMatchingInviteNotiClick(noti.type)}
                    />
                </SwipeableCard>
            ))}
        </div>
    )
}
