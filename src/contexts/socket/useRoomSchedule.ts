import { useEffect, useState } from 'react'
import type {
    DatePicksUpdateResponse,
    TimePicksUpdateResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import type { AppSocket } from './types'

export type DatePicksUpdateResponseDto = DatePicksUpdateResponse
export type TimePicksUpdateResponseDto = TimePicksUpdateResponse

export function useRoomSchedule(socket: AppSocket | null) {
    const [dateSelections, setDateSelections] =
        useState<DatePicksUpdateResponseDto>([])
    const [timeSelections, setTimeSelections] =
        useState<TimePicksUpdateResponseDto>([])

    useEffect(() => {
        if (!socket) return

        const handleDateUpdated = (data: DatePicksUpdateResponseDto) => {
            setDateSelections(data)
        }
        const handleTimeUpdated = (data: TimePicksUpdateResponseDto) => {
            setTimeSelections(data)
        }

        socket.on('date-updated', handleDateUpdated)
        socket.on('time-updated', handleTimeUpdated)

        return () => {
            socket.off('date-updated', handleDateUpdated)
            socket.off('time-updated', handleTimeUpdated)
        }
    }, [socket])

    return { dateSelections, timeSelections }
}
