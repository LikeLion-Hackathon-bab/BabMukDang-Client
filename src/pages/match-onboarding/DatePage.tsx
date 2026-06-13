import { CalendarWithMultiple } from '@/components'
import { useSocket } from '@/contexts/SocketContext'

export function DatePage() {
    const { commands, dateSelections } = useSocket()
    const viewDateSelections = dateSelections.map(selection => ({
        userId: String(selection.memberId),
        dates: selection.dates
    }))

    return (
        <div className="mt-60">
            <CalendarWithMultiple
                serverDateSelections={viewDateSelections}
                onSelectDates={dates => {
                    commands?.pickDate(dates)
                }}
            />
        </div>
    )
}
