/**
 * @fileoverview Recruit (모집글/공지) 관련 Mock Fixtures
 *
 * Backend Recruit DTO shape를 따르는 테스트 및 개발용 mock 데이터입니다.
 */

import type { PostRequest, RecruitDto } from '@/apis'
import { mapRecruit } from '@/apis/mappers/recruit.mapper'

const now = new Date().toISOString()
const expiredAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

const createRecruit = ({
    id,
    authorName,
    message,
    location,
    targetCount,
    meetingAt,
    participants
}: {
    id: number
    authorName: string
    message: string
    location: string
    targetCount: number
    meetingAt: string
    participants: string[]
}): RecruitDto => ({
    id,
    postId: id,
    status: 'OPEN',
    targetCount,
    meetingAt,
    location,
    message,
    createdAt: now,
    expiredAt,
    updatedAt: now,
    author: {
        userId: String(id),
        username: authorName,
        profileImageUrl: ''
    },
    participants: participants.map((name, index) => ({
        userId: String(id * 10 + index),
        username: name,
        profileImageUrl: ''
    }))
})

/**
 * 모집글 응답 DTO mock 데이터 목록
 */
export const mockRecruitResponses: RecruitDto[] = [
    createRecruit({
        id: 1,
        authorName: '홍길동',
        message: '점심 같이 드실 분!\n맛있는 거 먹어요',
        location: '강남역 근처',
        targetCount: 3,
        meetingAt: '2024-12-15T12:00',
        participants: ['김철수', '이영희']
    }),
    createRecruit({
        id: 2,
        authorName: '박소영',
        message: '같이 커피 마실 사람\n구해요!',
        location: '홍대입구역 2번 출구',
        targetCount: 4,
        meetingAt: '2024-08-08T15:00',
        participants: ['이민수']
    }),
    createRecruit({
        id: 3,
        authorName: '이서연',
        message: '밥 먹을 사람 구해요!',
        location: '강남 CGV',
        targetCount: 4,
        meetingAt: '2024-08-08T20:00',
        participants: ['최지훈', '김하늘', '정우진']
    }),
    createRecruit({
        id: 4,
        authorName: '윤성호',
        message: '배달 시켜먹을 사람 구해요!',
        location: '국립중앙도서관',
        targetCount: 5,
        meetingAt: '2024-08-09T18:00',
        participants: ['강민지']
    }),
    createRecruit({
        id: 5,
        authorName: '이동현',
        message: '고독한 미식가 구해요!',
        location: '북한산 입구',
        targetCount: 6,
        meetingAt: '2024-08-10T07:00',
        participants: ['조현우', '김태영']
    }),
    createRecruit({
        id: 6,
        authorName: '최은아',
        message: '밥 먹을 사람 구해요!',
        location: '홍대',
        targetCount: 4,
        meetingAt: '2024-08-08T19:00',
        participants: ['박준혁']
    })
]

/**
 * 모집글 요청 mock 데이터
 */
export const mockPostRequest: PostRequest = {
    targetCount: 4,
    meetingAt: '2024-12-20T12:30',
    location: '서울과학기술대학교 정문',
    message: '점심 같이 먹을 분 구해요!'
}

/**
 * 화면 모델 하위 호환 export
 */
export const mockPostResponses = mockRecruitResponses.map(mapRecruit)
export const mockSinglePostResponse = mockPostResponses[0]
export const MockAnnouncements = mockPostResponses
