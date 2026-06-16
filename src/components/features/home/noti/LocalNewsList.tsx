import { EmptyNotiView, LocalNewsNotiCard, SwipeableCard } from '@/components'

interface LocalNewsNoti {
    id: number
    type: 'school' | 'restaurant' | 'area'
    title: string
    time: string
    message: string
    period: string
    imageUrl?: string
}
export function LocalNewsList({
    localNewsNotis,
    handleDeleteLocalNewsNoti
}: {
    localNewsNotis: LocalNewsNoti[]
    handleDeleteLocalNewsNoti: (id: number) => void
}) {
    if (localNewsNotis.length === 0) {
        return <EmptyNotiView variant="localNews" />
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
