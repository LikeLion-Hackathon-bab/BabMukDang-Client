import { EmptyNotiView, LocalNewsNotiCard, SwipeableCard } from '@/components'

const isExplicitDeleteModeEnabled = () => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('e2e-explicit-delete-mode') === 'true'
}

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
                    explicitDeleteMode={isExplicitDeleteModeEnabled()}
                    deleteButtonTestId={`local-news-delete-button-${noti.id}`}
                    onDelete={() => handleDeleteLocalNewsNoti(noti.id)}>
                    <LocalNewsNotiCard noti={noti} />
                </SwipeableCard>
            ))}
        </div>
    )
}
