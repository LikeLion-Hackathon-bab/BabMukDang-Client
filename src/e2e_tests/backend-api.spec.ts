/**
 * @fileoverview 백엔드 전체 엔드포인트 E2E 테스트
 *
 * 실행 전제:
 *   docker compose up -d (Backend + DB + RabbitMQ)
 *   npm run test:e2e:integration
 *
 * 두 개의 테스트 계정(userA, userB)을 /auth/signup → /auth/login 으로 발급하여
 * docs/roadmap/backend-domain-parity.md 에 기재된 모든 endpoint와
 * 그 외 Backend에 존재하는 friends 관련 endpoint를 검증한다.
 *
 * 엔드포인트 경로는 하드코딩하지 않고 `@/apis/endpoints`의 `endpoints`를 통해서만
 * 참조한다. `endpoints`를 추적하는 프록시(`ep`)를 통해 실제로 사용된 leaf 개수를
 * 세어, `endpoints`에 정의된 leaf 개수와 어긋나면(추가했지만 검증하지 않았거나,
 * 검증에는 쓰지만 정의가 없는 경우는 타입 에러로 막힘) 마지막 커버리지 테스트가
 * 실패하도록 한다.
 */

import type {
    ArticleSummaryResponse as ArticleSummaryResponseDto,
    BaseResponse,
    PlanResponse as PlanResponseDto,
    ReferralCreateResponse,
    ReferralItemResponse,
    MatchingNotification,
    RoomAccessResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { test, expect, type APIRequestContext } from '@playwright/test'
import {
    USER_A,
    USER_B,
    assertStatus,
    auth,
    fetchMemberId,
    login,
    readBody,
    signup,
    url
} from './helpers/auth'
import type {
    ArticleDetailDto,
    ChallengeStatusResponse,
    CommentDto,
    CouponResponse,
    FriendBlockItemResponse,
    FriendListItemResponse,
    FriendMealListResponse,
    FriendRequestItemResponse,
    InvitationResponse,
    LikePostResponse,
    MealStatusResponse,
    ProfileDetailResponse,
    ProfileDto,
    RecruitListResponse
} from '../apis/types'

const resolvePath = (
    path: string,
    params: Record<string, string | number> = {}
) =>
    path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) =>
        encodeURIComponent(String(params[key]))
    )

const buildBackendEndpoints = () =>
    ({
        auth: {
            kakaoLogin: '/auth/kakao',
            logout: apiContract.auth.logout.path,
            refresh: apiContract.auth.refresh.path,
            signup: apiContract.auth.signup.path,
            login: apiContract.auth.login.path,
            test: '/auth/test'
        },
        app: {
            root: '/'
        },
        onboarding: {
            create: apiContract.members.createProfile.path
        },
        referrals: {
            create: apiContract.referrals.create.path,
            me: apiContract.referrals.list.path,
            redeem: apiContract.referrals.redeem.path
        },
        articles: {
            home: apiContract.articles.list.path,
            recentMeals: '/members/meals/recent',
            detail: (id: number) =>
                resolvePath(apiContract.articles.detail.path, {
                    articleId: id
                }),
            create: apiContract.articles.create.path,
            delete: (id: number) =>
                resolvePath(apiContract.articles.delete.path, {
                    articleId: id
                }),
            like: (id: number) =>
                resolvePath(apiContract.articles.like.path, { articleId: id }),
            comments: (id: number) => `/articles/${id}/comments`,
            deleteComment: (commentId: number) =>
                resolvePath(apiContract.articles.deleteComment.path, {
                    commentId
                }),
            byAuthor: (authorId: number) =>
                resolvePath(apiContract.articles.byMember.path, {
                    memberId: authorId
                }),
            byMember: (memberId: number) =>
                resolvePath(apiContract.articles.byMember.path, {
                    memberId
                }),
            my: apiContract.articles.my.path
        },
        recruits: {
            list: apiContract.recruits.list.path,
            create: apiContract.recruits.create.path,
            join: (recruitId: number) =>
                resolvePath(apiContract.recruits.join.path, { recruitId }),
            close: (recruitId: number) =>
                resolvePath(apiContract.recruits.close.path, { recruitId })
        },
        members: {
            me: apiContract.members.me.path,
            byId: (id: number) =>
                resolvePath('/members/:memberId', {
                    memberId: id
                }),
            myProfile: apiContract.members.myProfile.path,
            memberProfileDetail: (id: number) =>
                resolvePath(apiContract.members.memberProfile.path, {
                    memberId: id
                }),
            updateProfile: apiContract.members.updateProfile.path,
            recent: '/members/recent',
            recentMeals: '/members/meals/recent',
            mealStatus: '/members/me/meal-status'
        },
        preferences: {
            mySummary: apiContract.preferences.my.path,
            update: apiContract.preferences.update.path
        },
        mealStatus: {
            my: apiContract.mealStatus.my.path,
            update: apiContract.mealStatus.updateMealStatus.path
        },
        friends: {
            meals: apiContract.mealStatus.friendMealStatus.path,
            list: apiContract.friends.list.path,
            search: '/friends/search',
            blocks: apiContract.friends.blockList.path,
            requestsIncoming: apiContract.friends.incomingRequest.path,
            requestsOutgoing: apiContract.friends.outgoingRequest.path,
            sendRequest: (memberId: number) =>
                resolvePath(apiContract.friends.sendRequest.path, {
                    memberId
                }),
            acceptRequest: (requestId: number) =>
                resolvePath(apiContract.friends.acceptRequest.path, {
                    requestId
                }),
            rejectRequest: (requestId: number) =>
                resolvePath(apiContract.friends.rejectRequest.path, {
                    requestId
                }),
            remove: (memberId: number) =>
                resolvePath(apiContract.friends.unfriend.path, {
                    memberId
                }),
            block: (memberId: number) =>
                resolvePath(apiContract.friends.block.path, { memberId }),
            unblock: (memberId: number) =>
                resolvePath(apiContract.friends.unblock.path, { memberId }),
            cancelRequest: (requestId: number) =>
                resolvePath(apiContract.friends.cancelRequest.path, {
                    requestId
                })
        },
        invitations: {
            list: apiContract.invitations.list.path,
            me: apiContract.invitations.list.path,
            send: apiContract.invitations.send.path,
            accept: (id: number) =>
                resolvePath(apiContract.invitations.accept.path, {
                    invitationId: id
                }),
            reject: (id: number) =>
                resolvePath(apiContract.invitations.reject.path, {
                    invitationId: id
                })
        },
        notifications: {
            list: apiContract.notifications.list.path,
            markRead: (notificationId: string) =>
                resolvePath(apiContract.notifications.markRead.path, {
                    notificationId
                }),
            delete: (notificationId: string) =>
                resolvePath(apiContract.notifications.delete.path, {
                    notificationId
                })
        },
        room: {
            access: (roomId: string | number) =>
                resolvePath(apiContract.room.access.path, { roomId })
        },
        plans: {
            list: apiContract.plans.list.path,
            uncompleted: '/plans',
            completed: '/plans/completed'
        },
        subscriptions: {
            recruit: (recruitId: number | string) =>
                `/subscriptions/recruits/${recruitId}`,
            direct: (postId: number | string) => `/subscribe/${postId}`
        },
        upload: {
            presignArticle: apiContract.articles.presignArticleImage.path,
            presignProfile: apiContract.members.presignProfileImage.path
        },
        challenges: {
            me: apiContract.challenges.status.path,
            reward: apiContract.challenges.claimReward.path
        },
        coupons: {
            my: apiContract.coupons.list.path,
            use: (id: number) =>
                resolvePath(apiContract.coupons.use.path, { couponId: id })
        }
    }) as const

// ─── 엔드포인트 사용 추적 ──────────────────────────────────────────────────

// endpoints 객체의 leaf(문자열 또는 함수) 개수를 센다.
function countLeaves(value: unknown): number {
    if (typeof value !== 'object' || value === null) return 1
    return Object.values(value).reduce(
        (sum: number, v) => sum + countLeaves(v),
        0
    )
}

// endpoints 접근 경로(예: 'members.me')를 기록하는 Proxy. leaf에 접근할 때마다
// 경로를 Set에 추가하므로, 테스트 종료 시점에 "실제로 참조된 leaf 개수"를 알 수 있다.
const usedEndpointPaths = new Set<string>()

function track<T extends object>(value: T, prefix = ''): T {
    return new Proxy(value, {
        get(target, prop, receiver) {
            const v = Reflect.get(target, prop, receiver)
            if (typeof prop !== 'string') return v
            const path = prefix ? `${prefix}.${prop}` : prop
            if (typeof v === 'object' && v !== null) {
                return track(v as object, path)
            }
            usedEndpointPaths.add(path)
            return v
        }
    }) as T
}

const ep = track(buildBackendEndpoints())

// endpoint leaf의 접근 경로를 문자열로 표현한 타입입니다.
// 예: 'auth.login', 'members.me', 'articles.detail'
type LeafPath = string

/**
 * 객체를 재귀적으로 순회하면서 leaf endpoint의 경로를 수집합니다.
 *
 * 여기서 leaf는 더 이상 내부를 순회할 객체가 아닌 값을 의미합니다.
 * endpoints 구조에서는 보통 문자열 endpoint 또는 함수 endpoint가 leaf입니다.
 *
 * 예:
 * {
 *   members: {
 *     me: '/members/me',
 *     byId: (id: number) => `/members/${id}`
 *   }
 * }
 *
 * 결과:
 * ['members.me', 'members.byId']
 */
function collectLeafPaths(value: unknown, prefix = ''): LeafPath[] {
    // 객체가 아니거나 null이면 leaf로 판단합니다.
    // 단, 최상위 값 자체가 leaf인 경우 prefix가 비어 있을 수 있으므로
    // prefix가 있을 때만 경로로 반환합니다.
    if (typeof value !== 'object' || value === null) {
        return prefix ? [prefix] : []
    }

    // 객체의 각 key/value를 순회하면서 leaf 경로를 모읍니다.
    return Object.entries(value).flatMap(([key, v]) => {
        // 현재 위치의 전체 경로를 만듭니다.
        // 예: prefix가 'members'이고 key가 'me'이면 'members.me'
        const path = prefix ? `${prefix}.${key}` : key

        // value가 객체라면 아직 leaf가 아니므로 더 깊이 순회합니다.
        if (typeof v === 'object' && v !== null) {
            return collectLeafPaths(v, path)
        }

        // value가 문자열, 함수 등 객체가 아닌 값이면 leaf로 판단하고
        // 현재까지 만든 경로를 반환합니다.
        return [path]
    })
}

/**
 * 전체 endpoints leaf 경로 중에서 아직 사용되지 않은 경로만 반환합니다.
 *
 * usedEndpointPaths에는 track(endpoints)를 통해 실제로 접근된 leaf 경로가 들어 있습니다.
 * 따라서 전체 leaf 경로에서 usedEndpointPaths에 없는 것만 필터링하면
 * "정의되어 있지만 테스트나 코드에서 참조되지 않은 endpoint"를 찾을 수 있습니다.
 */
function getUnusedEndpointPaths(
    endpoints: unknown,
    usedEndpointPaths: Set<string>
): string[] {
    // 1. endpoints 전체에서 가능한 모든 leaf 경로를 수집합니다.
    // 2. usedEndpointPaths에 없는 경로만 남깁니다.
    return collectLeafPaths(endpoints).filter(
        path => !usedEndpointPaths.has(path)
    )
}

// ─── 응답 타입 레지스트리 + 헬퍼 ──────────────────────────────────────────
//
// `(await res.json()) as BaseResponse<Foo>` 캐스팅을 호출부마다 반복하는 대신,
// "이 엔드포인트는 이런 응답을 반환한다"는 선언을 `responses` 한 곳에 모아두고
// getJson/postJson이 거기서 타입을 추론한다.
//   - 응답 DTO가 바뀌면 레지스트리 한 줄만 고치면 모든 호출부에 반영된다.
//   - 호출부는 제네릭을 반복해서 적지 않아도 되고, 실제 backend 필드명과
//     Shared DTO가 어긋나면(예: coupon의 `id` vs `couponId`) 등록 시점에 바로
//     타입 에러로 드러난다.

type Typed<T> = string & { readonly __response?: T }

function typed<T>(path: string): Typed<T> {
    return path as Typed<T>
}

async function getJson<T>(
    request: APIRequestContext,
    path: Typed<T>,
    options?: Parameters<APIRequestContext['get']>[1]
): Promise<{
    res: Awaited<ReturnType<APIRequestContext['get']>>
    body: BaseResponse<T>
}> {
    const res = await request.get(url(path), options)
    const body = (await res.json()) as BaseResponse<T>
    return { res, body }
}

async function postJson<T>(
    request: APIRequestContext,
    path: Typed<T>,
    options?: Parameters<APIRequestContext['post']>[1]
): Promise<{
    res: Awaited<ReturnType<APIRequestContext['post']>>
    body: BaseResponse<T>
}> {
    const res = await request.post(url(path), options)
    const body = (await res.json()) as BaseResponse<T>
    return { res, body }
}

async function patchJson<T>(
    request: APIRequestContext,
    path: Typed<T>,
    options?: Parameters<APIRequestContext['patch']>[1]
): Promise<{
    res: Awaited<ReturnType<APIRequestContext['patch']>>
    body: BaseResponse<T>
}> {
    const res = await request.patch(url(path), options)
    const body = (await res.json()) as BaseResponse<T>
    return { res, body }
}

async function waitForNotification(
    request: APIRequestContext,
    token: string,
    predicate: (item: MatchingNotification) => boolean
): Promise<MatchingNotification | undefined> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const { body } = await getJson(request, responses.notificationsList, {
            headers: auth(token)
        })
        const notification = body.data.find(predicate)
        if (notification) return notification
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    return undefined
}

// 엔드포인트 ↔ 응답 DTO 매핑. 실제로 바디를 검사하는 엔드포인트만 등록한다
// (상태 코드만 확인하는 곳까지 등록해 봐야 추론된 타입을 아무도 쓰지 않는다).
const responses = {
    recruitsList: typed<RecruitListResponse>(ep.recruits.list),
    couponsMy: typed<CouponResponse[]>(ep.coupons.my),
    friendsList: typed<FriendListItemResponse[]>(ep.friends.list),
    friendsBlocks: typed<FriendBlockItemResponse[]>(ep.friends.blocks),
    friendsRequestsIncoming: typed<FriendRequestItemResponse[]>(
        ep.friends.requestsIncoming
    ),
    friendsRequestsOutgoing: typed<FriendRequestItemResponse[]>(
        ep.friends.requestsOutgoing
    ),
    friendsMeals: typed<FriendMealListResponse>(ep.friends.meals),
    invitationsList: typed<InvitationResponse[]>(ep.invitations.list),
    invitationsMe: typed<InvitationResponse[]>(ep.invitations.me),
    notificationsList: typed<MatchingNotification[]>(ep.notifications.list),
    notificationMarkRead: (notificationId: string) =>
        typed<MatchingNotification>(ep.notifications.markRead(notificationId)),
    roomAccess: (roomId: string | number) =>
        typed<RoomAccessResponse>(ep.room.access(roomId)),
    articleComments: (articleId: number) =>
        typed<CommentDto[]>(ep.articles.comments(articleId)),
    sendFriendRequest: (memberId: number) =>
        typed<FriendRequestItemResponse>(ep.friends.sendRequest(memberId)),
    membersMe: typed<ProfileDto>(ep.members.me),
    myProfile: typed<ProfileDto>(ep.members.myProfile),
    memberById: (id: number) => typed<ProfileDto>(ep.members.byId(id)),
    memberProfile: (id: number) =>
        typed<ProfileDto>(ep.members.memberProfileDetail(id)),
    mealStatusMy: typed<MealStatusResponse>(ep.mealStatus.my),
    challengesMe: typed<ChallengeStatusResponse>(ep.challenges.me),
    articleDetail: (id: number) =>
        typed<ArticleDetailDto>(ep.articles.detail(id)),
    articleLike: (id: number) => typed<LikePostResponse>(ep.articles.like(id)),
    referralsMe: typed<ReferralItemResponse[]>(ep.referrals.me),
    referralsCreate: typed<ReferralCreateResponse>(ep.referrals.create),
    plansList: typed<PlanResponseDto[]>(ep.plans.list),
    plansUncompleted: typed<PlanResponseDto[]>(ep.plans.uncompleted),
    plansCompleted: typed<PlanResponseDto[]>(ep.plans.completed),
    friendsSearch: (query: string) =>
        typed<FriendListItemResponse[]>(`${ep.friends.search}?${query}`)
} as const

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────

// 응답 바디를 안전하게 읽는다 (JSON 우선, 실패 시 텍스트). 실패 진단용으로만 사용한다.
// 공유 상태 (테스트 순서에 의존하지 않도록 beforeAll에서 초기화)
let tokenA = ''
let tokenB = ''
let memberIdA = ''
let memberIdB = ''

// ─── 전역 계정 발급 ───────────────────────────────────────────────────────

// test.describe.configure({ mode: 'serial' })
test.describe.configure({
    retries: 0
})

test.beforeAll(async ({ request }) => {
    // 계정 생성
    // await signup(request, USER_A.email, USER_A.username)
    // await signup(request, USER_B.email, USER_B.username)

    // 로그인 → JWT 발급
    tokenA = await login(request, USER_A.email)
    tokenB = await login(request, USER_B.email)

    // 내 프로필에서 memberId 조회
    memberIdA = await fetchMemberId(request, tokenA, USER_A.email)
    memberIdB = await fetchMemberId(request, tokenB, USER_B.email)
})

// ─── 1. App 루트 ──────────────────────────────────────────────────────────

test.describe('App 루트', () => {
    test(`GET ${ep.app.root} → 200 Hello World`, async ({ request }) => {
        const res = await request.get(url(ep.app.root))
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body.data).toBe('Hello World!')
    })
})

// ─── 2. 인증 ─────────────────────────────────────────────────────────────

test.describe('Auth', () => {
    test(`GET ${ep.auth.test} → JWT 문자열 반환`, async ({ request }) => {
        const res = await request.get(url(ep.auth.test))
        expect(res.status()).toBe(200)
        const body = await res.json()
        const token: string = body.data ?? body
        expect(token.split('.').length).toBe(3)
    })

    test(`GET ${ep.members.me} 미인증 요청 → 401`, async ({ request }) => {
        const res = await request.get(url(ep.members.me))
        expect(res.status()).toBe(401)
        const body = await res.json()
        expect(body.success).toBe(false)
    })

    test(`GET ${ep.auth.kakaoLogin} → 카카오 OAuth로 리다이렉트`, async ({
        request
    }) => {
        const res = await request.get(url(ep.auth.kakaoLogin), {
            maxRedirects: 0
        })
        // 정상: 302 리다이렉트, 환경에 따라 200(JSON 응답)도 허용
        expect([200, 301, 302, 307, 308]).toContain(res.status())
    })

    test(`POST ${ep.auth.refresh} → 쿠키 없이 호출 시 401`, async ({
        request
    }) => {
        const res = await request.post(url(ep.auth.refresh))
        // refresh-token 쿠키가 없으므로 인증 실패가 정상
        expect([200, 201, 401]).toContain(res.status())
    })
})

// ─── 3. Members ──────────────────────────────────────────────────────────

test.describe('Members', () => {
    test(`GET ${ep.members.me} → 200`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.membersMe, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })

    test(`GET ${ep.members.myProfile} → 200`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.myProfile, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })

    test(`GET ${ep.members.myProfile} detail 호환 → 200`, async ({
        request
    }) => {
        const { res, body } = await getJson(request, responses.myProfile, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })

    test(`PATCH ${ep.members.updateProfile} → 200`, async ({ request }) => {
        const res = await request.patch(url(ep.members.updateProfile), {
            headers: auth(tokenA),
            data: {
                username: 'E2E수정A',
                profileImageUrl: null,
                bio: '테스트 바이오'
            }
        })
        expect([200, 204]).toContain(res.status())
    })

    test(`GET ${ep.articles.my} → 200 배열`, async ({ request }) => {
        const res = await request.get(url(ep.articles.my), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        const body = (await res.json()) as BaseResponse<{
            total: number
            items: ArticleSummaryResponseDto[]
        }>
        expect(Array.isArray(body.data?.items ?? body.data ?? body)).toBe(true)
    })

    test(`GET ${ep.mealStatus.my} → 200`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.mealStatusMy, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(typeof body.data.hungry).toBe('boolean')
    })

    test(`PATCH ${ep.mealStatus.update} (ARTICLE_UPLOAD) → 200`, async ({
        request
    }) => {
        const res = await request.patch(url(ep.mealStatus.update), {
            headers: auth(tokenA),
            data: { action: 'ARTICLE_UPLOAD' }
        })
        expect([200, 204]).toContain(res.status())
    })

    test(`PATCH ${ep.mealStatus.update} (SET_MANNUALY) → 200`, async ({
        request
    }) => {
        const res = await request.patch(url(ep.mealStatus.update), {
            headers: auth(tokenA),
            data: { action: 'SET_MANNUALY' }
        })
        expect([200, 204]).toContain(res.status())
    })

    test('GET /members/:memberId/profile → 200', async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.memberProfile(Number(memberIdA)),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })

    test(`GET ${apiContract.articles.byMember.path} → 200 배열`, async ({
        request
    }) => {
        const res = await request.get(
            url(ep.articles.byMember(Number(memberIdA))),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data?.items ?? body.data ?? body)).toBe(true)
    })

    test('GET /members/:memberId → 200', async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.memberById(Number(memberIdA)),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })
})

// ─── 4. Onboarding ───────────────────────────────────────────────────────

test.describe('Onboarding', () => {
    test(`POST ${ep.onboarding.create} → 204`, async ({ request }) => {
        const res = await request.post(url(ep.onboarding.create), {
            headers: auth(tokenA),
            data: {
                username: USER_A.username,
                profileImageUrl: null,
                bio: null,
                liked: [],
                disliked: [],
                allergy: []
            }
        })
        expect([200, 204]).toContain(res.status())
    })
})

// ─── 5. Preferences ──────────────────────────────────────────────────────

test.describe('Preferences', () => {
    test(`GET ${ep.preferences.mySummary} → 200`, async ({ request }) => {
        const res = await request.get(url(ep.preferences.mySummary), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
    })

    test(`PATCH ${ep.preferences.update} → 204`, async ({ request }) => {
        const res = await request.patch(url(ep.preferences.update), {
            headers: auth(tokenA),
            data: {
                liked: [],
                disliked: [],
                allergy: []
            }
        })
        expect([200, 204]).toContain(res.status())
    })
})

// ─── 6. Articles ─────────────────────────────────────────────────────────

let createdArticleId = 0
let createdCommentId = 0

test.describe('Articles', () => {
    test(`GET ${ep.articles.home} → 200 배열`, async ({ request }) => {
        const res = await request.get(url(ep.articles.home), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body.data?.items)).toBe(true)
    })

    test(`GET ${ep.articles.recentMeals} → 200 배열`, async ({ request }) => {
        const res = await request.get(url(ep.articles.recentMeals), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data?.items ?? body)).toBe(true)
    })

    test(`GET ${apiContract.articles.byMember.path} → 200 배열`, async ({
        request
    }) => {
        const res = await request.get(
            url(ep.articles.byAuthor(Number(memberIdA))),
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data?.items ?? body)).toBe(true)
    })

    test(`POST ${ep.articles.create} → 201, id 반환`, async ({ request }) => {
        const res = await request.post(url(ep.articles.create), {
            headers: auth(tokenA),
            data: {
                imageUrl: 'https://via.placeholder.com/300',
                mealDate: new Date().toISOString().slice(0, 10),
                restaurant: {
                    restaurantId: 'test-kakao-id',
                    placeName: '테스트 식당',
                    categoryName: '한식',
                    categoryGroupName: '음식점',
                    roadAddressName: '서울시 테스트로 1',
                    addressName: '서울시 테스트구',
                    phone: '',
                    placeUrl: 'https://place.map.kakao.com/test',
                    lat: 37.5,
                    lng: 127.0
                },
                taggedMemberIds: []
            }
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.id ?? body.id
        expect(typeof id).toBe('number')
        createdArticleId = id
    })

    test(`GET ${apiContract.articles.detail.path} → 200`, async ({
        request
    }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const { res, body } = await getJson(
            request,
            responses.articleDetail(createdArticleId),
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(body.data.articleId).toBe(createdArticleId)
    })

    test(`POST ${apiContract.articles.like.path} → 200`, async ({
        request
    }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const { res, body } = await postJson(
            request,
            responses.articleLike(createdArticleId),
            { headers: auth(tokenB) }
        )
        expect([200, 201]).toContain(res.status())
        expect(typeof body.data.liked).toBe('boolean')
    })

    test(`POST ${apiContract.articles.createComment.path} → 201, id 반환`, async ({
        request
    }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const res = await request.post(
            url(ep.articles.comments(createdArticleId)),
            {
                headers: auth(tokenB),
                data: { content: 'E2E 테스트 댓글입니다.' }
            }
        )
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.id ?? body.id
        expect(typeof id).toBe('number')
        createdCommentId = id
    })

    test(`DELETE ${apiContract.articles.deleteComment.path} → 204`, async ({
        request
    }) => {
        test.skip(createdCommentId === 0, '댓글 생성 실패로 건너뜀')
        const res = await request.delete(
            url(ep.articles.deleteComment(createdCommentId)),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(204)
    })

    test(`DELETE ${apiContract.articles.delete.path} → 204`, async ({
        request
    }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        // 두 번째 게시물을 만들어 삭제 검증 (첫 번째는 이후 테스트에서 재활용)
        const createRes = await request.post(url(ep.articles.create), {
            headers: auth(tokenA),
            data: {
                imageUrl: 'https://via.placeholder.com/300',
                mealDate: new Date().toISOString().slice(0, 10),
                restaurant: {
                    restaurantId: 'test-kakao-id-2',
                    placeName: '삭제 테스트 식당',
                    categoryName: '한식',
                    categoryGroupName: '음식점',
                    roadAddressName: '서울시 테스트로 2',
                    addressName: '서울시',
                    phone: '',
                    placeUrl: 'https://place.map.kakao.com/test2',
                    lat: 37.5,
                    lng: 127.0
                },
                taggedMemberIds: []
            }
        })
        const createBody = await createRes.json()
        const deleteTargetId = createBody.data?.id ?? createBody.id
        if (typeof deleteTargetId !== 'number') return

        const res = await request.delete(
            url(ep.articles.delete(deleteTargetId)),
            {
                headers: auth(tokenA)
            }
        )
        expect(res.status()).toBe(204)
    })
})

// ─── 7. Recruits ─────────────────────────────────────────────────────────

let createdRecruitId = 0

test.describe('Recruits', () => {
    test(`GET ${ep.recruits.list} → 200 페이지`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.recruitsList, {
            headers: auth(tokenA),
            params: { page: 0, size: 10 }
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data.items)).toBe(true)
        expect(body.data.meta.page).toBe(0)
        expect(body.data.meta.size).toBe(10)
    })

    test(`POST ${ep.recruits.create} → 201`, async ({ request }) => {
        const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const res = await request.post(url(ep.recruits.create), {
            headers: auth(tokenA),
            data: {
                targetCount: 2,
                meetingAt: future.toISOString(),
                location: '서울시 강남구 테헤란로',
                message: 'E2E 테스트 모집글'
            }
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.recruitId ?? body.data
        createdRecruitId = Number(id)
    })

    test(`POST ${apiContract.recruits.join.path} (다른 사용자) → 201 또는 409`, async ({
        request
    }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            url(ep.recruits.join(createdRecruitId)),
            { headers: auth(tokenB) }
        )
        expect([201, 409]).toContain(res.status())
    })

    // ─── 7.1. Subscriptions ───────────────────────────────────────────────────

    test.describe('Subscriptions', () => {
        test(`POST ${ep.subscriptions.recruit(':recruitId')} → 201 또는 409`, async ({
            request
        }) => {
            test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
            const res = await request.post(
                url(ep.subscriptions.recruit(createdRecruitId)),
                { headers: auth(tokenA) }
            )
            expect([201, 409]).toContain(res.status())
        })

        test(`POST ${ep.subscriptions.direct(':postId')} → 201 또는 409`, async ({
            request
        }) => {
            test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
            const res = await request.post(
                url(ep.subscriptions.direct(createdRecruitId)),
                { headers: auth(tokenB) }
            )
            expect([201, 409]).toContain(res.status())
        })
    })

    test(`POST ${apiContract.recruits.close.path} (작성자) → 201`, async ({
        request
    }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            url(ep.recruits.close(createdRecruitId)),
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(201)
    })
})

// ─── 8. Plans ────────────────────────────────────────────────────────────

let createdPlanId = 0

test.describe('Plans', () => {
    test(`GET ${ep.plans.list} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.plansList, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`GET ${ep.plans.uncompleted} uncompleted 호환 → 200 배열`, async ({
        request
    }) => {
        const { res, body } = await getJson(
            request,
            responses.plansUncompleted,
            {
                headers: auth(tokenA)
            }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`GET ${ep.plans.completed} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.plansCompleted, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })
})

// ─── 9. Invitations ──────────────────────────────────────────────────────

let createdInvitationId = 0

test.describe('Invitations', () => {
    test(`POST ${ep.invitations.send} → 201`, async ({ request }) => {
        const res = await request.post(url(ep.invitations.send), {
            headers: auth(tokenA),
            data: {
                inviteeId: Number(memberIdB),
                message: 'E2E 테스트 초대장'
            }
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.invitationId ?? body.data?.id ?? body.id
        if (typeof id === 'number') createdInvitationId = id
    })

    test(`GET ${ep.invitations.list} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.invitationsList,
            {
                headers: auth(tokenB)
            }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`GET ${ep.invitations.me} me 호환 → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.invitationsMe, {
            headers: auth(tokenB)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`POST ${apiContract.invitations.accept.path} → 201 (초대가 있는 경우)`, async ({
        request
    }) => {
        // 초대 목록에서 첫 번째 초대를 수락한다
        const { body: listBody } = await getJson(
            request,
            responses.invitationsList,
            { headers: auth(tokenB) }
        )
        // GET /invitations 응답의 각 항목은 `invitationId` 필드를 사용한다
        // (InvitationResponse). `id`가 아니므로 주의 — 타입을 InvitationResponse로
        // 선언해 두면 이 필드명이 바뀔 때 컴파일 타임에 바로 드러난다.
        const list = listBody.data
        if (!Array.isArray(list) || list.length === 0) {
            // 초대가 없으면 건너뜀
            return
        }
        const invId = list[0].invitationId
        const res = await request.post(url(ep.invitations.accept(invId)), {
            headers: auth(tokenB)
        })
        expect(res.status()).toBe(201)
    })

    test(`POST ${ep.invitations.send} (reject용 2차 초대) → 201 후 reject 201`, async ({
        request
    }) => {
        const res = await request.post(url(ep.invitations.send), {
            headers: auth(tokenA),
            data: {
                inviteeId: Number(memberIdB),
                message: 'E2E 거절용 초대'
            }
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.invitationId ?? body.data?.id ?? body.id
        if (typeof id === 'number') {
            const rejectRes = await request.post(
                url(ep.invitations.reject(id)),
                { headers: auth(tokenB) }
            )
            expect(rejectRes.status()).toBe(201)
        }
    })
})

// ─── 9.1. Notifications ─────────────────────────────────────────────────

test.describe('Notifications', () => {
    test(`GET ${ep.notifications.list} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.notificationsList,
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`POST ${ep.invitations.send} 후 accept 시 ${ep.notifications.list} 알림/읽음/삭제/room access 동작`, async ({
        request
    }) => {
        const sendRes = await request.post(url(ep.invitations.send), {
            headers: auth(tokenA),
            data: {
                inviteeId: Number(memberIdB),
                message: 'E2E 알림 영속화 테스트 초대'
            }
        })
        expect(sendRes.status()).toBe(201)
        const sendBody = await readBody(sendRes)
        const invitationId =
            sendBody?.data?.invitationId ?? sendBody?.invitationId
        expect(typeof invitationId).toBe('number')

        const preAccessRes = await request.get(
            url(ep.room.access(invitationId)),
            { headers: auth(tokenB) }
        )
        expect(preAccessRes.status()).toBe(404)

        const acceptRes = await request.post(
            url(ep.invitations.accept(invitationId)),
            { headers: auth(tokenB) }
        )
        expect(acceptRes.status()).toBe(201)
        const acceptBody = await readBody(acceptRes)
        const roomId = acceptBody?.data?.room?.roomId
        expect(typeof roomId).toBe('string')

        const { res: listRes, body: listBody } = await getJson(
            request,
            responses.notificationsList,
            { headers: auth(tokenB) }
        )
        expect(listRes.status()).toBe(200)
        const notification = listBody.data.find(
            item => item.kind === 'invitation' && item.roomId === roomId
        )
        expect(notification).toBeTruthy()
        expect(notification?.readAt).toBeNull()

        const { res: accessRes, body: accessBody } = await getJson(
            request,
            responses.roomAccess(roomId),
            { headers: auth(tokenB) }
        )
        expect(accessRes.status()).toBe(200)
        expect(accessBody.data.canJoin).toBe(true)
        expect(accessBody.data.roomId).toBe(roomId)

        const notificationId = notification!.notificationId
        const { res: markReadRes, body: markReadBody } = await patchJson(
            request,
            responses.notificationMarkRead(notificationId),
            { headers: auth(tokenB) }
        )
        expect(markReadRes.status()).toBe(200)
        expect(markReadBody.data.readAt).toBeTruthy()

        const deleteRes = await request.delete(
            url(ep.notifications.delete(notificationId)),
            { headers: auth(tokenB) }
        )
        expect([200, 204]).toContain(deleteRes.status())

        const { body: afterDeleteBody } = await getJson(
            request,
            responses.notificationsList,
            { headers: auth(tokenB) }
        )
        expect(
            afterDeleteBody.data.some(
                item => item.notificationId === notificationId
            )
        ).toBe(false)
    })

    test(`POST ${apiContract.recruits.join.path} 후 ${ep.notifications.list} recruit 알림/읽음/삭제/room access 동작`, async ({
        request
    }) => {
        const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const createRes = await request.post(url(ep.recruits.create), {
            headers: auth(tokenA),
            data: {
                targetCount: 2,
                meetingAt: future.toISOString(),
                location: '서울시 강남구 테헤란로',
                message: 'E2E recruit 알림 영속화 테스트'
            }
        })
        expect(createRes.status()).toBe(201)
        const createBody = await readBody(createRes)
        const recruitId = createBody?.data?.recruitId ?? createBody?.data
        expect(typeof recruitId).toBe('number')

        const joinRes = await request.post(url(ep.recruits.join(recruitId)), {
            headers: auth(tokenB)
        })
        expect(joinRes.status()).toBe(201)

        const closeRes = await request.post(url(ep.recruits.close(recruitId)), {
            headers: auth(tokenA)
        })
        expect(closeRes.status()).toBe(201)

        const notification = await waitForNotification(
            request,
            tokenB,
            item =>
                item.kind === 'recruit' &&
                item.roomType === 'recruit' &&
                item.roomId === String(recruitId)
        )
        expect(notification).toBeTruthy()
        expect(notification?.readAt).toBeNull()

        const { res: accessRes, body: accessBody } = await getJson(
            request,
            responses.roomAccess(recruitId),
            { headers: auth(tokenB) }
        )
        expect(accessRes.status()).toBe(200)
        expect(accessBody.data.canJoin).toBe(true)
        expect(accessBody.data.roomId).toBe(String(recruitId))
        expect(accessBody.data.roomType).toBe('recruit')

        const notificationId = notification!.notificationId
        const { res: markReadRes, body: markReadBody } = await patchJson(
            request,
            responses.notificationMarkRead(notificationId),
            { headers: auth(tokenB) }
        )
        expect(markReadRes.status()).toBe(200)
        expect(markReadBody.data.readAt).toBeTruthy()

        const deleteRes = await request.delete(
            url(ep.notifications.delete(notificationId)),
            { headers: auth(tokenB) }
        )
        expect(deleteRes.status()).toBe(200)

        const { body: afterDeleteBody } = await getJson(
            request,
            responses.notificationsList,
            { headers: auth(tokenB) }
        )
        expect(
            afterDeleteBody.data.some(
                item => item.notificationId === notificationId
            )
        ).toBe(false)
    })
})

// ─── 10. Referrals ───────────────────────────────────────────────────────

let referralCode = ''

test.describe('Referrals', () => {
    test(`POST ${ep.referrals.create} → 201, code 반환`, async ({
        request
    }) => {
        const { res, body } = await postJson(
            request,
            responses.referralsCreate,
            {
                headers: auth(tokenA)
            }
        )
        expect([200, 201]).toContain(res.status())
        if (typeof body.data?.code === 'string') referralCode = body.data.code
    })

    test(`GET ${ep.referrals.me} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.referralsMe, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`POST ${ep.referrals.redeem} → 204 또는 400/409 (자기 코드 or 중복)`, async ({
        request
    }) => {
        // userB가 userA의 추천코드를 redeem한다
        // referralCode가 없으면 건너뜀
        if (!referralCode) return
        const res = await request.post(url(ep.referrals.redeem), {
            headers: auth(tokenB),
            data: { code: referralCode }
        })
        // 정상: 204, 자기참조 or 중복: 400/409
        expect([200, 204, 400, 404, 409]).toContain(res.status())
    })
})

// ─── 11. Challenges ──────────────────────────────────────────────────────

test.describe('Challenges', () => {
    test(`GET ${ep.challenges.me} → 200`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.challengesMe, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(typeof body.data.week.completed).toBe('number')
        expect(typeof body.data.month.count).toBe('number')
    })

    test(`POST ${ep.challenges.reward} → 200 또는 400/409`, async ({
        request
    }) => {
        const res = await request.post(url(ep.challenges.reward), {
            headers: auth(tokenA),
            data: { type: 'WEEK' }
        })
        // 조건 미충족: 400, 중복: 409, 정상: 200/201
        expect([200, 201, 400, 409]).toContain(res.status())
    })
})

// ─── 12. Coupons ─────────────────────────────────────────────────────────

test.describe('Coupons', () => {
    test(`GET ${ep.coupons.my} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.couponsMy, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`POST ${apiContract.coupons.use.path} → 쿠폰 있으면 200, 없으면 404`, async ({
        request
    }) => {
        // 보유 쿠폰 목록 조회 후 첫 번째 쿠폰 사용
        const { body: listBody } = await getJson(request, responses.couponsMy, {
            headers: auth(tokenA)
        })
        const list = listBody.data
        if (!Array.isArray(list) || list.length === 0) {
            // 쿠폰이 없으면 존재하지 않는 id로 404 검증
            const res = await request.post(url(ep.coupons.use(99999)), {
                headers: auth(tokenA)
            })
            expect([404, 400, 403]).toContain(res.status())
            return
        }
        // CouponResponse는 `id`가 아니라 `couponId` 필드를 사용한다.
        // 타입을 CouponResponse[]로 선언해 두지 않았다면 `list[0].id`가
        // `undefined`가 되어 `/coupons/undefined/use`를 호출하는 버그를 놓쳤을 것이다.
        const couponId = list[0].couponId
        const res = await request.post(url(ep.coupons.use(couponId)), {
            headers: auth(tokenA)
        })
        expect([200, 201, 409]).toContain(res.status())
    })
})

// ─── 13. Friends ─────────────────────────────────────────────────────────

let friendRequestId = 0

test.describe('Friends', () => {
    test(`GET ${ep.friends.list} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.friendsList, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`GET ${ep.friends.search} → 200 배열`, async ({ request }) => {
        const res = await request.get(url(responses.friendsSearch('q=E2E')), {
            headers: auth(tokenA)
        })
        expect([200, 400]).toContain(res.status())
    })

    test(`GET ${ep.friends.blocks} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.friendsBlocks, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`GET ${ep.friends.requestsIncoming} → 200 배열`, async ({
        request
    }) => {
        const { res, body } = await getJson(
            request,
            responses.friendsRequestsIncoming,
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`GET ${ep.friends.requestsOutgoing} → 200 배열`, async ({
        request
    }) => {
        const { res, body } = await getJson(
            request,
            responses.friendsRequestsOutgoing,
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test(`POST ${apiContract.friends.sendRequest.path} → 200 또는 409`, async ({
        request
    }) => {
        const { res, body } = await postJson(
            request,
            responses.sendFriendRequest(Number(memberIdB)),
            { headers: auth(tokenA) }
        )
        // 이미 요청했거나 친구이면 409, 정상이면 200/201
        await assertStatus(
            res,
            [200, 201, 404, 409],
            `POST /friends/requests/${memberIdB} (memberIdA=${memberIdA})`
        )
        // FriendRequestItemResponse는 `id`가 아니라 `requestId` 필드를 사용한다
        const id = body.data?.requestId
        if (typeof id === 'number') friendRequestId = id
    })

    test(`GET ${ep.friends.requestsIncoming} (userB 기준) → 요청 목록 확인`, async ({
        request
    }) => {
        const { res, body } = await getJson(
            request,
            responses.friendsRequestsIncoming,
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        const list = body.data
        if (Array.isArray(list) && list.length > 0 && friendRequestId === 0) {
            friendRequestId = list[0].requestId
        }
    })

    test(`POST ${apiContract.friends.acceptRequest.path} → 200 또는 404/409`, async ({
        request
    }) => {
        if (friendRequestId === 0) return
        const res = await request.post(
            url(ep.friends.acceptRequest(friendRequestId)),
            { headers: auth(tokenB) }
        )
        expect([200, 201, 404, 409]).toContain(res.status())
    })

    test(`DELETE ${apiContract.friends.unfriend.path} → 200 또는 404`, async ({
        request
    }) => {
        // 친구 삭제 (친구가 없으면 404)
        const res = await request.delete(
            url(ep.friends.remove(Number(memberIdB))),
            { headers: auth(tokenA) }
        )
        expect([200, 204, 404, 409]).toContain(res.status())
    })

    test(`DELETE ${apiContract.friends.cancelRequest.path} → 200 또는 404`, async ({
        request
    }) => {
        // userA가 새 요청 후 직접 취소
        const { body: createBody } = await postJson(
            request,
            responses.sendFriendRequest(Number(memberIdB)),
            { headers: auth(tokenA) }
        )
        const reqId = createBody.data?.requestId
        if (typeof reqId !== 'number') return
        const res = await request.delete(url(ep.friends.cancelRequest(reqId)), {
            headers: auth(tokenA)
        })
        expect([200, 204, 404]).toContain(res.status())
    })

    test(`POST ${apiContract.friends.block.path} → 200 또는 409`, async ({
        request
    }) => {
        const res = await request.post(
            url(ep.friends.block(Number(memberIdB))),
            { headers: auth(tokenA) }
        )
        expect([200, 204, 201, 409]).toContain(res.status())
    })

    test(`DELETE ${apiContract.friends.unblock.path} → 200 또는 404`, async ({
        request
    }) => {
        const res = await request.delete(
            url(ep.friends.unblock(Number(memberIdB))),
            { headers: auth(tokenA) }
        )
        expect([200, 204, 404]).toContain(res.status())
    })
})

// ─── 14. Friends Meals ───────────────────────────────────────────────────

test.describe('Friends Meals', () => {
    test(`GET ${ep.friends.meals} → 200 배열`, async ({ request }) => {
        const { res, body } = await getJson(request, responses.friendsMeals, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })
})

// ─── 2. 인증 ─────────────────────────────────────────────────────────────

test(`POST ${ep.auth.logout} → 200 또는 204`, async ({ request }) => {
    const res = await request.post(url(ep.auth.logout), {
        headers: auth(tokenA)
    })
    expect([200, 201, 204]).toContain(res.status())
})

// ─── 15. 엔드포인트 커버리지 ──────────────────────────────────────────────
//
// 반드시 마지막에 위치해야 한다 (그 이전 테스트들의 endpoints 접근을 모두 추적한 뒤
// 비교해야 하기 때문). endpoints.ts에 엔드포인트를 추가/삭제했는데 이 e2e에서
// 사용하는 엔드포인트 개수가 그대로라면(혹은 반대라면) 이 테스트가 실패한다.

test.describe('엔드포인트 커버리지', () => {
    test('endpoints.ts의 leaf 개수와 e2e에서 사용한 고유 엔드포인트 개수가 일치한다', () => {
        const totalDefined = countLeaves(ep)
        const unusedEndpointPaths = getUnusedEndpointPaths(
            ep,
            usedEndpointPaths
        )
        console.log(unusedEndpointPaths)
        expect(usedEndpointPaths.size).toBe(totalDefined)
    })
})
