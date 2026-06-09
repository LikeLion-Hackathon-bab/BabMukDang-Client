import { endpoints } from './endpoints'

import type {
    ArticleDetailDto,
    CommentDto,
    PageArticleSummaryDto,
    ArticlePostRequest,
    LikePostResponse,
    RecruitDto,
    PostResponse,
    PostRequest,
    TokenResponse,
    InvitationResponse,
    PreferenceSummaryResponse,
    PreferenceMetaResponse,
    OnboardingPreferenceRequest,
    ProfileDto,
    ProfileDetailResponse,
    UpdateProfileRequest,
    CouponResponse,
    ChallengeStatusResponse,
    MealStatusResponse,
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealListResponse,
    FriendRequestItemResponse,
    PlanResponse,
    PresignArticleResponse,
    PresignProfileResponse
} from './types'

export type TypedEndpoint<TResponse> = string & {
    readonly __response?: TResponse
}

export function typed<TResponse>(path: string): TypedEndpoint<TResponse> {
    return path as TypedEndpoint<TResponse>
}

export type ResponseOf<TEndpoint> =
    TEndpoint extends TypedEndpoint<infer TResponse> ? TResponse : never
// src/apis/responses.ts

export const responses = {
    auth: {
        logout: typed<void>(endpoints.auth.logout),
        refresh: typed<TokenResponse>(endpoints.auth.refresh),
        signup: typed<unknown>(endpoints.auth.signup),
        login: typed<TokenResponse>(endpoints.auth.login),
        test: typed<string>(endpoints.auth.test)
    },

    announcements: {
        list: typed<RecruitDto[]>(endpoints.recruits.list),
        create: typed<PostResponse>(endpoints.recruits.create),
        close: (id: number) => typed<void>(endpoints.recruits.close(id)),
        join: (id: number) => typed<void>(endpoints.recruits.join(id))
    },
    friends: {
        meals: typed<FriendMealListResponse>(endpoints.friends.meals),
        list: typed<FriendListItemResponse[]>(endpoints.friends.list),
        search: typed<FriendListItemResponse[]>(endpoints.friends.search),
        blocks: typed<FriendBlockItemResponse[]>(endpoints.friends.blocks),
        requestsIncoming: typed<FriendRequestItemResponse[]>(
            endpoints.friends.requestsIncoming
        ),
        requestsOutgoing: typed<FriendRequestItemResponse[]>(
            endpoints.friends.requestsOutgoing
        ),
        sendRequest: (memberId: number) =>
            typed<FriendRequestItemResponse>(
                endpoints.friends.sendRequest(memberId)
            ),
        acceptRequest: (requestId: number) =>
            typed<FriendRequestItemResponse>(
                endpoints.friends.acceptRequest(requestId)
            ),
        rejectRequest: (requestId: number) =>
            typed<FriendRequestItemResponse>(
                endpoints.friends.rejectRequest(requestId)
            ),
        remove: (memberId: number) =>
            typed<void>(endpoints.friends.remove(memberId)),

        block: (memberId: number) =>
            typed<void>(endpoints.friends.block(memberId)),

        unblock: (memberId: number) =>
            typed<void>(endpoints.friends.unblock(memberId)),

        cancelRequest: (requestId: number) =>
            typed<void>(endpoints.friends.cancelRequest(requestId))
    },

    articles: {
        home: typed<PageArticleSummaryDto>(endpoints.articles.home),
        recentMeals: typed<PageArticleSummaryDto>(
            endpoints.articles.recentMeals
        ),
        byAuthor: (authorId: number) =>
            typed<PageArticleSummaryDto>(endpoints.articles.byAuthor(authorId)),
        byMember: (memberId: number) =>
            typed<PageArticleSummaryDto>(endpoints.articles.byMember(memberId)),
        my: typed<PageArticleSummaryDto>(endpoints.articles.my),

        detail: (id: number) =>
            typed<ArticleDetailDto>(endpoints.articles.detail(id)),

        create: typed<{ id: number }>(endpoints.articles.create),

        delete: (id: number) => typed<void>(endpoints.articles.delete(id)),

        like: (id: number) =>
            typed<LikePostResponse>(endpoints.articles.like(id)),

        comments: (id: number) =>
            typed<CommentDto[]>(endpoints.articles.comments(id)),

        createComment: (id: number) =>
            typed<{ id: number }>(endpoints.articles.comments(id)),

        deleteComment: (commentId: number) =>
            typed<void>(endpoints.articles.deleteComment(commentId))
    },

    invitations: {
        list: typed<InvitationResponse[]>(endpoints.invitations.list),
        me: typed<InvitationResponse[]>(endpoints.invitations.me),
        send: typed<number>(endpoints.invitations.send),
        accept: (id: number) =>
            typed<InvitationResponse>(endpoints.invitations.accept(id)),
        reject: (id: number) => typed<void>(endpoints.invitations.reject(id))
    },

    meetings: {
        list: typed<PlanResponse[]>(endpoints.plans.list),
        create: typed<PlanResponse>(endpoints.plans.create),
        uncompleted: typed<PlanResponse[]>(endpoints.plans.uncompleted),
        completed: typed<PlanResponse[]>(endpoints.plans.completed)
    },

    preferences: {
        mySummary: typed<PreferenceSummaryResponse>(
            endpoints.preferences.mySummary
        ),
        myMeta: typed<PreferenceMetaResponse>(endpoints.preferences.myMeta),
        onboarding: typed<void>(endpoints.preferences.onboarding),
        byMember: (memberId: number) =>
            typed<PageArticleSummaryDto>(
                endpoints.preferences.byMember(memberId)
            )
    },

    profile: {
        me: typed<ProfileDto>(endpoints.members.me),
        myProfile: typed<ProfileDto>(endpoints.members.myProfile),
        myProfileDetail: typed<ProfileDetailResponse>(
            endpoints.members.myProfileDetail
        ),
        member: (id: number) =>
            typed<ProfileDto>(endpoints.members.profile(id)),
        memberDetail: (id: number) =>
            typed<ProfileDetailResponse>(endpoints.members.profileDetail(id)),
        updateProfile: typed<ProfileDto>(endpoints.members.updateProfile)
    },

    mealStatus: {
        my: typed<MealStatusResponse>(endpoints.mealStatus.my),
        update: typed<MealStatusResponse | void>(endpoints.mealStatus.update)
    },
    members: {
        me: typed<ProfileDto>(endpoints.members.me),
        myProfile: typed<ProfileDto>(endpoints.members.myProfile),
        myProfileDetail: typed<ProfileDetailResponse>(
            endpoints.members.myProfileDetail
        ),
        mealStatus: typed<MealStatusResponse>(endpoints.mealStatus.my)
    },
    upload: {
        presignArticle: typed<PresignArticleResponse>(
            endpoints.upload.presignArticle
        ),
        presignProfile: typed<PresignProfileResponse>(
            endpoints.upload.presignProfile
        )
    },
    challenges: {
        me: typed<ChallengeStatusResponse>(endpoints.challenges.me),
        reward: typed<unknown>(endpoints.challenges.reward)
    },

    coupons: {
        my: typed<CouponResponse[]>(endpoints.coupons.my),
        use: (id: number) => typed<void>(endpoints.coupons.use(id))
    }
} as const
