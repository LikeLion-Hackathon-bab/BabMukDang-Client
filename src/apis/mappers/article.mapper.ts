import type {
    ArticleDetailDto,
    ArticleDetailResponse,
    ArticleSummaryDto,
    ArticleSummaryResponse,
    CommentDto,
    CommentResponse,
    PageArticleSummaryDto,
    PageArticleSummaryResponse,
    RestaurantInfo,
    RestaurantResponseDto
} from '../types'

const toDateOnly = (value: string): string => value.split('T')[0]

export const mapRestaurantToRestaurantInfo = (
    restaurant: RestaurantResponseDto
): RestaurantInfo => ({
    placeId: String(restaurant.restaurantId),
    placeName: restaurant.placeName,
    addressName: restaurant.addressName,
    roadAddressName: restaurant.roadAddressName,
    phoneNumber: restaurant.phone ?? '',
    placeUrl: restaurant.placeUrl ?? '',
    distance: restaurant.distance,
    categoryGroupCode: '',
    categoryGroupName: restaurant.categoryGroupName,
    categoryName: restaurant.categoryName,
    x: restaurant.lng,
    y: restaurant.lat
})

export const mapRestaurantInfoToRestaurant = (
    restaurant: RestaurantInfo
): RestaurantResponseDto => ({
    restaurantId: restaurant.placeId as RestaurantResponseDto['restaurantId'],
    placeName: restaurant.placeName,
    categoryName: restaurant.categoryName,
    categoryGroupName: restaurant.categoryGroupName,
    distance: restaurant.distance,
    roadAddressName: restaurant.roadAddressName,
    addressName: restaurant.addressName,
    phone: restaurant.phoneNumber || null,
    placeUrl: restaurant.placeUrl || null,
    lat: Number(restaurant.y),
    lng: Number(restaurant.x)
})

// Backward-compatible mapper names used by older upload/article code.
export const mapKakaoRestaurantToRestaurantInfo = mapRestaurantToRestaurantInfo
export const mapRestaurantInfoToKakaoRestaurant = mapRestaurantInfoToRestaurant

export const mapArticleSummary = (
    article: ArticleSummaryDto
): ArticleSummaryResponse => ({
    articleId: Number(article.articleId),
    authorId: Number(article.author.memberId),
    authorUsername: article.author.username,
    imageUrl: article.imageUrl,
    mealDate: toDateOnly(article.mealDate),
    mealTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    restaurantName: article.restaurant.placeName,
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    likedByMe: article.likedByMe,
    createdAt: article.createdAt,
    expiresAt: article.expiresAt,
    taggedMemberIds: article.taggedMembers.map((member: { memberId: number | string }) => Number(member.memberId))
})

export const mapArticleDetail = (
    article: ArticleDetailDto
): ArticleDetailResponse => ({
    ...mapArticleSummary(article),
    restaurant: mapRestaurantToRestaurantInfo(article.restaurant),
    comments: article.comments?.map(mapComment)
})

export const mapArticlePage = (
    page: PageArticleSummaryDto
): PageArticleSummaryResponse => {
    const items = page.items.map(mapArticleSummary)
    return {
        items,
        content: items,
        meta: page.meta,
        totalElements: page.meta.totalItems,
        totalPages: page.meta.totalPages,
        first: !page.meta.hasPrevious,
        last: !page.meta.hasNext,
        size: page.meta.size,
        number: page.meta.page,
        numberOfElements: items.length,
        empty: items.length === 0
    }
}

export const mapComment = (comment: CommentDto): CommentResponse => ({
    commentId: Number(comment.commentId),
    authorId: Number(comment.author.memberId),
    authorUsername: comment.author.username,
    parentCommentId:
        comment.parentCommentId == null ? null : Number(comment.parentCommentId),
    content: comment.content,
    createdAt: comment.createdAt,
    profileImageUrl: comment.author.profileImageUrl ?? null
})
