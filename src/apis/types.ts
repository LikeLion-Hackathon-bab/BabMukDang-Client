/**
 * @fileoverview API 응답 및 요청에 사용되는 공통 타입 정의
 *
 * 이 모듈은 백엔드 API와 통신할 때 사용하는 모든 DTO(Data Transfer Object)를 정의합니다.
 * 도메인별로 그룹화되어 있으며, 각 타입에는 필드 설명이 포함되어 있습니다.
 */

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

// ============================================================================
// 인증 (Auth) 관련 타입
// ============================================================================

/**
 * 토큰 응답
 */
export interface TokenResponse {
    /** JWT 액세스 토큰 */
    accessToken: string
    /** JWT 리프레시 토큰 */
    refreshToken: string
    /** 액세스 토큰 만료 시간 (초) */
    accessTokenMaxAge: number
}

// ============================================================================
// 게시글 (Article) 관련 타입
// ============================================================================

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

/**
 * 게시글 작성 요청
 */
export interface ArticlePostRequest {
    /** 이미지 URL */
    imageUrl: string
    /** 업로드 방식 */
    method: 'ALBUM' | 'CAMERA'
    /** 식사 날짜 (YYYY-MM-DD) */
    mealDate: string
    /** 식사 시간 (HH:mm) */
    mealTime: string
    /** 식당 정보 */
    restaurant: RestaurantInfo
    /** 태그된 멤버 ID 목록 */
    taggedMemberIds: number[]
    /** 카메라 사용 여부 */
    camera: boolean
    /** 앨범 사용 여부 */
    album: boolean
}

/**
 * 좋아요 응답
 */
export interface LikePostResponse {
    /** 현재 좋아요 상태 */
    liked: boolean
    /** 좋아요 수 */
    likeCount: number
}

// ============================================================================
// 댓글 (Comment) 관련 타입
// ============================================================================

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
    parentCommentId: number
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

/**
 * 댓글 작성 요청
 */
export interface CommentPostRequest {
    /** 댓글 내용 */
    content: string
    /** 부모 댓글 ID (대댓글인 경우) */
    parentCommentId?: number
}

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

/**
 * 모집글 작성 요청
 */
export interface PostRequest extends Post {}

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

/**
 * 선호도 항목
 */
export interface PreferenceItem {
    /** 코드 */
    code: string
    /** 라벨 */
    label: string
}

/**
 * 프로필 기본 응답
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
 * 프로필 상세 응답
 */
export interface ProfileDetailResponse extends ProfileResponse {
    /** 좋아하는 음식 목록 */
    likes: PreferenceItem[]
    /** 싫어하는 음식 목록 */
    dislikes: PreferenceItem[]
    /** 알레르기 목록 */
    allergies: PreferenceItem[]
}

/**
 * 프로필 수정 요청
 */
export interface UpdateProfileRequest {
    /** 사용자명 */
    userName: string
    /** 프로필 이미지 URL */
    profileImageUrl: string
    /** 자기소개 */
    bio: string
}

// ============================================================================
// 초대 (Invitation) 관련 타입
// ============================================================================

/**
 * 초대 전송 요청
 */
export interface InvitationPostRequest {
    /** 초대 대상자 */
    inviteeId: {
        id: number
    }
    /** 초대 메시지 */
    message: string
}

/**
 * 초대 응답
 */
export interface InvitationResponse {
    /** 초대 ID */
    invitationId: number
    /** 초대자 이름 */
    inviterName: string
    /** 초대자 프로필 이미지 URL */
    inviterProfileImageUrl?: string
}

// ============================================================================
// 모임 (Meeting) 관련 타입
// ============================================================================

/**
 * 모임 참여자 정보
 */
export interface MeetingParticipant {
    /** 사용자 ID */
    userId: number
    /** 이름 */
    name: string
}

/**
 * 모임 응답
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

/**
 * 온보딩 선호도 요청
 */
export interface OnboardingPreferenceRequest extends Onboarding {}

/**
 * 온보딩 선호도 응답
 */
export interface OnboardingPreferenceResponse extends Onboarding {}

/**
 * 선호도 요약 응답
 */
export interface PreferenceSummaryResponse {
    /** 좋아하는 음식 목록 */
    likes: Menu[]
    /** 싫어하는 음식 목록 */
    dislikes: Menu[]
    /** 알레르기 목록 */
    allergies: Menu[]
}

/**
 * 선호도 메타 정보 응답
 */
export interface PreferenceMetaResponse {
    /** 온보딩 완료 시간 */
    onboardedAt: string
    /** 마지막 수정 시간 */
    lastUpdatedAt: string
    /** 리비전 번호 */
    revision: number
}

// ============================================================================
// 친구 (Friends) 관련 타입
// ============================================================================

/**
 * 친구 식사 상태 응답
 */
export interface FriendMealResponse {
    /** 멤버 ID */
    memberId: number
    /** 사용자명 */
    userName: string
    /** 프로필 이미지 URL */
    profileImageUrl: string
    /** 배고픔 상태 */
    hungry: boolean
    /** 라벨 */
    label: string
}

/**
 * 친구 식사 필터
 */
export interface FriendMealFilter {
    /** 필터 타입 */
    filter: 'ALL' | 'HUNGRY' | 'FED'
}

/**
 * 친구 식사 목록 응답
 */
export interface FriendMealListResponse extends BaseResponse<
    FriendMealResponse[]
> {}

// ============================================================================
// 식사 상태 (Meal Status) 관련 타입
// ============================================================================

/**
 * 식사 상태 업데이트 액션
 */
export type MealStatusAction = 'ATE_NOW' | 'SET_OFF'

/**
 * 식사 상태 업데이트 요청
 */
export interface UpdateMealStatusRequest {
    /** 액션: ATE_NOW(밥 먹음) / SET_OFF(공복 시작) */
    action: MealStatusAction
}

/**
 * 식사 상태 응답
 */
export interface MealStatusResponse {
    /** 상태: FED(음식 섭취) / FASTING(공복) */
    status: 'FED' | 'FASTING'
    /** 마지막 식사 시간 */
    lastMealAt: string | null
    /** 공복 분 */
    fastingMinutes: number
    /** 공복 시간(내림) */
    fastingHours: number
    /** 자동 OFF까지 남은 초 */
    secondsToAutoOff: number
}

// ============================================================================
// 챌린지 (Challenge) 관련 타입
// ============================================================================

/**
 * 주간 진행 상황
 */
export interface WeekProgress {
    /** 이번 주 각 요일 완료 여부 (월~일) */
    days: boolean[]
    /** 완료한 일수 */
    completed: number
    /** 목표 일수 */
    goal: number
}

/**
 * 월간 진행 상황
 */
export interface MonthProgress {
    /** 이번 달 게시한 일수 */
    count: number
    /** 이번 달 전체 일수 */
    goal: number
}

/**
 * 챌린지 상태 응답
 */
export interface ChallengeStatusResponse {
    /** 주간 진행 상황 */
    week: WeekProgress
    /** 월간 진행 상황 */
    month: MonthProgress
    /** 주간 목표 달성 시 true */
    weekRewardAvailable: boolean
    /** 월간 목표 달성 시 true */
    monthRewardAvailable: boolean
}

// ============================================================================
// 쿠폰 (Coupon) 관련 타입
// ============================================================================

/**
 * 쿠폰 타입
 */
export type CouponType = 'DISCOUNT' | 'SERVICE'

/**
 * 쿠폰 응답
 */
export interface CouponResponse {
    /** 쿠폰 ID */
    couponId: number
    /** 제목 */
    title: string
    /** 상점명 */
    shopName: string
    /** 쿠폰 타입 */
    type: CouponType
    /** 사용조건 요약 */
    condition: string
    /** 유효기간 */
    expiresAt: string
    /** 사용 여부 */
    used: boolean
    /** 썸네일 URL */
    thumbnailUrl: string | null
}

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
// 식당 요청 타입
// ============================================================================

/**
 * 식당 요청 정보 (요청용)
 * RestaurantInfo의 요청 버전 (nullable 필드들이 optional)
 */
export interface RestaurantRequest {
    /** 카카오 장소 ID (필수) */
    placeId: string
    /** 장소명 (필수) */
    placeName: string
    /** 지번 주소 */
    addressName?: string
    /** 도로명 주소 */
    roadAddressName?: string
    /** 전화번호 */
    phoneNumber?: string
    /** 카카오맵 URL */
    placeUrl?: string
    /** 카테고리 그룹 코드 */
    categoryGroupCode?: string
    /** 카테고리 그룹 이름 */
    categoryGroupName?: string
    /** 카테고리 이름 */
    categoryName?: string
    /** 경도 */
    x?: number
    /** 위도 */
    y?: number
}
