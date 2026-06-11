import { CalendarWithMultiple } from '@/components'
import { useSocket } from '@/contexts/SocketContext'

export function DatePage() {
    const { socket, dateSelections } = useSocket()
    const viewDateSelections = dateSelections.map(selection => ({
        userId: String(selection.memberId),
        dates: selection.dates
    }))

    return (
        <div className="mt-60">
            <CalendarWithMultiple
                serverDateSelections={viewDateSelections}
                onSelectDates={dates => {
                    socket?.emit('pick-date', { dates })
                }}
            />
        </div>
    )
}
