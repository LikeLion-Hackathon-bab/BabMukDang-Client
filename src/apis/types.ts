/**
 * Client API contract aliases and screen view-model types.
 *
 * API DTOs are imported from Shared domain. Client-only shapes are suffixed with
 * Response/ViewModel and are produced by src/apis/mappers/*.
 */
import type {
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
    CreateMealGroupRequest,
    AddMealGroupMemberRequest,
    CreateMealPlanChangeRequest,
    CreateMealPlanInviteRequest,
    CreateMealPlanJoinRequest,
    CreateMealPlanRequest,
    CreateMealPlanShareLinkRequest,
    ConfirmMealPlanDecisionSnapshotRequest,
    CompleteOnboardingRequest,
    CreateProfileRequest,
    ExposeMealPlanToNearbyFriendsRequest,
    ExposeMealPlanToNearbyFriendsResponse,
    HomeMealPlanDashboardResponse,
    MealMapMarker,
    MealMapQuery,
    MealMapResponse,
    Food,
    FoodAnalysisResult,
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealItemResponse,
    FriendRequestItemResponse,
    FriendRequestStatus,
    JoinMealPlanGuestRequest,
    JoinMealPlanGuestResponse,
    LoginRequest,
    SignupRequest,
    MealGroupResponse,
    MealGroupPreferenceSummary,
    MealGroupHistoryResponse,
    MealPlanChatMessageListResponse,
    MealPlanChatMessageResponse,
    MealPlanDecisionProgress,
    MealPlanDecisionStageResponse,
    MealPlanDecisionTaskKey,
    MealPlanInviteListResponse,
    MealPlanInviteSummary,
    MealPlanJoinRequestSummary,
    MealPlanGuestSessionResponse,
    MealPlanNotification,
    MealPlanResponse,
    MealPlanShareLinkSummary,
    MealPlanSharePreviewResponse,
    MealStatus,
    MealStatusAction,
    MealStatusResponse,
    MemberFoodPreference,
    MemberResponse,
    MemberLocationSettingsResponse,
    DevicePermissionSnapshot,
    PermissionKind,
    PermissionPlatform,
    PermissionStatus,
    UpdateMemberLocationConsentRequest,
    UpdateMemberLocationRequest,
    NearbyFriendExposureEligibility,
    MyMealPlanListItem,
    MyMealPlanListResponse,
    NearbyFriendMealPlanSummary,
    NoContent,
    PageArticleSummaryResponse as DomainPageArticleSummaryResponse,
    SendMealPlanInviteResponse,
    StartMealPlanFromGroupRequest,
    UpdateMealGroupMemberRoleRequest,
    TokenResponse,
    UpdateMealPlanContextRequest,
    UpdateMealStatusRequest,
    UpdatePreferenceRequest,
    UpdateProfileRequest,
    UploadArticleImageResponse,
    UploadProfileImageResponse,
    ProfileDetailResponse as DomainProfileDetailResponse,
    RestaurantResponse,
    CompleteMealPlanDecisionStageRequest,
    ReopenMealPlanDecisionTaskRequest
} from '@kimdaegyu/babmukdang-shared/domain'

export type {
    ChallengeStatusResponse,
    ClaimChallengeRewardResponse,
    CouponResponse,
    CouponType,
    CreatedEntityIdResponse,
    CreateMealGroupRequest,
    AddMealGroupMemberRequest,
    CreateMealPlanChangeRequest,
    CreateMealPlanInviteRequest,
    CreateMealPlanJoinRequest,
    CreateMealPlanRequest,
    CreateMealPlanShareLinkRequest,
    ConfirmMealPlanDecisionSnapshotRequest,
    CompleteOnboardingRequest,
    CompleteMealPlanDecisionStageRequest,
    ReopenMealPlanDecisionTaskRequest,
    ExposeMealPlanToNearbyFriendsRequest,
    ExposeMealPlanToNearbyFriendsResponse,
    HomeMealPlanDashboardResponse,
    MealMapMarker,
    MealMapQuery,
    MealMapResponse,
    Food,
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealItemResponse,
    FriendRequestItemResponse,
    FriendRequestStatus,
    JoinMealPlanGuestRequest,
    JoinMealPlanGuestResponse,
    LoginRequest,
    SignupRequest,
    MealGroupResponse,
    MealGroupPreferenceSummary,
    MealGroupHistoryResponse,
    MealPlanChatMessageListResponse,
    MealPlanChatMessageResponse,
    MealPlanDecisionProgress,
    MealPlanDecisionStageResponse,
    MealPlanDecisionTaskKey,
    MealPlanInviteListResponse,
    MealPlanInviteSummary,
    MealPlanJoinRequestSummary,
    MealPlanGuestSessionResponse,
    MealPlanNotification,
    MealPlanResponse,
    MealPlanShareLinkSummary,
    MealPlanSharePreviewResponse,
    MealStatus,
    MealStatusAction,
    MealStatusResponse,
    MemberFoodPreference,
    MemberResponse,
    MemberLocationSettingsResponse,
    DevicePermissionSnapshot,
    PermissionKind,
    PermissionPlatform,
    PermissionStatus,
    UpdateMemberLocationConsentRequest,
    UpdateMemberLocationRequest,
    NearbyFriendExposureEligibility,
    MyMealPlanListItem,
    MyMealPlanListResponse,
    NearbyFriendMealPlanSummary,
    NoContent,
    SendMealPlanInviteResponse,
    StartMealPlanFromGroupRequest,
    UpdateMealGroupMemberRoleRequest,
    TokenResponse,
    UpdateMealPlanContextRequest,
    UpdateMealStatusRequest,
    UpdatePreferenceRequest,
    UpdateProfileRequest,
    UploadArticleImageResponse,
    UploadProfileImageResponse
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
    MealPlanCardView,
    MealPlanParticipantView,
    PreferenceMetaView,
    ProfileDetailView,
    ProfileSummaryView,
    RestaurantCardView,
    RestaurantInputView
} from '../viewModels/api'

export type RestaurantInfo = import('../viewModels/api').RestaurantInputView
export type ArticleSummaryResponse =
    import('../viewModels/api').ArticleSummaryView
export type ArticleDetailResponse =
    import('../viewModels/api').ArticleDetailView
export type CommentResponse = import('../viewModels/api').CommentView
export type PageArticleSummaryResponse =
    import('../viewModels/api').ArticlePageView
export type LikePostResponse = import('../viewModels/api').ArticleLikeView

export type ProfileDto = MemberResponse
export type ProfileResponse = import('../viewModels/api').ProfileSummaryView
export type ProfileDetailDto = DomainProfileDetailResponse
export type ProfileDetailResponse =
    import('../viewModels/api').ProfileDetailView

export type MealPlanDto = MealPlanResponse
export type MealPlanCardResponse = import('../viewModels/api').MealPlanCardView
export type MealPlanParticipant =
    import('../viewModels/api').MealPlanParticipantView

export type OnboardingPreferenceRequest = CreateProfileRequest
export type CompleteOnboardingRequestDto = CompleteOnboardingRequest
export type OnboardingPreferenceResponse = NoContent
export type PreferenceSummaryResponse = MemberFoodPreference
export type PreferenceMetaResponse =
    import('../viewModels/api').PreferenceMetaView
export type PreferenceItem = Food

export type FriendMealResponse = FriendMealItemResponse
export type FriendMealFilter = { filter: MealStatus }
export type FriendMealListResponse = FriendMealItemResponse[]
