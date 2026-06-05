/**
 * @fileoverview Meeting (모임) 관련 Mock Fixtures
 *
 * Backend 모임(Plan) DTO shape를 따르는 테스트 및 개발용 mock 데이터입니다.
 * 화면에서 쓰는 view model은 `mapMeeting` 결과로 export 한다.
 */

import { PlanStatus, PlanType } from '@kimdaegyu/babmukdang-shared'
import type { MeetingDto } from '@/apis'
import { mapMeeting } from '@/apis/mappers/meeting.mapper'

const now = '2025-08-20T09:00:00.000Z'

const createMeeting = ({
    id,
    location,
    meetingAt,
    restaurant,
    restaurantType,
    isCompleted
}: {
    id: number
    location: string
    meetingAt: string
    restaurant: string
    restaurantType: string
    isCompleted: boolean
}): MeetingDto => ({
    id,
    author: {
        userId: '1',
        username: '서은우',
        profileImageUrl: ''
    },
    participants: [
        { userId: '1', username: '서은우', profileImageUrl: '' },
        { userId: '2', username: '유가은', profileImageUrl: '' }
    ],
    location,
    meetingAt,
    restaurant,
    isCompleted,
    restaurantType,
    status: isCompleted ? PlanStatus.COMPLETED : PlanStatus.PLANNING,
    type: PlanType.ANNOUNCEMENT,
    createdAt: now,
    updatedAt: now
})

/**
 * 모임 응답 DTO mock 데이터 목록 (Backend DTO shape)
 */
export const mockMeetingResponses: MeetingDto[] = [
    createMeeting({
        id: 1,
        location: '서울과학기술대학교 정문 앞',
        meetingAt: '2025-08-27T14:30:00.000Z',
        restaurant: '동학 주점',
        restaurantType: '한식',
        isCompleted: false
    }),
    createMeeting({
        id: 2,
        location: '상상관 1층 앞',
        meetingAt: '2025-08-27T14:30:00.000Z',
        restaurant: '오하이요',
        restaurantType: '일식',
        isCompleted: false
    }),
    createMeeting({
        id: 3,
        location: '서울과학기술대학교 정문 앞',
        meetingAt: '2025-08-27T14:30:00.000Z',
        restaurant: '동학 주점',
        restaurantType: '한식',
        isCompleted: true
    })
]

/**
 * 단일 모임 응답 mock (Backend DTO shape)
 */
export const mockSingleMeetingResponse: MeetingDto = mockMeetingResponses[0]

/**
 * 화면 모델 하위 호환 export (mapper 결과)
 */
export const MockMeetingList = mockMeetingResponses.map(mapMeeting)
