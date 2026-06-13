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

export type LocalTime = import('../viewModels/api').LocalTimeView

export interface MutationOptions<TData = NoContent> {
    mutationFn?: () => Promise<TData>
    onSuccess?: (data?: TData) => void
    onError?: (error: Error) => void
    onSettled?: () => void
}

// ============================================================================
// Article API DTO aliases
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

export type {
    ArticleDetailView,
    ArticleLikeView,
    ArticlePageView,
    ArticleSummaryView,
    CommentView,
    MeetingCardView,
    MeetingParticipantView,
    PreferenceMetaView,
    ProfileDetailView,
    ProfileSummaryView,
    RecruitCardView,
    RecruitFormView,
    RestaurantCardView,
    RestaurantInputView
} from '../viewModels/api'

// Backward-compatible type aliases. API adapters should migrate to the View names
// above; these aliases remain so existing screens do not confuse server DTOs with
// client-side view models during the migration.
export type RestaurantInfo = import('../viewModels/api').RestaurantInputView
export type ArticleSummaryResponse = import('../viewModels/api').ArticleSummaryView
export type ArticleDetailResponse = import('../viewModels/api').ArticleDetailView
export type CommentResponse = import('../viewModels/api').CommentView
export type PageArticleSummaryResponse = import('../viewModels/api').ArticlePageView
export type LikePostResponse = import('../viewModels/api').ArticleLikeView

// ============================================================================
// Recruit DTO aliases and view models
// ============================================================================

export type RecruitDto = RecruitListResponse['items'][number]
export type PostRequest = CreateRecruitRequest
export type Post = import('../viewModels/api').RecruitFormView
export type PostResponse = import('../viewModels/api').RecruitCardView

// ============================================================================
// Profile view models
// ============================================================================

export type ProfileDto = MemberResponse
export type ProfileResponse = import('../viewModels/api').ProfileSummaryView

// ============================================================================
// Invitation / meeting / preference
// ============================================================================

export type ProfileDetailDto = DomainProfileDetailResponse
export type ProfileDetailResponse = import('../viewModels/api').ProfileDetailView

export type InvitationPostRequest = CreateInvitationRequest
export type MeetingDto = PlanResponse
export type MeetingParticipant = import('../viewModels/api').MeetingParticipantView
export type MeetingResponse = import('../viewModels/api').MeetingCardView

export type OnboardingPreferenceRequest = CreateProfileRequest
export type OnboardingPreferenceResponse = NoContent
export type PreferenceSummaryResponse = MemberFoodPreference
export type PreferenceMetaResponse = import('../viewModels/api').PreferenceMetaView
export type PreferenceItem = Food

export type FriendMealResponse = FriendMealItemResponse
export type FriendMealFilter = { filter: MealStatus }
export type FriendMealListResponse = FriendMealItemResponse[]
