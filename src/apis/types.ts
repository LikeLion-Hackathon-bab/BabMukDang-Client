/**
 * @fileoverview API 응답 및 요청에 사용되는 공통 타입 정의
 *
 * 이 모듈은 백엔드 API와 통신할 때 사용하는 모든 DTO(Data Transfer Object)를 정의합니다.
 * 도메인별로 그룹화되어 있으며, 각 타입에는 필드 설명이 포함되어 있습니다.
 */

import type {
    ArticleDetailResponseDto as SharedArticleDetailResponseDto,
    ArticlePostRequestDto as SharedArticlePostRequestDto,
    ArticleSummaryResponseDto as SharedArticleSummaryResponseDto,
    ChallengeStatusResponse as SharedChallengeStatusResponse,
    CommentPostRequestDto as SharedCommentPostRequestDto,
    CommentResponseDto as SharedCommentResponseDto,
    CouponResponse as SharedCouponResponse,
    CouponType as SharedCouponType,
    FriendMealFilter as SharedFriendMealFilter,
    FriendMealItemResponse,
    InvitationPostRequest as SharedInvitationPostRequest,
    InvitationResponse as SharedInvitationResponse,
    KakaoRestaurantResponseDto as SharedKakaoRestaurantResponseDto,
    LikePostResponseDto as SharedLikePostResponseDto,
    MealStatusAction as SharedMealStatusAction,
    MealStatusResponse as SharedMealStatusResponse,
    MeetingResponse as SharedMeetingResponse,
    OnboardingPreferenceRequest as SharedOnboardingPreferenceRequest,
    OnboardingPreferenceResponse as SharedOnboardingPreferenceResponse,
    PageArticleSummaryResponse as SharedPageArticleSummaryResponse,
    PreferenceItem as SharedPreferenceItem,
    PreferenceMetaResponse as SharedPreferenceMetaResponse,
    PreferenceSummaryResponse as SharedPreferenceSummaryResponse,
    ProfileDetailResponse as SharedProfileDetailResponse,
    ProfileResponse as SharedProfileResponse,
    RecruitRequestDto as SharedRecruitRequestDto,
    RecruitResponseDto as SharedRecruitResponseDto,
    TokenResponse as SharedTokenResponse,
    UpdateMealStatusRequest as SharedUpdateMealStatusRequest,
    UpdateProfileRequest as SharedUpdateProfileRequest,
    WeekProgress as SharedWeekProgress,
    MonthProgress as SharedMonthProgress
} from '@kimdaegyu/babmukdang-shared'

// ============================================================================
// 공통 타입
// ============================================================================

/**
 * API 응답의 기본 래퍼 타입
 * @template T - 실제 응답 데이터 타입
 */
export interface BaseResponse<T> {
    /** HTTP 상태 코드 */
    code: number
    /** 응답 메시지 */
    message: string
    /** 실제 데이터 */
    data: T
}

/**
 * 메뉴/카테고리 항목
 */
export interface Menu {
    /** 메뉴 코드 */
    code: string
    /** 표시 라벨 */
    label: string
}

/**
 * 시간 정보 (Java LocalTime 형식)
 */
export interface LocalTime {
    hour: number
    minute: number
    second: number
    nano: number
}

/**
 * TanStack Query 뮤테이션 옵션 타입
 * 모든 mutation hook에서 공통으로 사용됩니다.
 *
 * @template TData - 성공 시 반환되는 데이터 타입
 *
 * @example
 * const { mutate } = useLikeArticle({
 *   onSuccess: (data) => console.log('좋아요:', data.liked),
 *   onError: (error) => console.error(error.message)
 * })
 */
export interface MutationOptions<TData = void> {
    /** 뮤테이션 함수 */
    mutationFn?: () => Promise<TData>
    /** 성공 시 콜백 */
    onSuccess?: (data: TData) => void
    /** 에러 시 콜백 */
    onError?: (error: Error) => void
    /** 완료 시 콜백 (성공/실패 무관) */
    onSettled?: () => void
}

// ============================================================================
// 인증 (Auth) 관련 타입
// ============================================================================

export type TokenResponse = SharedTokenResponse

// ============================================================================
// 게시글 (Article) 관련 타입
// ============================================================================

export type ArticleSummaryDto = SharedArticleSummaryResponseDto
export type ArticleDetailDto = SharedArticleDetailResponseDto
export type PageArticleSummaryDto = SharedPageArticleSummaryResponse

/**
 * 게시글 요약 정보 (목록용)
 */
export interface ArticleSummaryResponse {
    /** 게시글 ID */
    articleId: number
    /** 작성자 ID */
    authorId: number
    /** 작성자 이름 */
    authorUsername: string
    /** 이미지 URL */
    imageUrl: string
    /** 식사 날짜 (YYYY-MM-DD) */
    mealDate: string
    /** 식사 시간 */
    mealTime: LocalTime
    /** 식당 이름 */
    restaurantName: string
    /** 좋아요 수 */
    likeCount: number
    /** 댓글 수 */
    commentCount: number
    /** 내가 좋아요 했는지 여부 */
    likedByMe: boolean
    /** 생성 시간 */
    createdAt: string
    /** 만료 시간 */
    expiresAt: string
    /** 태그된 멤버 ID 목록 */
    taggedMemberIds: number[]
}

/**
 * 식당 정보
 */
export interface RestaurantInfo {
    /** 카카오 장소 ID */
    placeId: string
    /** 장소명 */
    placeName: string
    /** 지번 주소 */
    addressName: string
    /** 도로명 주소 */
    roadAddressName: string
    /** 전화번호 */
    phoneNumber: string
    /** 카카오맵 URL */
    placeUrl: string
    /** 현재 위치에서의 거리 */
    distance?: string
    /** 카테고리 그룹 코드 */
    categoryGroupCode: string
    /** 카테고리 그룹 이름 */
    categoryGroupName: string
    /** 카테고리 이름 */
    categoryName: string
    /** 경도 */
    x: number
    /** 위도 */
    y: number
}

/**
 * 게시글 상세 정보
 */
export interface ArticleDetailResponse {
    /** 게시글 ID */
    articleId: number
    /** 작성자 ID */
    authorId: number
    /** 작성자 이름 */
    authorUsername: string
    /** 이미지 URL */
    imageUrl: string
    /** 식사 날짜 (YYYY-MM-DD) */
    mealDate: string
    /** 식사 시간 */
    mealTime: LocalTime
    /** 식당 정보 */
    restaurant: RestaurantInfo
    /** 좋아요 수 */
    likeCount: number
    /** 댓글 수 */
    commentCount: number
    /** 내가 좋아요 했는지 여부 */
    likedByMe: boolean
    /** 생성 시간 */
    createdAt: string
    /** 만료 시간 */
    expiresAt: string
}

export type ArticlePostRequest = SharedArticlePostRequestDto

export type LikePostResponse = SharedLikePostResponseDto

// ============================================================================
// 댓글 (Comment) 관련 타입
// ============================================================================

export type CommentDto = SharedCommentResponseDto

/**
 * 댓글 응답
 */
export interface CommentResponse {
    /** 댓글 ID */
    commentId: number
    /** 작성자 ID */
    authorId: number
    /** 작성자 이름 */
    authorUsername: string
    /** 부모 댓글 ID (대댓글인 경우) */
    parentCommentId: number | null
    /** 댓글 내용 */
    content: string
    /** 작성 시간 */
    createdAt: string
    /** 작성자 프로필 이미지 URL */
    profileImageUrl?: string
    /** 현재 위치에서의 거리 */
    distance?: string
    /** 대댓글 목록 */
    replies?: CommentResponse[]
}

export type CommentPostRequest = SharedCommentPostRequestDto

// ============================================================================
// 페이지네이션 관련 타입
// ============================================================================

/**
 * 정렬 정보
 */
interface SortObject {
    empty: boolean
    sorted: boolean
    unsorted: boolean
}

/**
 * 페이지 정보
 */
interface PageableObject {
    offset: number
    sort: SortObject
    paged: boolean
    pageNumber: number
    pageSize: number
    unpaged: boolean
}

/**
 * 게시글 페이지 응답
 */
export interface PageArticleSummaryResponse {
    /** 총 요소 수 */
    totalElements: number
    /** 총 페이지 수 */
    totalPages: number
    /** 첫 페이지 여부 */
    first: boolean
    /** 페이지 크기 */
    size: number
    /** 게시글 목록 */
    content: ArticleSummaryResponse[]
    /** 현재 페이지 번호 */
    number: number
    /** 정렬 정보 */
    sort: SortObject
    /** 현재 페이지 요소 수 */
    numberOfElements: number
    /** 페이지 정보 */
    pageable: PageableObject
    /** 마지막 페이지 여부 */
    last: boolean
    /** 비어있는지 여부 */
    empty: boolean
}

// ============================================================================
// 모집글/공지 (Post/Announcement) 관련 타입
// ============================================================================

/**
 * 모집글 기본 정보
 */
export interface Post {
    /** 목표 인원 */
    targetCount: number
    /** 모임 시간 (YYYY-MM-DDTHH:mm) */
    meetingAt: string
    /** 장소 */
    location: string
    /** 메시지 */
    message: string
}

export type RecruitDto = SharedRecruitResponseDto
export type PostRequest = SharedRecruitRequestDto

/**
 * 모집글 응답
 */
export interface PostResponse extends Post {
    /** 모집글 ID */
    postId: number
    /** 작성자 정보 */
    author: {
        authorId: number
        name: string
        profileImageUrl: string
    }
    /** 생성 시간 */
    createdAt: string
    /** 참여자 목록 */
    participants: {
        memberId?: number
        name: string
        profileImageUrl: string
    }[]
}

// ============================================================================
// 프로필 (Profile) 관련 타입
// ============================================================================

export type PreferenceItem = SharedPreferenceItem

/**
 * Backend 프로필 응답 DTO (API 경계 수신용)
 * `member` 래퍼와 `mealStatus`를 포함한 Shared 계약을 그대로 수신한 뒤
 * `mapProfile`로 화면 view model(`ProfileResponse`)로 변환한다.
 */
export type ProfileDto = SharedProfileResponse

/**
 * 프로필 기본 응답 (화면 view model)
 * Shared `ProfileDto`를 flatten한 결과를 화면에서 사용한다.
 */
export interface ProfileResponse {
    /** 멤버 ID */
    memberId: number
    /** 사용자명 */
    userName: string
    /** 프로필 이미지 URL */
    profileImageUrl: string
    /** 자기소개 */
    bio: string
    /** 모임 참여 횟수 */
    meetingCount: number
}

/**
 * 프로필 상세 응답 (Shared 계약과 동일 shape, 그대로 수신)
 */
export type ProfileDetailResponse = SharedProfileDetailResponse

/**
 * 프로필 수정 요청
 */
export type UpdateProfileRequest = SharedUpdateProfileRequest

// ============================================================================
// 초대 (Invitation) 관련 타입
// ============================================================================

export type InvitationPostRequest = SharedInvitationPostRequest
export type InvitationResponse = SharedInvitationResponse

// ============================================================================
// 모임 (Meeting) 관련 타입
// ============================================================================

/**
 * Backend 모임(Plan) 응답 DTO (API 경계 수신용)
 * Shared 계약을 그대로 수신한 뒤 `mapMeeting`으로 화면 view model로 변환한다.
 */
export type MeetingDto = SharedMeetingResponse

/**
 * 모임 참여자 정보 (화면 view model)
 */
export interface MeetingParticipant {
    /** 사용자 ID */
    userId: number
    /** 이름 */
    name: string
}

/**
 * 모임 응답 (화면 view model)
 */
export interface MeetingResponse {
    /** 모임 ID */
    id: number
    /** 참여자 목록 */
    participants: MeetingParticipant[]
    /** 장소 */
    location: string
    /** 시간 */
    time: string
    /** 식당 이름 */
    restaurant: string
    /** 완료 여부 */
    isCompleted: boolean
    /** 식당 타입 */
    restaurantType: string
}

// ============================================================================
// 선호도/온보딩 (Preference/Onboarding) 관련 타입
// ============================================================================

/**
 * 온보딩 선호도 정보
 */
export interface Onboarding {
    /** 좋아하는 음식 코드 목록 */
    likedCodes: string[]
    /** 싫어하는 음식 코드 목록 */
    dislikedCodes: string[]
    /** 알레르기 코드 목록 */
    allergyCodes: string[]
}

export type OnboardingPreferenceRequest = SharedOnboardingPreferenceRequest
export type OnboardingPreferenceResponse = SharedOnboardingPreferenceResponse
export type PreferenceSummaryResponse = SharedPreferenceSummaryResponse
export type PreferenceMetaResponse = SharedPreferenceMetaResponse

// ============================================================================
// 친구 (Friends) 관련 타입
// ============================================================================

export type FriendMealResponse = FriendMealItemResponse
export interface FriendMealFilter {
    filter: SharedFriendMealFilter
}
export type FriendMealListResponse = FriendMealItemResponse[]

// ============================================================================
// 식사 상태 (Meal Status) 관련 타입
// ============================================================================

export type MealStatusAction = SharedMealStatusAction
export type UpdateMealStatusRequest = SharedUpdateMealStatusRequest
export type MealStatusResponse = SharedMealStatusResponse

// ============================================================================
// 챌린지 (Challenge) 관련 타입
// ============================================================================

export type WeekProgress = SharedWeekProgress
export type MonthProgress = SharedMonthProgress
export type ChallengeStatusResponse = SharedChallengeStatusResponse

// ============================================================================
// 쿠폰 (Coupon) 관련 타입
// ============================================================================

export type CouponType = SharedCouponType
export type CouponResponse = SharedCouponResponse

// ============================================================================
// 멤버 (Member) 관련 타입
// ============================================================================

/**
 * 멤버 요약 응답
 */
export interface MemberSummaryResponse {
    /** 멤버 ID */
    memberId: number
    /** 사용자명 */
    userName: string
    /** 프로필 이미지 URL */
    profileImageUrl: string | null
}

/**
 * 작성자 정보
 */
export interface AuthorInfo {
    /** 작성자 ID */
    authorId: number
    /** 이름 */
    name: string
    /** 프로필 이미지 URL */
    profileImageUrl: string
}

/**
 * 참여자 정보
 */
export interface ParticipantInfo {
    /** 참여자 ID */
    authorId: number
    /** 이름 */
    name: string
    /** 프로필 이미지 URL */
    profileImageUrl: string
}

// ============================================================================
// 최근 식사/게시글 사진 관련 타입
// ============================================================================

/**
 * 게시글 사진 응답
 */
export interface ArticlePhotoResponse {
    /** 게시글 ID */
    articleId: number
    /** 이미지 URL */
    imageUrl: string
    /** 생성 시간 */
    createdAt: string
}

/**
 * 최근 식사 응답
 */
export interface RecentMealsResponse {
    /** 게시글 ID */
    articleId: number
    /** 이미지 URL */
    imageUrl: string
    /** 식사 날짜 */
    mealDate: string
    /** 식사 시간 */
    mealTime: string
    /** 식당 이름 */
    restaurantName: string | null
    /** 생성 시간 */
    createdAt: string
}

// ============================================================================
// 식당 타입
// ============================================================================

export type KakaoRestaurantResponse = SharedKakaoRestaurantResponseDto
