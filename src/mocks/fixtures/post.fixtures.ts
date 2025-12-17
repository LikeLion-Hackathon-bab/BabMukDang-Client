/**
 * @fileoverview Post (모집글/공지) 관련 Mock Fixtures
 *
 * 모집글/공지 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 * mockData.ts에서 마이그레이션됨
 */

import type { PostResponse, PostRequest } from '@/apis'

/**
 * 모집글 응답 mock 데이터 목록
 */
export const mockPostResponses: PostResponse[] = [
    {
        postId: 1,
        author: {
            authorId: 1,
            name: '홍길동',
            profileImageUrl: ''
        },
        message: '점심 같이 드실 분!\n맛있는 거 먹어요',
        location: '강남역 근처',
        targetCount: 3,
        meetingAt: '2024-12-15T12:00',
        createdAt: new Date().toISOString(),
        participants: [
            { name: '김철수', profileImageUrl: '' },
            { name: '이영희', profileImageUrl: '' }
        ]
    },
    {
        postId: 2,
        author: {
            authorId: 2,
            name: '박소영',
            profileImageUrl: ''
        },
        message: '같이 커피 마실 사람\n구해요!',
        location: '홍대입구역 2번 출구',
        targetCount: 4,
        meetingAt: '2024-08-08T15:00',
        createdAt: new Date().toISOString(),
        participants: [{ name: '이민수', profileImageUrl: '' }]
    },
    {
        postId: 3,
        author: {
            authorId: 3,
            name: '이서연',
            profileImageUrl: ''
        },
        message: '밥 먹을 사람 구해요!',
        location: '강남 CGV',
        targetCount: 4,
        meetingAt: '2024-08-08T20:00',
        createdAt: new Date().toISOString(),
        participants: [
            { name: '최지훈', profileImageUrl: '' },
            { name: '김하늘', profileImageUrl: '' },
            { name: '정우진', profileImageUrl: '' }
        ]
    },
    {
        postId: 4,
        author: {
            authorId: 4,
            name: '윤성호',
            profileImageUrl: ''
        },
        message: '배달 시켜먹을 사람 구해요!',
        location: '국립중앙도서관',
        targetCount: 5,
        meetingAt: '2024-08-09T18:00',
        createdAt: new Date().toISOString(),
        participants: [{ name: '강민지', profileImageUrl: '' }]
    },
    {
        postId: 5,
        author: {
            authorId: 5,
            name: '이동현',
            profileImageUrl: ''
        },
        message: '고독한 미식가 구해요!',
        location: '북한산 입구',
        targetCount: 6,
        meetingAt: '2024-08-10T07:00',
        createdAt: new Date().toISOString(),
        participants: [
            { name: '조현우', profileImageUrl: '' },
            { name: '김태영', profileImageUrl: '' }
        ]
    },
    {
        postId: 6,
        author: {
            authorId: 6,
            name: '최은아',
            profileImageUrl: ''
        },
        message: '밥 먹을 사람 구해요!',
        location: '홍대',
        targetCount: 4,
        meetingAt: '2024-08-08T19:00',
        createdAt: new Date().toISOString(),
        participants: [{ name: '박준혁', profileImageUrl: '' }]
    }
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
 * 단일 모집글 응답 mock
 */
export const mockSinglePostResponse: PostResponse = mockPostResponses[0]

// 하위 호환성을 위한 별칭
export const MockAnnouncements = mockPostResponses
