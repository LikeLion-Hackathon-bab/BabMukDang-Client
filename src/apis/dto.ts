export interface BaseResponse<T> {
    code: number
    message: string
    data: T
}
export interface Menu {
    code: string
    label: string
}
export interface Post {
    targetCount: number
    meetingAt: string //2025-08-08T22:30
    location: string
    message: string
}

export interface PostRequest extends Post {}
export interface PostResponse extends Post {
    postId: number
    author: {
        authorId: number
        name: string
        profileImageUrl: string
    }
    createdAt: string
    participants: {
        name: string
        profileImageUrl: string
    }[]
}

export interface TokenResponse {
    accessToken: string
    refreshToken: string
    accessTokenMaxAge: number
}

export interface CommentResponse {
    commentId: number
    authorId: number
    authorUsername: string
    parentCommentId: number
    content: string
    createdAt: string
    profileImageUrl?: string
    distance?: string
    replies?: CommentResponse[]
}
export interface ArticleSummaryResponse {
    articleId: number
    authorId: number
    authorUsername: string
    imageUrl: string
    mealDate: string
    mealTime: LocalTime
    restaurantName: string
    likeCount: number
    commentCount: number
    likedByMe: boolean
    createdAt: string
    expiresAt: string
    taggedMemberIds: number[]
}

interface LocalTime {
    hour: number
    minute: number
    second: number
    nano: number
}

interface SortObject {
    empty: boolean
    sorted: boolean
    unsorted: boolean
}

interface PageableObject {
    offset: number
    sort: SortObject
    paged: boolean
    pageNumber: number
    pageSize: number
    unpaged: boolean
}
export interface PageArticleSummaryResponse {
    totalElements: number
    totalPages: number
    first: boolean
    size: number
    content: ArticleSummaryResponse[]
    number: number
    sort: SortObject
    numberOfElements: number
    pageable: PageableObject
    last: boolean
    empty: boolean
}

export interface RestaurantInfo {
    placeId: string
    placeName: string
    addressName: string
    roadAddressName: string
    phoneNumber: string
    placeUrl: string
    distance?: string
    categoryGroupCode: string
    categoryGroupName: string
    categoryName: string
    x: number
    y: number
}

export interface ArticleDetailResponse {
    articleId: number
    authorId: number
    authorUsername: string
    imageUrl: string
    mealDate: string
    mealTime: LocalTime
    restaurant: RestaurantInfo
    likeCount: number
    commentCount: number
    likedByMe: boolean
    createdAt: string
    expiresAt: string
}

export interface ArticlePostRequest {
    imageUrl: string
    method: 'ALBUM' | 'CAMERA'
    mealDate: string
    mealTime: string
    restaurant: RestaurantInfo
    taggedMemberIds: number[]
    camera: boolean
    album: boolean
}
export interface LikePostResponse {
    liked: boolean
    likeCount: number
}

export interface CommentPostRequest {
    content: string
    parentCommentId?: number
}

export interface Onboarding {
    likedCodes: string[]
    dislikedCodes: string[]
    allergyCodes: string[]
}
export interface OnboardingPreferenceRequest extends Onboarding {}
export interface OnboardingPreferenceResponse extends Onboarding {}

export interface PreferenceSummaryResponse {
    likes: Menu[]
    dislikes: Menu[]
    allergies: Menu[]
}

export interface PreferenceMetaResponse {
    onboardedAt: string
    lastUpdatedAt: string
    revision: number
}

// Friend Meal related DTOs
export interface FriendMealResponse {
    memberId: number
    userName: string
    profileImageUrl: string
    hungry: boolean
    label: string
}

export interface FriendMealFilter {
    filter: 'ALL'
}

export interface FriendMealListResponse
    extends BaseResponse<FriendMealResponse[]> {}
