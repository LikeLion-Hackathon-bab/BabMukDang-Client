import { CalendarWithMultiple } from '@/components'
import { useSocket } from '@/contexts/SocketContext'

export function DatePage() {
    const { socket, dateSelections } = useSocket()
    return (
        <div className="mt-60">
            <CalendarWithMultiple
                serverDateSelections={dateSelections}
                onSelectDates={dates => {
                    socket?.emit('pick-date', { dates })
                }}
            />
        </div>
    )
}
