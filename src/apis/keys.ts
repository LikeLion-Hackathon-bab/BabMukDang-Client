/**
 * @fileoverview Query Key 중앙 관리 모듈
 *
 * TanStack Query의 캐시 키를 일관성 있게 관리합니다.
 * 이 패턴을 사용하면:
 * - 캐시 무효화(invalidation)가 쉬워집니다
 * - 오타로 인한 버그를 방지합니다
 * - IDE 자동완성을 활용할 수 있습니다
 *
 * @example
 * // Query에서 사용
 * useQuery({ queryKey: queryKeys.articles.detail(123), ... })
 *
 * // 캐시 무효화에서 사용
 * queryClient.invalidateQueries({ queryKey: queryKeys.articles.all })
 */

/**
 * 애플리케이션 전역 Query Key 정의
 */
export const queryKeys = {
    /**
     * 게시글(Article) 관련 쿼리 키
     */
    articles: {
        /** 모든 게시글 쿼리의 기본 키 */
        all: ['articles'] as const,
        /** 게시글 상세 조회 */
        detail: (id: number) => ['articles', id] as const,
        /** 게시글 댓글 목록 */
        comments: (id: number) => ['articles', id, 'comments'] as const,
        /** 홈 피드 게시글 */
        home: ['articles', 'home'] as const,
        /** 특정 작성자의 게시글 */
        byAuthor: (authorId: number) =>
            ['articles', 'author', authorId] as const,
        /** 특정 멤버의 게시글 */
        byMember: (memberId: number) =>
            ['articles', 'member', memberId] as const,
        /** 내 게시글 */
        my: ['articles', 'my'] as const
    },

    /**
     * 프로필(Profile) 관련 쿼리 키
     */
    profile: {
        /** 모든 프로필 쿼리의 기본 키 */
        all: ['profile'] as const,
        /** 내 프로필 */
        my: ['profile', 'my'] as const,
        /** 내 프로필 상세 */
        myDetail: ['profile', 'my', 'detail'] as const,
        /** 특정 멤버의 프로필 */
        member: (id: number) => ['profile', id] as const,
        /** 특정 멤버의 프로필 상세 */
        memberDetail: (id: number) => ['profile', id, 'detail'] as const,
        /** 여러 멤버의 프로필 */
        members: (ids: number[]) => ['profile', 'members', ids] as const
    },

    /**
     * 공지/모집글(Announcement) 관련 쿼리 키
     */
    announcements: {
        /** 모든 공지 쿼리의 기본 키 */
        all: ['announcements'] as const,
        /** 공지 목록 */
        list: ['announcements', 'list'] as const
    },

    /**
     * 초대(Invitation) 관련 쿼리 키
     */
    invitations: {
        /** 모든 초대 쿼리의 기본 키 */
        all: ['invitations'] as const,
        /** 초대 목록 */
        list: ['invitations', 'list'] as const
    },

    /**
     * 모임(Meeting) 관련 쿼리 키
     */
    meetings: {
        /** 모든 모임 쿼리의 기본 키 */
        all: ['meetings'] as const,
        /** 모임 목록 */
        list: ['meetings', 'list'] as const
    },

    /**
     * 친구(Friends) 관련 쿼리 키
     */
    friends: {
        /** 모든 친구 쿼리의 기본 키 */
        all: ['friends'] as const,
        /** 친구들의 식사 상태 */
        meals: (filter: string) => ['friends', 'meals', filter] as const,
        /** 내 친구 목록 */
        list: ['friends', 'list'] as const,
        /** 친구 검색 */
        search: (keyword: string) => ['friends', 'search', keyword] as const,
        /** 차단 목록 */
        blocks: ['friends', 'blocks'] as const,
        /** 받은 친구 요청 */
        requestsIncoming: ['friends', 'requests', 'incoming'] as const,
        /** 보낸 친구 요청 */
        requestsOutgoing: ['friends', 'requests', 'outgoing'] as const
    },

    /**
     * 선호도(Preference) 관련 쿼리 키
     */
    preferences: {
        /** 모든 선호도 쿼리의 기본 키 */
        all: ['preferences'] as const,
        /** 선호도 요약 */
        summary: ['preferences', 'summary'] as const,
        /** 선호도 메타정보 */
        meta: ['preferences', 'meta'] as const
    }
} as const

/**
 * Query Key 타입 유틸리티
 * @example
 * type ArticleDetailKey = QueryKeyOf<typeof queryKeys.articles.detail>
 */
export type QueryKeyOf<T> = T extends (...args: unknown[]) => infer R
    ? R
    : T extends readonly unknown[]
      ? T
      : never
