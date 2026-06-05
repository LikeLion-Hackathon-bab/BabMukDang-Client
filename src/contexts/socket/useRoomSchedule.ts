import { useEffect, useState } from 'react'
import type {
    DatePicksUpdateResponseDto,
    TimePicksUpdateResponseDto
} from '@kimdaegyu/babmukdang-shared'
import type { AppSocket } from './types'

/**
 * 일정(날짜/시간) 도메인 훅.
 * - `date-updated`: 날짜 후보 픽 집계
 * - `time-updated`: 시간 후보 픽 집계
 */
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
