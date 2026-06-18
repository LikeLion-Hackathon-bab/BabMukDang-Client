/**
 * @fileoverview Query Key 중앙 관리 모듈
 *
 * TanStack Query의 캐시 키를 일관성 있게 관리합니다.
 */
export const queryKeys = {
    articles: {
        all: ['articles'] as const,
        detail: (id: number) => ['articles', id] as const,
        comments: (id: number) => ['articles', id, 'comments'] as const,
        home: ['articles', 'home'] as const,
        byAuthor: (authorId: number) =>
            ['articles', 'author', authorId] as const,
        byMember: (memberId: number) =>
            ['articles', 'member', memberId] as const,
        my: ['articles', 'my'] as const
    },

    profile: {
        all: ['profile'] as const,
        my: ['profile', 'my'] as const,
        myDetail: ['profile', 'my', 'detail'] as const,
        locationSettings: ['profile', 'my', 'location-settings'] as const,
        member: (id: number) => ['profile', id] as const,
        memberDetail: (id: number) => ['profile', id, 'detail'] as const,
        members: (ids: number[]) => ['profile', 'members', ids] as const
    },

    mealPlans: {
        all: ['mealPlans'] as const,
        my: ['mealPlans', 'my'] as const,
        homeDashboard: ['mealPlans', 'homeDashboard'] as const,
        map: ['mealPlans', 'map'] as const,
        detail: (mealPlanId: string) => ['mealPlans', mealPlanId] as const,
        chatMessages: (mealPlanId: string) =>
            ['mealPlans', mealPlanId, 'chatMessages'] as const,
        guestChatMessages: (token: string, sessionToken?: string | null) =>
            ['mealPlans', 'guestChatMessages', token, sessionToken ?? ''] as const,
        receivedInvites: ['mealPlans', 'invites', 'received'] as const,
        sentInvites: ['mealPlans', 'invites', 'sent'] as const,
        nearbyFriendExposureEligibility: ['mealPlans', 'nearbyFriends', 'eligibility'] as const,
        nearbyFriends: ['mealPlans', 'nearbyFriends'] as const,
        sharePreview: (token: string) =>
            ['mealPlans', 'sharePreview', token] as const,
        guestSession: (token: string, sessionToken?: string | null) =>
            ['mealPlans', 'guestSession', token, sessionToken ?? ''] as const
    },

    mealGroups: {
        all: ['mealGroups'] as const,
        list: ['mealGroups', 'list'] as const,
        detail: (mealGroupId: string) => ['mealGroups', mealGroupId] as const,
        history: (mealGroupId: string) => ['mealGroups', mealGroupId, 'history'] as const,
        preferences: (mealGroupId: string) => ['mealGroups', mealGroupId, 'preferences'] as const
    },

    friends: {
        all: ['friends'] as const,
        meals: (filter: string) => ['friends', 'meals', filter] as const,
        list: ['friends', 'list'] as const,
        search: (keyword: string) => ['friends', 'search', keyword] as const,
        blocks: ['friends', 'blocks'] as const,
        requestsIncoming: ['friends', 'requests', 'incoming'] as const,
        requestsOutgoing: ['friends', 'requests', 'outgoing'] as const
    },

    preferences: {
        all: ['preferences'] as const,
        my: ['preferences', 'my'] as const,
        summary: ['preferences', 'summary'] as const,
        meta: ['preferences', 'meta'] as const
    },

    notifications: {
        all: ['notifications'] as const
    },

    pushTokens: {
        all: ['pushTokens'] as const
    },

    liveActivities: {
        all: ['liveActivities'] as const,
        mealPlan: (mealPlanId: string) =>
            ['liveActivities', 'mealPlan', mealPlanId] as const
    }
} as const

export type QueryKeyOf<T> = T extends (...args: unknown[]) => infer R
    ? R
    : T extends readonly unknown[]
      ? T
      : never
