/**
 * @fileoverview Article Mock Fixtures
 *
 * 테스트 및 개발용 게시글 mock 데이터를 정의합니다.
 */

import type {
    ArticleDetailResponse,
    CommentResponse,
    PageArticleSummaryResponse
} from '@/apis'

/**
 * Article mock 데이터
 */
export const articleFixtures = {
    /**
     * 게시글 상세 mock
     */
    detail: {
        articleId: 1,
        authorId: 1,
        authorUsername: 'testUser',
        imageUrl: 'https://picsum.photos/400/400',
        mealDate: '2025-12-17',
        mealTime: { hour: 12, minute: 30, second: 0, nano: 0 },
        restaurant: {
            placeId: '12345',
            placeName: '맛있는 식당',
            addressName: '서울특별시 강남구',
            roadAddressName: '서울특별시 강남구 테헤란로 123',
            phoneNumber: '02-1234-5678',
            placeUrl: 'https://map.kakao.com/123',
            categoryGroupCode: 'FD6',
            categoryGroupName: '음식점',
            categoryName: '한식',
            x: 127.0276,
            y: 37.4979
        },
        likeCount: 5,
        commentCount: 3,
        likedByMe: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } satisfies ArticleDetailResponse,

    /**
     * 홈 피드 게시글 목록 mock
     */
    homeList: {
        content: [
            {
                articleId: 1,
                authorId: 1,
                authorUsername: 'testUser1',
                imageUrl: 'https://picsum.photos/400/400?random=1',
                mealDate: '2025-12-17',
                mealTime: { hour: 12, minute: 30, second: 0, nano: 0 },
                restaurantName: '맛있는 식당',
                likeCount: 5,
                commentCount: 3,
                likedByMe: false,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(),
                taggedMemberIds: [2, 3]
            },
            {
                articleId: 2,
                authorId: 2,
                authorUsername: 'testUser2',
                imageUrl: 'https://picsum.photos/400/400?random=2',
                mealDate: '2025-12-17',
                mealTime: { hour: 18, minute: 0, second: 0, nano: 0 },
                restaurantName: '즐거운 레스토랑',
                likeCount: 10,
                commentCount: 5,
                likedByMe: true,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(),
                taggedMemberIds: []
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
    } satisfies PageArticleSummaryResponse,

    /**
     * 댓글 목록 mock
     */
    comments: [
        {
            commentId: 1,
            authorId: 2,
            authorUsername: 'commenter1',
            parentCommentId: 0,
            content: '맛있어 보여요!',
            createdAt: new Date().toISOString(),
            profileImageUrl: 'https://picsum.photos/40/40?random=1'
        },
        {
            commentId: 2,
            authorId: 3,
            authorUsername: 'commenter2',
            parentCommentId: 0,
            content: '어디에 있는 식당인가요?',
            createdAt: new Date().toISOString(),
            profileImageUrl: 'https://picsum.photos/40/40?random=2'
        }
    ] satisfies CommentResponse[]
}
