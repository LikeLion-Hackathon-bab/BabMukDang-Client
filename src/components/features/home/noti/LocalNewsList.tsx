import { EmptyNotiView, LocalNewsNotiCard, SwipeableCard } from '@/components'
import { LocalNewsNoti } from '@kimdaegyu/babmukdang-shared'
export function LocalNewsList({
    localNewsNotis,
    handleDeleteLocalNewsNoti
}: {
    localNewsNotis: LocalNewsNoti[]
    handleDeleteLocalNewsNoti: (id: number) => void
}) {
    if (localNewsNotis.length === 0) {
        return <EmptyNotiView isMatching={false} />
    }
    return (
        <div className="flex flex-col">
            {localNewsNotis.map(noti => (
                <SwipeableCard
                    key={noti.id}
                    onDelete={() => handleDeleteLocalNewsNoti(noti.id)}>
                    <LocalNewsNotiCard noti={noti} />
                </SwipeableCard>
            ))}
        </div>
    )
}
