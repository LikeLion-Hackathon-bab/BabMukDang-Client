/**
 * @fileoverview Meeting(모임) API 모듈
 *
 * 모임 관련 API 함수와 TanStack Query hooks를 제공합니다.
 *
 * @example
 * // 모임 목록 조회
 * const { data: meetings, refetch } = useGetMeetings()
 */

import { useQuery } from '@tanstack/react-query'
import { client } from './client'
import { endpoints } from './endpoints'
import { queryKeys } from './keys'
import { mapMeeting } from './mappers/meeting.mapper'
import type { MeetingDto, MeetingResponse } from './types'

// ============================================================================
// API 함수
// ============================================================================

/**
 * Meeting API 함수 모음
 */
export const meetingApi = {
    /**
     * 모임 목록 조회
     * @returns 모임 목록 (화면 view model)
     */
    getAll: async (): Promise<MeetingResponse[]> => {
        const res = await client.get(endpoints.meetings.list)
        return (res.data as MeetingDto[]).map(mapMeeting)
    }
}

// 하위 호환성을 위한 기존 함수 export
export const getMeetings = meetingApi.getAll

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 모임 목록 조회 Hook
 * @returns Query 결과 (data?.data에 실제 목록 포함)
 *
 * @example
 * const { data: meetings, refetch } = useGetMeetings()
 * meetings?.forEach(meeting => {
 *   console.log(meeting.restaurant, meeting.time)
 * })
 */
export const useGetMeetings = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.meetings.list,
        queryFn: meetingApi.getAll
    })
    return { data, isLoading, error, refetch }
}
