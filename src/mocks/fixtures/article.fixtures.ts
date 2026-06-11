/**
 * @fileoverview Article Mock Fixtures
 */

import type {
    ArticleDetailDto,
    CommentDto,
    PageArticleSummaryDto
} from '@/apis'
import { domainId } from '@/domain/factories'

const restaurant: ArticleDetailDto['restaurant'] = {
    restaurantId: domainId.restaurant('12345'),
    placeName: '맛있는 식당',
    addressName: '서울특별시 강남구',
    roadAddressName: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    placeUrl: 'https://map.kakao.com/123',
    categoryName: '한식',
    categoryGroupName: '음식점',
    distance: '120',
    lat: 37.4979,
    lng: 127.0276
}

const mealDate = '2025-12-17'
const now = '2025-12-17T12:00:00.000Z'
const expiresAt = '2025-12-18T12:00:00.000Z'

const member = (
    memberId: number,
    username: string,
    random: number
): ArticleDetailDto['author'] => ({
    memberId: domainId.member(memberId),
    username,
    profileImageUrl: `https://picsum.photos/40/40?random=${random}`
})

const summaryOne: PageArticleSummaryDto['items'][number] = {
    articleId: domainId.article(1),
    author: member(1, 'testUser1', 11),
    imageUrl: 'https://picsum.photos/400/400?random=1',
    mealDate,
    restaurant,
    createdAt: now,
    updatedAt: now,
    expiresAt,
    taggedMembers: [member(2, 'taggedUser1', 12), member(3, 'taggedUser2', 13)],
    likeCount: 5,
    commentCount: 3,
    likedByMe: false
}

const summaryTwo: PageArticleSummaryDto['items'][number] = {
    ...summaryOne,
    articleId: domainId.article(2),
    author: member(2, 'testUser2', 14),
    imageUrl: 'https://picsum.photos/400/400?random=2',
    restaurant: {
        ...restaurant,
        restaurantId: domainId.restaurant('67890'),
        placeName: '즐거운 레스토랑'
    },
    taggedMembers: [],
    likeCount: 10,
    commentCount: 5,
    likedByMe: true
}

export const articleFixtures = {
    detail: {
        ...summaryOne,
        articleId: domainId.article(1),
        author: member(1, 'testUser', 10),
        comments: []
    } satisfies ArticleDetailDto,

    homeList: {
        items: [summaryOne, summaryTwo],
        meta: {
            page: 0,
            size: 20,
            totalItems: 2,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
        }
    } satisfies PageArticleSummaryDto,

    comments: [
        {
            commentId: domainId.comment(1),
            author: member(2, 'commenter1', 1),
            parentCommentId: null,
            content: '맛있어 보여요!',
            createdAt: now,
            updatedAt: now
        },
        {
            commentId: domainId.comment(2),
            author: member(3, 'commenter2', 2),
            parentCommentId: null,
            content: '어디에 있는 식당인가요?',
            createdAt: now,
            updatedAt: now
        }
    ] satisfies CommentDto[]
}
