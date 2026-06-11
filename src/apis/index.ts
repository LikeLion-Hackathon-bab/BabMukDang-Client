/**
 * @fileoverview API 모듈 통합 진입점 (Barrel File)
 *
 * 이 파일에서 모든 API 함수와 Query hooks를 re-export합니다.
 * 다른 컴포넌트에서는 이 파일을 통해 import하면 됩니다.
 *
 * @example
 * import { useGetArticle, articleApi, queryKeys } from '@/apis'
 */

// ============================================================================
// Core
// ============================================================================

/** Axios 클라이언트 인스턴스 */
export { client } from './client'

/** Query Key 중앙 관리 */
export { queryKeys } from './keys'

/** API 엔드포인트, 타입 중앙 관리 */
export { endpoints, api } from './endpoints'

// ============================================================================
// 타입
// ============================================================================

export type {
    // 공통
    LocalTime,
    MutationOptions,
    NoContent,
    Food,
    // 인증
    TokenResponse,
    // 게시글
    ArticleSummaryDto,
    ArticleSummaryResponse,
    ArticleDetailDto,
    ArticleDetailResponse,
    ArticlePostRequest,
    FoodAnalysisResultDto,
    RestaurantInfo,
    KakaoRestaurantResponse,
    PageArticleSummaryDto,
    PageArticleSummaryResponse,
    LikePostResponse,
    // 댓글
    CommentDto,
    CommentResponse,
    CommentPostRequest,
    // 모집글
    RecruitDto,
    Post,
    PostRequest,
    PostResponse,
    // 프로필
    ProfileDto,
    ProfileResponse,
    ProfileDetailResponse,
    UpdateProfileRequest,
    PreferenceItem,
    // 초대
    InvitationPostRequest,
    InvitationResponse,
    SendInvitationResponse,
    AcceptInvitationResponse,
    // 모임
    MeetingDto,
    MeetingParticipant,
    MeetingResponse,
    // 선호도
    OnboardingPreferenceRequest,
    OnboardingPreferenceResponse,
    PreferenceSummaryResponse,
    PreferenceMetaResponse,
    // 친구
    FriendMealResponse,
    FriendMealFilter,
    FriendMealListResponse,
    FriendListItemResponse,
    FriendBlockItemResponse,
    FriendRequestItemResponse,
    FriendRequestStatus,
    // 식사 상태
    MealStatusAction,
    UpdateMealStatusRequest,
    MealStatusResponse,
    // 챌린지
    WeekProgress,
    MonthProgress,
    ChallengeStatusResponse,
    // 쿠폰
    CouponType,
    CouponResponse
} from './types'

// ============================================================================
// Article (게시글)
// ============================================================================

export {
    articleApi,
    // Query hooks
    useGetArticle,
    useGetArticleComments,
    useGetHomeArticles,
    useGetArticlesByAuthor,
    useGetArticlesByMember,
    useGetMyArticles,
    // Mutation hooks
    useUploadArticle,
    useLikeArticle,
    useCommentArticle,
    useDeleteArticle,
    useDeleteArticleComment
} from './article.api'

// ============================================================================
// Auth (인증)
// ============================================================================

export {
    authApi,
    login,
    logout,
    refresh,
    // Mutation hooks
    useRefreshToken,
    useLogout,
    useEmailLogin,
    useEmailSignup
} from './auth.api'

// ============================================================================
// Profile (프로필)
// ============================================================================

export {
    profileApi,
    // Query hooks
    useGetMyProfile,
    useGetMyProfileDetail,
    useGetMemberProfile,
    useGetMemberProfileDetail,
    useGetProfiles,
    // Mutation hooks
    useUpdateMyProfile
} from './profile.api'

// ============================================================================
// Announcement (모집글/공지)
// ============================================================================

export {
    announcementApi,
    getAnnouncements,
    postAnnouncement,
    closeAnnouncement,
    joinAnnouncement,
    // Query hooks
    useGetAnnouncements,
    // Mutation hooks
    usePostAnnouncement,
    useCloseAnnouncement,
    useJoinAnnouncement
} from './announcement.api'

// ============================================================================
// Invitation (초대)
// ============================================================================

export {
    invitationApi,
    getInvitations,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    // Query hooks
    useGetInvitations,
    // Mutation hooks
    useSendInvitation,
    useAcceptInvitation,
    useRejectInvitation
} from './invitation.api'

// ============================================================================
// Meeting (모임)
// ============================================================================

export {
    meetingApi,
    getMeetings,
    // Query hooks
    useGetMeetings
} from './meeting.api'

// ============================================================================
// Friends (친구)
// ============================================================================

export {
    friendsApi,
    getFriendMeals,
    // Query hooks
    useFriendMeals,
    useAllFriendMeals,
    useFriends,
    useSearchFriends,
    useBlockedMembers,
    useIncomingFriendRequests,
    useOutgoingFriendRequests,
    // Mutation hooks
    useSendFriendRequest,
    useAcceptFriendRequest,
    useRejectFriendRequest,
    useCancelFriendRequest,
    useBlockMember,
    useUnblockMember,
    useRemoveFriend
} from './friends.api'

// ============================================================================
// Preference (선호도)
// ============================================================================

export {
    preferenceApi,
    postOnboardingPreference,
    getPreferenceSummary,
    getPreferenceMeta
} from './preference.api'

// ============================================================================
// Upload (파일 업로드)
// ============================================================================

export {
    uploadApi,
    presignArticle,
    presignProfile,
    uploadArticleS3,
    uploadProfileS3,
    // Mutation hooks
    useUploadProfile
} from './upload.api'
