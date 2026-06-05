/**
 * @fileoverview Article Mock Fixtures
 *
 * Backend Article DTO shape를 따르는 테스트 및 개발용 mock 데이터입니다.
 */

import type {
    ArticleDetailDto,
    CommentDto,
    PageArticleSummaryDto
} from '@/apis'

const restaurant = {
    id: '12345',
    place_name: '맛있는 식당',
    address_name: '서울특별시 강남구',
    road_address_name: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    place_url: 'https://map.kakao.com/123',
    category_name: '한식',
    category_group_name: '음식점',
    distance: '120',
    lat: 37.4979,
    lng: 127.0276
}

const mealDate = new Date('2025-12-17T00:00:00.000Z')
const now = new Date()
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

/**
 * Article mock 데이터
 */
export const articleFixtures = {
    /**
     * 게시글 상세 mock
     */
    detail: {
        id: 1,
        author: {
            userId: '1',
            username: 'testUser',
            profileImageUrl: 'https://picsum.photos/40/40?random=10'
        },
        imageUrl: 'https://picsum.photos/400/400',
        mealDate,
        restaurant,
        likeCount: 5,
        commentCount: 3,
        likedByMe: false,
        createdAt: now,
        expiresAt
    } satisfies ArticleDetailDto,

    /**
     * 홈 피드 게시글 목록 mock
     */
    homeList: {
        content: [
            {
                id: 1,
                author: {
                    userId: '1',
                    username: 'testUser1',
                    profileImageUrl: 'https://picsum.photos/40/40?random=11'
                },
                imageUrl: 'https://picsum.photos/400/400?random=1',
                mealDate,
                restaurant,
                createdAt: now,
                updatedAt: now,
                expiresAt,
                taggedMembers: [
                    {
                        userId: '2',
                        username: 'taggedUser1',
                        profileImageUrl: 'https://picsum.photos/40/40?random=12'
                    },
                    {
                        userId: '3',
                        username: 'taggedUser2',
                        profileImageUrl: 'https://picsum.photos/40/40?random=13'
                    }
                ],
                likeCount: 5,
                commentCount: 3,
                likedByMe: false
            },
            {
                id: 2,
                author: {
                    userId: '2',
                    username: 'testUser2',
                    profileImageUrl: 'https://picsum.photos/40/40?random=14'
                },
                imageUrl: 'https://picsum.photos/400/400?random=2',
                mealDate,
                restaurant: {
                    ...restaurant,
                    id: '67890',
                    place_name: '즐거운 레스토랑'
                },
                createdAt: now,
                updatedAt: now,
                expiresAt,
                taggedMembers: [],
                likeCount: 10,
                commentCount: 5,
                likedByMe: true
            }
        ],
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true,
        size: 20,
        number: 0,
        sort: { empty: false, sorted: true, unsorted: false },
        numberOfElements: 2,
        pageable: {
            offset: 0,
            sort: { empty: false, sorted: true, unsorted: false },
            paged: true,
            pageNumber: 0,
            pageSize: 20,
            unpaged: false
        },
        empty: false
    } satisfies PageArticleSummaryDto,

    /**
     * 댓글 목록 mock
     */
    comments: [
        {
            commentId: 1,
            author: {
                userId: '2',
                username: 'commenter1',
                profileImageUrl: 'https://picsum.photos/40/40?random=1'
            },
            parentCommentId: null,
            content: '맛있어 보여요!',
            createdAt: now,
            updatedAt: now
        },
        {
            commentId: 2,
            author: {
                userId: '3',
                username: 'commenter2',
                profileImageUrl: 'https://picsum.photos/40/40?random=2'
            },
            parentCommentId: null,
            content: '어디에 있는 식당인가요?',
            createdAt: now,
            updatedAt: now
        }
    ] satisfies CommentDto[]
}
