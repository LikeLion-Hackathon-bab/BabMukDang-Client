import type {
    ArticleDetailDto,
    ArticleDetailResponse,
    ArticleSummaryDto,
    ArticleSummaryResponse,
    CommentDto,
    CommentResponse,
    KakaoRestaurantResponse,
    PageArticleSummaryDto,
    PageArticleSummaryResponse,
    RestaurantInfo
} from '../types'

type DateLike = Date | string

const toIsoString = (value: DateLike): string => {
    if (value instanceof Date) {
        return value.toISOString()
    }

    return value
}

const toDateOnly = (value: DateLike): string => toIsoString(value).split('T')[0]

export const mapKakaoRestaurantToRestaurantInfo = (
    restaurant: KakaoRestaurantResponse
): RestaurantInfo => ({
    placeId: restaurant.id,
    placeName: restaurant.place_name,
    addressName: restaurant.address_name,
    roadAddressName: restaurant.road_address_name,
    phoneNumber: restaurant.phone,
    placeUrl: restaurant.place_url ?? '',
    distance: restaurant.distance,
    categoryGroupCode: '',
    categoryGroupName: restaurant.category_group_name,
    categoryName: restaurant.category_name,
    x: restaurant.lng,
    y: restaurant.lat
})

export const mapRestaurantInfoToKakaoRestaurant = (
    restaurant: RestaurantInfo
): KakaoRestaurantResponse => ({
    id: restaurant.placeId,
    place_name: restaurant.placeName,
    category_name: restaurant.categoryName,
    category_group_name: restaurant.categoryGroupName,
    distance: restaurant.distance ?? '',
    road_address_name: restaurant.roadAddressName,
    address_name: restaurant.addressName,
    phone: restaurant.phoneNumber,
    place_url: restaurant.placeUrl,
    lat: Number(restaurant.y),
    lng: Number(restaurant.x)
})

export const mapArticleSummary = (
    article: ArticleSummaryDto
): ArticleSummaryResponse => ({
    articleId: article.id,
    authorId: Number(article.author.userId),
    authorUsername: article.author.username,
    imageUrl: article.imageUrl,
    mealDate: toDateOnly(article.mealDate),
    mealTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    restaurantName: article.restaurant.place_name,
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    likedByMe: article.likedByMe,
    createdAt: toIsoString(article.createdAt),
    expiresAt: toIsoString(article.expiresAt),
    taggedMemberIds: article.taggedMembers.map(member => Number(member.userId))
})

export const mapArticleDetail = (
    article: ArticleDetailDto
): ArticleDetailResponse => ({
    articleId: article.id,
    authorId: Number(article.author.userId),
    authorUsername: article.author.username,
    imageUrl: article.imageUrl,
    mealDate: toDateOnly(article.mealDate),
    mealTime: { hour: 0, minute: 0, second: 0, nano: 0 },
    restaurant: mapKakaoRestaurantToRestaurantInfo(article.restaurant),
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    likedByMe: article.likedByMe,
    createdAt: toIsoString(article.createdAt),
    expiresAt: toIsoString(article.expiresAt)
})

export const mapArticlePage = (
    page: PageArticleSummaryDto
): PageArticleSummaryResponse => ({
    ...page,
    content: page.content.map(mapArticleSummary)
})

export const mapComment = (comment: CommentDto): CommentResponse => ({
    commentId: comment.commentId,
    authorId: Number(comment.author.userId),
    authorUsername: comment.author.username,
    parentCommentId: comment.parentCommentId,
    content: comment.content,
    createdAt: toIsoString(comment.createdAt),
    profileImageUrl: comment.author.profileImageUrl
})
