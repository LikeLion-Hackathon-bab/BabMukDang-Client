import type {
    ArticleDetailDto,
    ArticleDetailView,
    ArticleSummaryDto,
    ArticleSummaryView,
    CommentDto,
    CommentView,
    PageArticleSummaryDto,
    ArticlePageView,
    RestaurantInputView,
    RestaurantResponseDto
} from '../types'

const toDateOnly = (value: string): string => value.split('T')[0]

export const mapRestaurantToRestaurantInputView = (
    restaurant: RestaurantResponseDto
): RestaurantInputView => ({
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

export const mapRestaurantInputViewToRestaurant = (
    restaurant: RestaurantInputView
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
export const mapKakaoRestaurantToRestaurantInputView =
    mapRestaurantToRestaurantInputView
export const mapRestaurantInputViewToKakaoRestaurant =
    mapRestaurantInputViewToRestaurant
export const mapKakaoRestaurantToRestaurantInfo =
    mapRestaurantToRestaurantInputView
export const mapRestaurantInfoToKakaoRestaurant =
    mapRestaurantInputViewToRestaurant

export const mapArticleSummary = (
    article: ArticleSummaryDto
): ArticleSummaryView => ({
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
    taggedMemberIds: article.taggedMembers.map(
        (member: { memberId: number | string }) => Number(member.memberId)
    )
})

export const mapArticleDetail = (
    article: ArticleDetailDto
): ArticleDetailView => ({
    ...mapArticleSummary(article),
    restaurant: mapRestaurantToRestaurantInputView(article.restaurant),
    comments: article.comments?.map(mapComment)
})

export const mapArticlePage = (
    page: PageArticleSummaryDto
): ArticlePageView => {
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

export const mapComment = (comment: CommentDto): CommentView => ({
    commentId: Number(comment.commentId),
    authorId: Number(comment.author.memberId),
    authorUsername: comment.author.username,
    parentCommentId:
        comment.parentCommentId == null
            ? null
            : Number(comment.parentCommentId),
    content: comment.content,
    createdAt: comment.createdAt,
    profileImageUrl: comment.author.profileImageUrl ?? null
})
