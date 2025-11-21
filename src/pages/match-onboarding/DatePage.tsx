import { CalendarWithMultiple } from '@/components'
import { useSocket } from '@/contexts/SocketContext'
import { DateInitialState } from '@kimdaegyu/babmukdang-shared'
import { useEffect, useState } from 'react'

export function DatePage() {
    const service = useSocket()
    const [dateSelections, setDateSelections] = useState<DateInitialState>([])
    useEffect(() => {
        if (!service) return
        service.dateInitialState$.subscribe(data => {
            setDateSelections(data)
        })
        service.dateSelectionsUpdated$.subscribe(data => {
            setDateSelections(data)
        })
    }, [service])
    return (
        <div className="mt-60">
            <CalendarWithMultiple
                serverDateSelections={dateSelections}
                onSelectDates={dates => {
                    service?.emit('pick-date', { dates })
                }}
            />
        </div>
    )
}
