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
    ArticleDetailDto,
    ArticleDetailResponse,
    ArticlePostRequest,
    CommentPostRequest,
    ChallengeStatusResponse,
    CouponResponse,
    LikePostResponse,
    MealStatusResponse,
    OnboardingPreferenceRequest,
    PageArticleSummaryDto,
    PageArticleSummaryResponse,
    PostRequest,
    PostResponse,
    PreferenceMetaResponse,
    PreferenceSummaryResponse,
    ProfileDetailResponse,
    ProfileDto,
    RecruitDto,
    RecruitListResponse,
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
        /** 카카오 로그인 진입 */
        kakaoLogin: '/auth/kakao',
        /** 로그아웃 */
        logout: '/auth/logout',
        /** 토큰 갱신 */
        refresh: '/auth/refresh',
        /** 이메일 회원가입 (테스트 계정 발급용) */
        signup: '/auth/signup',
        /** 이메일 로그인 (테스트 계정 발급용) */
        login: '/auth/login',
        /** 테스트용 JWT 발급 */
        test: '/auth/test'
    },

    // =========================================================================
    // App (루트)
    // =========================================================================
    app: {
        /** 헬스체크/루트 */
        root: ''
    },

    // =========================================================================
    // Onboarding (온보딩)
    // =========================================================================
    onboarding: {
        /** 온보딩 정보 등록 */
        create: '/onboarding'
    },

    // =========================================================================
    // Referrals (추천인)
    // =========================================================================
    referrals: {
        /** 추천 코드 발급 */
        create: '/referrals',
        /** 내 추천 코드 목록 */
        me: '/referrals/me',
        /** 추천 코드 사용 */
        redeem: '/referrals/redeem'
    },

    // =========================================================================
    // Articles (게시글)
    // =========================================================================
    articles: {
        /** 게시글 목록 (홈 피드) */
        home: '/articles/home',
        /** 최근 식사 게시글 */
        recentMeals: '/articles/meals/recent',
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
        byAuthor: (authorId: number) => `/articles/by-author/${authorId}`,
        /** 특정 멤버의 게시글 */
        byMember: (memberId: number) => `/members/${memberId}/articles`,
        /** 내 게시글 */
        my: '/members/me/articles'
    },

    // =========================================================================
    // Members (프로필)
    // =========================================================================
    members: {
        /** 내 정보 */
        me: '/members/me',
        /** 내 활동 요약 */
        summary: '/members/me/summary',
        /** 특정 멤버 정보 */
        byId: (id: number) => `/members/${id}`,
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
    // Recruits (모집글/공지)
    // =========================================================================
    recruits: {
        /** 모집글 목록 */
        list: '/recruits',
        /** 모집글 생성 */
        create: '/recruits',
        /** 모집글 마감 */
        close: (id: number) => `/recruits/${id}/close`,
        /** 모집글 참여 */
        join: (id: number) => `/recruits/${id}/join`
    },

    // =========================================================================
    // Subscriptions (구독)
    // =========================================================================
    subscriptions: {
        /** 모집글 구독 (알림) */
        recruit: (recruitId: number) => `/subscriptions/recruits/${recruitId}`,
        /** 게시물(모집글) 직접 구독 */
        direct: (postId: number) => `/subscribe/${postId}`
    },

    // =========================================================================
    // Invitations (초대)
    // =========================================================================
    invitations: {
        /** 초대 목록 */
        list: '/invitations',
        /** 내가 받은 초대 목록 */
        me: '/invitations/me',
        /** 초대 전송 */
        send: '/invitations/send',
        /** 초대 수락 */
        accept: (id: number) => `/invitations/${id}/accept`,
        /** 초대 거절 */
        reject: (id: number) => `/invitations/${id}/reject`
    },

    // =========================================================================
    // Plans (모임)
    // =========================================================================
    plans: {
        /** 모임 목록 */
        list: '/plans',
        /** 모임 생성 */
        create: '/plans',
        /** 진행 예정 모임 목록 */
        uncompleted: '/plans/uncompleted',
        /** 완료된 모임 목록 */
        completed: '/plans/completed'
    },

    // =========================================================================
    // Friends (친구)
    // =========================================================================
    friends: {
        /** 친구들의 식사 상태 */
        meals: '/friends/me/meals',
        /** 내 친구 목록 */
        list: '/friends/me',
        /** 내 친구 검색 */
        search: '/friends/search',
        /** 친구 삭제 */
        remove: (memberId: number) => `/friends/${memberId}`,
        /** 차단 목록 */
        blocks: '/friends/blocks/me',
        /** 차단 */
        block: (memberId: number) => `/friends/blocks/${memberId}`,
        /** 차단 해제 */
        unblock: (memberId: number) => `/friends/blocks/${memberId}`,
        /** 받은 친구 요청 */
        requestsIncoming: '/friends/requests/incoming',
        /** 보낸 친구 요청 */
        requestsOutgoing: '/friends/requests/outgoing',
        /** 친구 요청 생성 */
        sendRequest: (memberId: number) => `/friends/requests/${memberId}`,
        /** 친구 요청 수락 */
        acceptRequest: (requestId: number) =>
            `/friends/requests/${requestId}/accept`,
        /** 친구 요청 거절 */
        rejectRequest: (requestId: number) =>
            `/friends/requests/${requestId}/reject`,
        /** 친구 요청 취소 */
        cancelRequest: (requestId: number) => `/friends/requests/${requestId}`
    },

    // =========================================================================
    // Preferences (선호도)
    // =========================================================================
    preferences: {
        /** 온보딩 선호도 저장 */
        onboarding: '/preferences/onboarding',
        /** 내 선호도 요약 */
        mySummary: '/preferences/me',
        /** 내 선호도 메타 정보 */
        myMeta: '/preferences/me/meta',
        /** 특정 멤버의 선호도 기반 게시글 */
        byMember: (memberId: number) => `/preferences/members/${memberId}`
    },

    // =========================================================================
    // Meal Status (식사 상태)
    // =========================================================================
    mealStatus: {
        /** 내 식사 상태 조회 */
        my: '/members/me/meal-status',
        /** 식사 상태 업데이트 */
        update: '/members/me/meal-status'
    },

    // =========================================================================
    // Challenges (챌린지)
    // =========================================================================
    challenges: {
        /** 챌린지 상태 조회 */
        me: '/challenges/me',
        /** 챌린지 보상 수령 */
        reward: '/challenges/me/reward'
    },

    // =========================================================================
    // Coupons (쿠폰)
    // =========================================================================
    coupons: {
        /** 내 쿠폰 목록 */
        my: '/coupons/me',
        /** 쿠폰 사용 */
        use: (id: number) => `/coupons/${id}/use`
    },

    // =========================================================================
    // Upload (업로드)
    // =========================================================================
    upload: {
        presignArticle: '/uploads/presign-article',
        presignProfile: '/uploads/presign-profile'
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
        /** 토큰 갱신 응답 (Backend DTO) */
        RefreshResponse: {} as TokenResponse,
        /** 온보딩 선호도 요청 */
        OnboardingRequest: {} as OnboardingPreferenceRequest
    },
    articles: {
        /** 게시글 목록 응답 */
        ListResponse: {} as PageArticleSummaryDto,
        /** 게시글 상세 응답 */
        DetailResponse: {} as ArticleDetailDto,
        /** 게시글 생성 요청 */
        CreateRequest: {} as ArticlePostRequest,
        /** 좋아요 응답 */
        LikeResponse: {} as LikePostResponse,
        /** 댓글 작성 요청 */
        CommentRequest: {} as CommentPostRequest
    },
    members: {
        /** 프로필 응답 (Backend DTO) */
        ProfileResponse: {} as ProfileDto,
        /** 프로필 상세 응답 (Backend DTO) */
        ProfileDetailResponse: {} as ProfileDetailResponse,
        /** 프로필 수정 요청 */
        UpdateRequest: {} as UpdateProfileRequest
    },
    recruits: {
        /** 모집글 목록 응답 */
        ListResponse: {} as RecruitListResponse,
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
    challenges: {
        /** 챌린지 상태 응답 */
        StatusResponse: {} as ChallengeStatusResponse
    },
    coupons: {
        /** 쿠폰 목록 응답 */
        ListResponse: {} as CouponResponse[]
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
