/**
 * Client API contract aliases and screen view-model types.
 *
 * API DTOs are imported from Shared domain. Client-only shapes are suffixed with
 * Response/ViewModel and are produced by src/apis/mappers/*.
 */
import type {
    AcceptInvitationResponse,
    ArticleComment,
    ArticleDetailResponse as DomainArticleDetailResponse,
    ArticleSummaryResponse as DomainArticleSummaryResponse,
    ChallengeStatusResponse,
    ClaimChallengeRewardResponse,
    CouponResponse,
    CouponType,
    CreateArticleRequest,
    CreateCommentRequest,
    CreatedEntityIdResponse,
    CreateInvitationRequest,
    CreateProfileRequest,
    CreateRecruitResponse,
    CreateRecruitRequest,
    Food,
    FoodAnalysisResult,
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealItemResponse,
    FriendRequestItemResponse,
    FriendRequestStatus,
    InvitationResponse,
    MealStatus,
    MealStatusAction,
    MealStatusResponse,
    MemberFoodPreference,
    MemberResponse,
    NoContent,
    PageArticleSummaryResponse as DomainPageArticleSummaryResponse,
    PlanResponse,
    PresignArticleResponse,
    PresignProfileResponse,
    ProfileDetailResponse as DomainProfileDetailResponse,
    RecruitListResponse,
    RestaurantResponse,
    SendInvitationResponse,
    TokenResponse,
    UpdateMealStatusRequest,
    UpdatePreferenceRequest,
    UpdateProfileRequest
} from '@kimdaegyu/babmukdang-shared/domain'

// ============================================================================
// Common helpers
// ============================================================================

export type {
    AcceptInvitationResponse,
    ChallengeStatusResponse,
    ClaimChallengeRewardResponse,
    CouponResponse,
    CouponType,
    CreatedEntityIdResponse,
    CreateRecruitResponse,
    Food,
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealItemResponse,
    FriendRequestItemResponse,
    FriendRequestStatus,
    InvitationResponse,
    MealStatus,
    MealStatusAction,
    MealStatusResponse,
    MemberFoodPreference,
    MemberResponse,
    NoContent,
    PlanResponse,
    PresignArticleResponse,
    PresignProfileResponse,
    RecruitListResponse,
    SendInvitationResponse,
    TokenResponse,
    UpdateMealStatusRequest,
    UpdatePreferenceRequest,
    UpdateProfileRequest
}

export type WeekProgress = { days: boolean[]; completed: number; goal: number }
export type MonthProgress = { count: number; goal: number }

export interface LocalTime {
    hour: number
    minute: number
    second: number
    nano: number
}

export interface MutationOptions<TData = NoContent> {
    mutationFn?: () => Promise<TData>
    onSuccess?: (data?: TData) => void
    onError?: (error: Error) => void
    onSettled?: () => void
}

// ============================================================================
// Article API DTO aliases and view models
// ============================================================================

export type ArticleSummaryDto = DomainArticleSummaryResponse
export type ArticleDetailDto = DomainArticleDetailResponse
export type PageArticleSummaryDto = DomainPageArticleSummaryResponse
export type ArticlePostRequest = CreateArticleRequest
export type CommentPostRequest = CreateCommentRequest
export type FoodAnalysisResultDto = FoodAnalysisResult
export type CommentDto = ArticleComment
export type KakaoRestaurantResponse = RestaurantResponse
export type RestaurantResponseDto = RestaurantResponse

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

export interface ArticleDetailResponse extends ArticleSummaryResponse {
    restaurant: RestaurantInfo
    comments?: CommentResponse[]
}

export interface CommentResponse {
    commentId: number
    authorId: number
    authorUsername: string
    parentCommentId: number | null
    content: string
    createdAt: string
    profileImageUrl?: string | null
    distance?: string
    replies?: CommentResponse[]
}

export interface PageArticleSummaryResponse {
    items: ArticleSummaryResponse[]
    content: ArticleSummaryResponse[]
    meta: DomainPageArticleSummaryResponse['meta']
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    number: number
    numberOfElements: number
    empty: boolean
}

// Legacy page aliases kept for screens that still expect content-style naming.
export type ArticlePageView = PageArticleSummaryResponse

export interface LikePostResponse {
    liked: boolean
    likeCount: number
}

// ============================================================================
// Recruit view model
// ============================================================================

export type RecruitDto = RecruitListResponse['items'][number]
export type PostRequest = CreateRecruitRequest

export interface Post {
    targetCount: number
    meetingAt: string
    location: string
    message: string
}

export interface PostResponse extends Post {
    postId: number
    author: {
        authorId: number
        name: string
        profileImageUrl: string
    }
    createdAt: string
    participants: {
        memberId?: number
        name: string
        profileImageUrl: string
    }[]
}

// ============================================================================
// Profile view models
// ============================================================================

export type ProfileDto = MemberResponse

export interface ProfileResponse {
    memberId: number
    userName: string
    username: string
    profileImageUrl: string
    bio: string
    meetingCount: number
}

// ============================================================================
// Invitation / meeting / preference
// ============================================================================

export type ProfileDetailDto = DomainProfileDetailResponse

export interface ProfileDetailResponse {
    memberId: number
    userName: string
    username: string
    profileImageUrl: string
    bio: string
    meetingCount: number
    likes: Food[]
    dislikes: Food[]
    allergies: Food[]
    friendConunt: number
    completedPlans: number
    uncompletedPlans: number
}

export type InvitationPostRequest = CreateInvitationRequest
export type MeetingDto = PlanResponse

export interface MeetingParticipant {
    userId: number
    name: string
}

export interface MeetingResponse {
    id: number
    participants: MeetingParticipant[]
    location: string
    time: string
    restaurant: string
    isCompleted: boolean
    restaurantType: string
}

export type OnboardingPreferenceRequest = CreateProfileRequest
export type OnboardingPreferenceResponse = NoContent
export type PreferenceSummaryResponse = MemberFoodPreference
export type PreferenceMetaResponse = {
    likes?: Food[]
    dislikes?: Food[]
    allergies?: Food[]
}
export type PreferenceItem = Food

export type FriendMealResponse = FriendMealItemResponse
export interface FriendMealFilter {
    filter: MealStatus
}
export type FriendMealListResponse = FriendMealItemResponse[]
