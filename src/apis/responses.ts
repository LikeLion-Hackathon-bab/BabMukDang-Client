import {
    apiContract,
    type EndpointContract,
    type HttpMethod,
    type ResponseOf as ContractResponseOf
} from '@kimdaegyu/babmukdang-shared/domain'
import { domainId } from '@/domain/factories'

/**
 * @deprecated API 함수는 responses registry 대신 contractClient + apiContract를 직접 사용합니다.
 * 이 파일은 기존 테스트/호환 import를 위해 남겨 둔 얇은 path registry입니다.
 */
export type TypedEndpoint<TResponse> = string & {
    readonly __response?: TResponse
}

type AnyContractEndpoint = EndpointContract<
    HttpMethod,
    string,
    any,
    any,
    any,
    any
>

const resolvePath = (path: string, params: Record<string, string | number> = {}) =>
    path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) =>
        encodeURIComponent(String(params[key]))
    )

export function typed<E extends AnyContractEndpoint>(
    contract: E,
    pathParams?: Record<string, string | number>
): TypedEndpoint<ContractResponseOf<E>> {
    return resolvePath(contract.path, pathParams) as TypedEndpoint<
        ContractResponseOf<E>
    >
}

export const typedLegacy = <TResponse>(path: string): TypedEndpoint<TResponse> =>
    path as TypedEndpoint<TResponse>

export type ResponseOf<TEndpoint> =
    TEndpoint extends TypedEndpoint<infer TResponse> ? TResponse : never

export const responses = {
    auth: {
        logout: typed(apiContract.auth.logout),
        refresh: typed(apiContract.auth.refresh),
        signup: typed(apiContract.auth.signup),
        login: typed(apiContract.auth.login),
        test: typedLegacy<string>('/auth/test')
    },

    announcements: {
        list: typed(apiContract.recruits.list),
        create: typed(apiContract.recruits.create),
        close: (id: number) =>
            typed(apiContract.recruits.close, { recruitId: domainId.recruit(id) }),
        join: (id: number) =>
            typed(apiContract.recruits.join, { recruitId: domainId.recruit(id) })
    },

    friends: {
        meals: typed(apiContract.mealStatus.friendMealStatus),
        list: typed(apiContract.friends.list),
        search: typed(apiContract.members.search),
        blocks: typed(apiContract.friends.blockList),
        requestsIncoming: typed(apiContract.friends.incomingRequest),
        requestsOutgoing: typed(apiContract.friends.outgoingRequest),
        sendRequest: (memberId: number) =>
            typed(apiContract.friends.sendRequest, { memberId: domainId.member(memberId) }),
        acceptRequest: (requestId: number) =>
            typed(apiContract.friends.acceptRequest, {
                requestId: domainId.friendRequest(requestId)
            }),
        rejectRequest: (requestId: number) =>
            typed(apiContract.friends.rejectRequest, {
                requestId: domainId.friendRequest(requestId)
            }),
        remove: (memberId: number) =>
            typed(apiContract.friends.unfriend, { memberId: domainId.member(memberId) }),
        block: (memberId: number) =>
            typed(apiContract.friends.block, { memberId: domainId.member(memberId) }),
        unblock: (memberId: number) =>
            typed(apiContract.friends.unblock, { memberId: domainId.member(memberId) }),
        cancelRequest: (requestId: number) =>
            typed(apiContract.friends.cancelRequest, {
                requestId: domainId.friendRequest(requestId)
            })
    },

    articles: {
        home: typed(apiContract.articles.list),
        recentMeals: typed(apiContract.articles.list),
        byAuthor: (authorId: number) =>
            typed(apiContract.articles.byMember, { memberId: domainId.member(authorId) }),
        byMember: (memberId: number) =>
            typed(apiContract.articles.byMember, { memberId: domainId.member(memberId) }),
        my: typed(apiContract.articles.my),
        detail: (id: number) =>
            typed(apiContract.articles.detail, { articleId: domainId.article(id) }),
        create: typed(apiContract.articles.create),
        delete: (id: number) =>
            typed(apiContract.articles.delete, { articleId: domainId.article(id) }),
        like: (id: number) =>
            typed(apiContract.articles.like, { articleId: domainId.article(id) }),
        comments: (id: number) =>
            typedLegacy(`/articles/${id}/comments`),
        createComment: (id: number) =>
            typed(apiContract.articles.createComment, { articleId: domainId.article(id) }),
        deleteComment: (commentId: number) =>
            typed(apiContract.articles.deleteComment, { commentId: domainId.comment(commentId) })
    },

    invitations: {
        list: typed(apiContract.invitations.list),
        me: typed(apiContract.invitations.list),
        send: typed(apiContract.invitations.send),
        accept: (id: number) =>
            typed(apiContract.invitations.accept, {
                invitationId: domainId.invitation(id)
            }),
        reject: (id: number) =>
            typed(apiContract.invitations.reject, {
                invitationId: domainId.invitation(id)
            })
    },

    meetings: {
        list: typed(apiContract.plans.list),
        create: typedLegacy('/plans'),
        uncompleted: typedLegacy('/plans'),
        completed: typedLegacy('/plans/completed')
    },

    preferences: {
        mySummary: typed(apiContract.members.myProfile),
        myMeta: typed(apiContract.members.myProfile),
        onboarding: typed(apiContract.members.createProfile),
        byMember: (memberId: number) =>
            typed(apiContract.articles.byMember, { memberId: domainId.member(memberId) })
    },

    profile: {
        me: typed(apiContract.members.me),
        myProfile: typed(apiContract.members.me),
        myProfileDetail: typed(apiContract.members.myProfile),
        member: (id: number) =>
            typed(apiContract.members.memberProfile, { memberId: domainId.member(id) }),
        memberDetail: (id: number) =>
            typed(apiContract.members.memberProfile, { memberId: domainId.member(id) }),
        updateProfile: typed(apiContract.members.updateProfile)
    },

    mealStatus: {
        my: typed(apiContract.mealStatus.my),
        update: typed(apiContract.mealStatus.updateMealStatus)
    },

    members: {
        me: typed(apiContract.members.me),
        myProfile: typed(apiContract.members.me),
        myProfileDetail: typed(apiContract.members.myProfile),
        mealStatus: typed(apiContract.mealStatus.my)
    },

    upload: {
        presignArticle: typed(apiContract.articles.presignArticleImage),
        presignProfile: typed(apiContract.members.presignProfileImage)
    },

    challenges: {
        me: typed(apiContract.challenges.status),
        reward: typed(apiContract.challenges.claimReward)
    },

    coupons: {
        my: typed(apiContract.coupons.list),
        use: (id: number) => typed(apiContract.coupons.use, { couponId: domainId.coupon(id) })
    }
} as const
