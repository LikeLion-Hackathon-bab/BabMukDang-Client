import type {
    DatePicksUpdateResponse,
    TimePicksUpdateResponse
} from '@kimdaegyu/babmukdang-shared/domain/room'

import { useMatchStore } from '@/store/matchStore'

export type DatePicksUpdateResponseDto = DatePicksUpdateResponse
export type TimePicksUpdateResponseDto = TimePicksUpdateResponse

export function useRoomSchedule() {
    const dateSelections = useMatchStore(state => state.datePicks)
    const timeSelections = useMatchStore(state => state.timePicks)

    return { dateSelections, timeSelections }
}
