/**
 * @fileoverview Meeting (모임) 관련 Mock Fixtures
 *
 * 모임 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 * mockData.ts에서 마이그레이션됨
 */

import type { MeetingResponse } from '@/apis'

/**
 * 모임 응답 mock 데이터 목록
 */
export const mockMeetingResponses: MeetingResponse[] = [
    {
        id: 1,
        participants: [
            { name: '서은우', userId: 1 },
            { name: '유가은', userId: 2 }
        ],
        location: '서울과학기술대학교 정문 앞',
        time: '8월 27일 오후 2:30',
        restaurant: '동학 주점',
        isCompleted: false,
        restaurantType: '한식'
    },
    {
        id: 2,
        participants: [
            { name: '서은우', userId: 1 },
            { name: '유가은', userId: 2 }
        ],
        location: '상상관 1층 앞',
        time: '8월 27일 오후 2:30',
        restaurant: '오하이요',
        isCompleted: false,
        restaurantType: '일식'
    },
    {
        id: 3,
        participants: [
            { name: '서은우', userId: 1 },
            { name: '유가은', userId: 2 }
        ],
        location: '서울과학기술대학교 정문 앞',
        time: '8월 27일 오후 2:30',
        restaurant: '동학 주점',
        isCompleted: true,
        restaurantType: '한식'
    }
]

/**
 * 단일 모임 응답 mock
 */
export const mockSingleMeetingResponse: MeetingResponse =
    mockMeetingResponses[0]

// 하위 호환성을 위한 별칭
export const MockMeetingList = mockMeetingResponses
