/**
 * @fileoverview API 엔드포인트 및 Request/Response 타입 중앙 관리
 *
 * 모든 API 엔드포인트와 해당 요청/응답 타입을 한 곳에서 정의합니다.
 * 엔드포인트 변경 시 이 파일만 수정하면 됩니다.
 *
 * @example
 * import { endpoints, api } from './endpoints'
 *
 * // 엔드포인트만 사용
 * client.get(endpoints.articles.detail(123))
 *
 * // 타입과 함께 사용
 * const data: api.articles.DetailResponse = await client.get(endpoints.articles.detail(123))
 */

import type {
    ArticleDetailResponse,
    ArticlePostRequest,
    BaseResponse,
    CommentPostRequest,
    ChallengeStatusResponse,
    CouponResponse,
    LikePostResponse,
    MealStatusResponse,
    OnboardingPreferenceRequest,
    PageArticleSummaryResponse,
    PostRequest,
    PostResponse,
    PreferenceMetaResponse,
    PreferenceSummaryResponse,
    ProfileDetailResponse,
    ProfileResponse,
    TokenResponse,
    UpdateMealStatusRequest,
    UpdateProfileRequest
} from './types'

// ============================================================================
// 엔드포인트 정의
// ============================================================================

/**
 * API 엔드포인트 정의
 *
 * 각 도메인별로 그룹화되어 있으며,
 * 동적 파라미터가 필요한 경우 함수로 정의됩니다.
 */
export const endpoints = {
    // =========================================================================
    // Auth (인증)
    // =========================================================================
    auth: {
        /** 카카오 로그인 */
        kakaoLogin: '/auth/login/kakao',
        /** 로그아웃 */
        logout: '/auth/logout',
        /** 토큰 갱신 */
        refresh: '/auth/refresh',
        /** 온보딩 선호도 저장 */
        onboardingPreference: '/auth/onboarding/preference'
    },

    // =========================================================================
    // Articles (게시글)
    // =========================================================================
    articles: {
        /** 게시글 목록 (홈 피드) */
        home: '/articles/home',
        /** 게시글 상세 */
        detail: (id: number) => `/articles/${id}`,
        /** 게시글 생성 */
        create: '/articles',
        /** 게시글 삭제 */
        delete: (id: number) => `/articles/${id}`,
        /** 게시글 좋아요 */
        like: (id: number) => `/articles/${id}/like`,
        /** 게시글 댓글 목록 */
        comments: (id: number) => `/articles/${id}/comments`,
        /** 댓글 삭제 */
        deleteComment: (commentId: number) => `/articles/comments/${commentId}`,
        /** 특정 작성자의 게시글 */
        byAuthor: (authorId: number) => `/articles?authorId=${authorId}`,
        /** 특정 멤버의 게시글 */
        byMember: (memberId: number) => `/members/${memberId}/articles`,
        /** 내 게시글 */
        my: '/members/me/articles'
    },

    // =========================================================================
    // Members (프로필)
    // =========================================================================
    members: {
        /** 내 프로필 */
        myProfile: '/members/me/profile',
        /** 내 프로필 상세 */
        myProfileDetail: '/members/me/profile/detail',
        /** 특정 멤버 프로필 */
        profile: (id: number) => `/members/${id}/profile`,
        /** 특정 멤버 프로필 상세 */
        profileDetail: (id: number) => `/members/${id}/profile/detail`,
        /** 프로필 수정 */
        updateProfile: '/members/me/profile'
    },

    // =========================================================================
    // Posts (모집글/공지)
    // =========================================================================
    posts: {
        /** 모집글 목록 */
        list: '/posts',
        /** 모집글 생성 */
        create: '/posts',
        /** 모집글 마감 */
        close: (id: number) => `/posts/${id}/close`,
        /** 모집글 참여 */
        join: (id: number) => `/posts/${id}/join`,
        /** 모집글 구독 (알림) */
        subscribe: (id: number) => `/posts/${id}/subscribe`
    },

    // =========================================================================
    // Invitations (초대)
    // =========================================================================
    invitations: {
        /** 초대 목록 */
        list: '/invitations',
        /** 초대 전송 */
        send: '/invitations/send',
        /** 초대 수락 */
        accept: (id: number) => `/invitations/${id}/accept`,
        /** 초대 거절 */
        reject: (id: number) => `/invitations/${id}/reject`
    },

    // =========================================================================
    // Meetings (모임)
    // =========================================================================
    meetings: {
        /** 모임 목록 */
        list: '/meetings'
    },

    // =========================================================================
    // Friends (친구)
    // =========================================================================
    friends: {
        /** 친구들의 식사 상태 */
        meals: '/friends/me/meals'
    },

    // =========================================================================
    // Preferences (선호도)
    // =========================================================================
    preferences: {
        /** 내 선호도 요약 */
        mySummary: '/preferences/me',
        /** 내 선호도 메타 정보 */
        myMeta: '/preferences/me/meta'
    },

    // =========================================================================
    // Meal Status (식사 상태)
    // =========================================================================
    mealStatus: {
        /** 내 식사 상태 조회 */
        my: '/meal-status/me',
        /** 식사 상태 업데이트 */
        update: '/meal-status/me'
    },

    // =========================================================================
    // Challenge (챌린지)
    // =========================================================================
    challenge: {
        /** 챌린지 상태 조회 */
        status: '/challenge/status'
    },

    // =========================================================================
    // Coupons (쿠폰)
    // =========================================================================
    coupons: {
        /** 내 쿠폰 목록 */
        my: '/coupons/me',
        /** 쿠폰 사용 */
        use: (id: number) => `/coupons/${id}/use`
    }
} as const

// ============================================================================
// API 타입 정의 (Request/Response)
// ============================================================================

/**
 * API 도메인별 Request/Response 타입
 *
 * @example
 * // 게시글 생성 시
 * const body: api.articles.CreateRequest = { ... }
 * const response: api.articles.DetailResponse = await articleApi.create(body)
 */
export const api = {
    auth: {
        /** 토큰 갱신 응답 */
        RefreshResponse: {} as BaseResponse<TokenResponse>,
        /** 온보딩 선호도 요청 */
        OnboardingRequest: {} as OnboardingPreferenceRequest
    },
    articles: {
        /** 게시글 목록 응답 */
        ListResponse: {} as PageArticleSummaryResponse,
        /** 게시글 상세 응답 */
        DetailResponse: {} as ArticleDetailResponse,
        /** 게시글 생성 요청 */
        CreateRequest: {} as ArticlePostRequest,
        /** 좋아요 응답 */
        LikeResponse: {} as LikePostResponse,
        /** 댓글 작성 요청 */
        CommentRequest: {} as CommentPostRequest
    },
    members: {
        /** 프로필 응답 */
        ProfileResponse: {} as BaseResponse<ProfileResponse>,
        /** 프로필 상세 응답 */
        ProfileDetailResponse: {} as BaseResponse<ProfileDetailResponse>,
        /** 프로필 수정 요청 */
        UpdateRequest: {} as UpdateProfileRequest
    },
    posts: {
        /** 모집글 목록 응답 */
        ListResponse: {} as BaseResponse<PostResponse[]>,
        /** 모집글 생성 요청 */
        CreateRequest: {} as PostRequest
    },
    preferences: {
        /** 선호도 요약 응답 */
        SummaryResponse: {} as PreferenceSummaryResponse,
        /** 선호도 메타 응답 */
        MetaResponse: {} as PreferenceMetaResponse
    },
    mealStatus: {
        /** 식사 상태 응답 */
        Response: {} as MealStatusResponse,
        /** 식사 상태 업데이트 요청 */
        UpdateRequest: {} as UpdateMealStatusRequest
    },
    challenge: {
        /** 챌린지 상태 응답 */
        StatusResponse: {} as ChallengeStatusResponse
    },
    coupons: {
        /** 쿠폰 목록 응답 */
        ListResponse: {} as BaseResponse<CouponResponse[]>
    }
} as const

// ============================================================================
// 타입 추출 헬퍼
// ============================================================================

/**
 * 엔드포인트 타입 (자동완성용)
 */
export type Endpoints = typeof endpoints

/**
 * API 타입 (자동완성용)
 */
export type Api = typeof api
