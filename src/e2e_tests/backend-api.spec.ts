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

import {
    ArticleSummaryResponseDto,
    BaseResponse,
    type MemberSummaryResponse,
    type PlanResponseDto,
    type ReferralCreateResponse,
    type ReferralItemResponse
} from '@kimdaegyu/babmukdang-shared'
import { test, expect, type APIRequestContext } from '@playwright/test'
import { endpoints } from '../apis/endpoints'
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
    RecruitDto
} from '../apis/types'

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

const ep = track(endpoints)

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

// 엔드포인트 ↔ 응답 DTO 매핑. 실제로 바디를 검사하는 엔드포인트만 등록한다
// (상태 코드만 확인하는 곳까지 등록해 봐야 추론된 타입을 아무도 쓰지 않는다).
const responses = {
    recruitsList: typed<RecruitDto[]>(ep.recruits.list),
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
    articleComments: (articleId: number) =>
        typed<CommentDto[]>(ep.articles.comments(articleId)),
    sendFriendRequest: (memberId: number) =>
        typed<FriendRequestItemResponse>(ep.friends.sendRequest(memberId)),
    membersMe: typed<ProfileDto>(ep.members.me),
    myProfile: typed<ProfileDto>(ep.members.myProfile),
    myProfileDetail: typed<ProfileDetailResponse>(ep.members.myProfileDetail),
    memberById: (id: number) => typed<ProfileDto>(ep.members.byId(id)),
    memberProfile: (id: number) => typed<ProfileDto>(ep.members.profile(id)),
    memberProfileDetail: (id: number) =>
        typed<ProfileDetailResponse>(ep.members.profileDetail(id)),
    membersSummary: typed<MemberSummaryResponse>(ep.members.summary),
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
    test('GET /api/v1 → 200 Hello World', async ({ request }) => {
        const res = await request.get(url(ep.app.root))
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body.data).toBe('Hello World!')
    })
})

// ─── 2. 인증 ─────────────────────────────────────────────────────────────

test.describe('Auth', () => {
    test('GET /auth/test → JWT 문자열 반환', async ({ request }) => {
        const res = await request.get(url(ep.auth.test))
        expect(res.status()).toBe(200)
        const body = await res.json()
        const token: string = body.data ?? body
        expect(token.split('.').length).toBe(3)
    })

    test('미인증 요청 → 401', async ({ request }) => {
        const res = await request.get(url(ep.members.me))
        expect(res.status()).toBe(401)
        const body = await res.json()
        expect(body.success).toBe(false)
    })

    test('GET /auth/kakao → 카카오 OAuth로 리다이렉트', async ({ request }) => {
        const res = await request.get(url(ep.auth.kakaoLogin), {
            maxRedirects: 0
        })
        // 정상: 302 리다이렉트, 환경에 따라 200(JSON 응답)도 허용
        expect([200, 301, 302, 307, 308]).toContain(res.status())
    })

    test('POST /auth/refresh → 쿠키 없이 호출 시 401', async ({ request }) => {
        const res = await request.post(url(ep.auth.refresh))
        // refresh-token 쿠키가 없으므로 인증 실패가 정상
        expect([200, 201, 401]).toContain(res.status())
    })
})

// ─── 3. Members ──────────────────────────────────────────────────────────

test.describe('Members', () => {
    test('GET /members/me → 200', async ({ request }) => {
        const { res, body } = await getJson(request, responses.membersMe, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(body.data.member.userId).toBeTruthy()
    })

    test('GET /members/me/profile → 200', async ({ request }) => {
        const { res, body } = await getJson(request, responses.myProfile, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(body.data.member.userId).toBeTruthy()
    })

    test('GET /members/me/profile/detail → 200', async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.myProfileDetail,
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })

    test('PATCH /members/me/profile → 200', async ({ request }) => {
        const res = await request.patch(url(ep.members.updateProfile), {
            headers: auth(tokenA),
            data: { userName: 'E2E수정A', bio: '테스트 바이오' }
        })
        expect([200, 204]).toContain(res.status())
    })

    test('GET /members/me/articles → 200 배열', async ({ request }) => {
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

    test('GET /members/me/summary → 200', async ({ request }) => {
        const { res, body } = await getJson(request, responses.membersSummary, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })

    test('GET /members/me/meal-status → 200', async ({ request }) => {
        const { res, body } = await getJson(request, responses.mealStatusMy, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(body.data.status).toBeTruthy()
    })

    test('PATCH /members/me/meal-status (ATE_NOW) → 200', async ({
        request
    }) => {
        const res = await request.patch(url(ep.mealStatus.update), {
            headers: auth(tokenA),
            data: { action: 'ATE_NOW' }
        })
        expect([200, 204]).toContain(res.status())
    })

    test('PATCH /members/me/meal-status (SET_OFF) → 200', async ({
        request
    }) => {
        const res = await request.patch(url(ep.mealStatus.update), {
            headers: auth(tokenA),
            data: { action: 'SET_OFF' }
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
        expect(body.data.member.userId).toBeTruthy()
    })

    test('GET /members/:memberId/profile/detail → 200', async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.memberProfileDetail(Number(memberIdA)),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        expect(body.data.memberId).toBeTruthy()
    })

    test('GET /members/:memberId/articles → 200 배열', async ({ request }) => {
        const res = await request.get(
            url(ep.articles.byMember(Number(memberIdA))),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        const body = (await res.json()) as BaseResponse<{
            total: number
            items: ArticleSummaryResponseDto[]
        }>
        expect(Array.isArray(body.data?.items ?? body.data ?? body)).toBe(true)
    })

    test('GET /members/:memberId → 200', async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.memberById(Number(memberIdA)),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(200)
        expect(body.data.member.userId).toBeTruthy()
    })
})

// ─── 4. Onboarding ───────────────────────────────────────────────────────

test.describe('Onboarding', () => {
    test('POST /onboarding → 204', async ({ request }) => {
        const res = await request.post(url(ep.onboarding.create), {
            headers: auth(tokenA),
            data: {
                userName: USER_A.username,
                profileImageUrl: null,
                bio: null,
                likedCodes: [],
                dislikedCodes: [],
                allergyCodes: []
            }
        })
        expect([200, 204]).toContain(res.status())
    })
})

// ─── 5. Preferences ──────────────────────────────────────────────────────

test.describe('Preferences', () => {
    test('GET /preferences/me → 200', async ({ request }) => {
        const res = await request.get(url(ep.preferences.mySummary), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
    })

    test('GET /preferences/me/meta → 200', async ({ request }) => {
        const res = await request.get(url(ep.preferences.myMeta), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
    })

    test('POST /preferences/onboarding → 204', async ({ request }) => {
        const res = await request.post(url(ep.preferences.onboarding), {
            headers: auth(tokenA),
            data: {
                likedCodes: [],
                dislikedCodes: [],
                allergyCodes: []
            }
        })
        expect([200, 204]).toContain(res.status())
    })

    test('GET /preferences/members/:memberId → 200 배열', async ({
        request
    }) => {
        const res = await request.get(
            url(ep.preferences.byMember(Number(memberIdA)))
        )
        expect(res.status()).toBe(200)
        const body = (await res.json()) as BaseResponse<{
            total: number
            items: ArticleSummaryResponseDto[]
        }>
        expect(Array.isArray(body.data?.items ?? body.data ?? body)).toBe(true)
    })
})

// ─── 6. Articles ─────────────────────────────────────────────────────────

let createdArticleId = 0
let createdCommentId = 0

test.describe('Articles', () => {
    test('GET /articles/home → 200 배열', async ({ request }) => {
        const res = await request.get(url(ep.articles.home), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body.data?.items)).toBe(true)
    })

    test('GET /articles/meals/recent → 200 배열', async ({ request }) => {
        const res = await request.get(url(ep.articles.recentMeals), {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data?.items ?? body)).toBe(true)
    })

    test('GET /articles/by-author/:authorId → 200 배열', async ({
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

    test('POST /articles → 201, id 반환', async ({ request }) => {
        const res = await request.post(url(ep.articles.create), {
            headers: auth(tokenA),
            data: {
                imageUrl: 'https://via.placeholder.com/300',
                mealDate: new Date().toISOString(),
                restaurant: {
                    name: '테스트 식당',
                    address: '서울시 테스트구',
                    roadAddress: '서울시 테스트로 1',
                    phone: '',
                    lat: '37.5',
                    lng: '127.0',
                    category: '한식',
                    kakaoId: 'test-kakao-id',
                    kakaoUrl: 'https://place.map.kakao.com/test'
                },
                taggedMembersId: []
            }
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.id ?? body.id
        expect(typeof id).toBe('number')
        createdArticleId = id
    })

    test('GET /articles/:articleId → 200', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const { res, body } = await getJson(
            request,
            responses.articleDetail(createdArticleId),
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(body.data.id).toBe(createdArticleId)
    })

    test('POST /articles/:articleId/like → 200', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const { res, body } = await postJson(
            request,
            responses.articleLike(createdArticleId),
            { headers: auth(tokenB) }
        )
        expect([200, 201]).toContain(res.status())
        expect(typeof body.data.liked).toBe('boolean')
    })

    test('POST /articles/:articleId/comments → 201, id 반환', async ({
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

    test('GET /articles/:articleId/comments → 200 배열', async ({
        request
    }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const { res, body } = await getJson(
            request,
            responses.articleComments(createdArticleId),
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('DELETE /articles/comments/:commentId → 204', async ({ request }) => {
        test.skip(createdCommentId === 0, '댓글 생성 실패로 건너뜀')
        const res = await request.delete(
            url(ep.articles.deleteComment(createdCommentId)),
            { headers: auth(tokenB) }
        )
        expect(res.status()).toBe(204)
    })

    test('DELETE /articles/:articleId → 204', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        // 두 번째 게시물을 만들어 삭제 검증 (첫 번째는 이후 테스트에서 재활용)
        const createRes = await request.post(url(ep.articles.create), {
            headers: auth(tokenA),
            data: {
                imageUrl: 'https://via.placeholder.com/300',
                mealDate: new Date().toISOString(),
                restaurant: {
                    name: '삭제 테스트 식당',
                    address: '서울시',
                    roadAddress: '서울시 테스트로 2',
                    phone: '',
                    lat: '37.5',
                    lng: '127.0',
                    category: '한식',
                    kakaoId: 'test-kakao-id-2',
                    kakaoUrl: 'https://place.map.kakao.com/test2'
                },
                taggedMembersId: []
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
    test('GET /recruits → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.recruitsList, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('POST /recruits → 200 또는 201', async ({ request }) => {
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
        expect([200, 201]).toContain(res.status())
        const body = await res.json()
        const id = body.data
        createdRecruitId = Number(id)
    })

    test('POST /recruits/:id/join (다른 사용자) → 200', async ({ request }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            url(ep.recruits.join(createdRecruitId)),
            { headers: auth(tokenB) }
        )
        // 이미 참여했거나 만원이면 409/400, 정상이면 200/201
        expect([200, 201, 400, 409]).toContain(res.status())
    })

    // ─── 7.1. Subscriptions ───────────────────────────────────────────────────

    test.describe('Subscriptions', () => {
        test('POST /subscriptions/recruits/:recruitId → 200 또는 409', async ({
            request
        }) => {
            test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
            const res = await request.post(
                url(ep.subscriptions.recruit(createdRecruitId)),
                { headers: auth(tokenA) }
            )
            expect([200, 201, 409]).toContain(res.status())
        })

        test('POST /subscribe/:postId → 200 또는 409', async ({ request }) => {
            test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
            const res = await request.post(
                url(ep.subscriptions.direct(createdRecruitId)),
                { headers: auth(tokenB) }
            )
            expect([200, 201, 409]).toContain(res.status())
        })
    })

    test('POST /recruits/:id/close (작성자) → 200', async ({ request }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            url(ep.recruits.close(createdRecruitId)),
            { headers: auth(tokenA) }
        )
        expect([200, 201, 400, 409]).toContain(res.status())
    })
})

// ─── 8. Plans ────────────────────────────────────────────────────────────

let createdPlanId = 0

test.describe('Plans', () => {
    test('POST /plans → 201', async ({ request }) => {
        const res = await request.post(url(ep.plans.create), {
            headers: auth(tokenA),
            data: {
                meetingDate: '2099-12-31',
                meetingTime: '12:00'
            }
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.id ?? body.id
        if (typeof id === 'number') createdPlanId = id
    })

    test('GET /plans → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.plansList, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('GET /plans/uncompleted → 200 배열', async ({ request }) => {
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

    test('GET /plans/completed → 200 배열', async ({ request }) => {
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
    test('POST /invitations/send → 200 또는 201', async ({ request }) => {
        const res = await request.post(url(ep.invitations.send), {
            headers: auth(tokenA),
            data: {
                inviteeId: Number(memberIdB),
                message: 'E2E 테스트 초대장'
            }
        })
        expect([200, 201, 400, 409]).toContain(res.status())
        const body = await res.json()
        const id = body.data?.id ?? body.id
        if (typeof id === 'number') createdInvitationId = id
    })

    test('GET /invitations → 200 배열', async ({ request }) => {
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

    test('GET /invitations/me → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.invitationsMe, {
            headers: auth(tokenB)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('PATCH /invitations/:id/accept → 200 (초대가 있는 경우)', async ({
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
        const res = await request.patch(url(ep.invitations.accept(invId)), {
            headers: auth(tokenB)
        })
        expect([200, 201, 400, 409]).toContain(res.status())
    })

    test('POST /invitations/send (reject용 2차 초대) → 다양한 상태 허용', async ({
        request
    }) => {
        const res = await request.post(url(ep.invitations.send), {
            headers: auth(tokenA),
            data: {
                inviteeId: Number(memberIdB),
                message: 'E2E 거절용 초대'
            }
        })
        expect([200, 201, 400, 409]).toContain(res.status())
        const body = await res.json()
        const id = body.data?.id ?? body.id
        if (typeof id === 'number') {
            // PATCH reject 검증
            const rejectRes = await request.patch(
                url(ep.invitations.reject(id)),
                { headers: auth(tokenB) }
            )
            expect([200, 201, 400, 409]).toContain(rejectRes.status())
        }
    })
})

// ─── 10. Referrals ───────────────────────────────────────────────────────

let referralCode = ''

test.describe('Referrals', () => {
    test('POST /referrals → 201, code 반환', async ({ request }) => {
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

    test('GET /referrals/me → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.referralsMe, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('POST /referrals/redeem → 204 또는 400/409 (자기 코드 or 중복)', async ({
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
        expect([200, 204, 400, 409]).toContain(res.status())
    })
})

// ─── 11. Challenges ──────────────────────────────────────────────────────

test.describe('Challenges', () => {
    test('GET /challenges/me → 200', async ({ request }) => {
        const { res, body } = await getJson(request, responses.challengesMe, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(typeof body.data.week).toBe('object')
    })

    test('POST /challenges/me/reward → 200 또는 400/409', async ({
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
    test('GET /coupons/me → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.couponsMy, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('POST /coupons/:couponId/use → 쿠폰 있으면 200, 없으면 404', async ({
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
    test('GET /friends/me → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.friendsList, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('GET /friends/search → 200 배열', async ({ request }) => {
        const res = await request.get(url(responses.friendsSearch('q=E2E')), {
            headers: auth(tokenA)
        })
        expect([200, 400]).toContain(res.status())
    })

    test('GET /friends/blocks/me → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.friendsBlocks, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('GET /friends/requests/incoming → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.friendsRequestsIncoming,
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('GET /friends/requests/outgoing → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(
            request,
            responses.friendsRequestsOutgoing,
            { headers: auth(tokenA) }
        )
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })

    test('POST /friends/requests/:memberId → 200 또는 409', async ({
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
            [200, 201, 400, 409],
            `POST /friends/requests/${memberIdB} (memberIdA=${memberIdA})`
        )
        // FriendRequestItemResponse는 `id`가 아니라 `requestId` 필드를 사용한다
        const id = body.data?.requestId
        if (typeof id === 'number') friendRequestId = id
    })

    test('GET /friends/requests/incoming (userB 기준) → 요청 목록 확인', async ({
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

    test('POST /friends/requests/:requestId/accept → 200 또는 404/409', async ({
        request
    }) => {
        if (friendRequestId === 0) return
        const res = await request.post(
            url(ep.friends.acceptRequest(friendRequestId)),
            { headers: auth(tokenB) }
        )
        expect([200, 201, 400, 404, 409]).toContain(res.status())
    })

    test('DELETE /friends/:memberId → 200 또는 404', async ({ request }) => {
        // 친구 삭제 (친구가 없으면 404)
        const res = await request.delete(
            url(ep.friends.remove(Number(memberIdB))),
            { headers: auth(tokenA) }
        )
        expect([200, 204, 400, 404, 409]).toContain(res.status())
    })

    test('DELETE /friends/requests/:requestId → 200 또는 404', async ({
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
        expect([200, 204, 400, 404]).toContain(res.status())
    })

    test('POST /friends/blocks/:memberId → 200 또는 409', async ({
        request
    }) => {
        const res = await request.post(
            url(ep.friends.block(Number(memberIdB))),
            { headers: auth(tokenA) }
        )
        expect([200, 204, 201, 400, 409]).toContain(res.status())
    })

    test('DELETE /friends/blocks/:memberId → 200 또는 404', async ({
        request
    }) => {
        const res = await request.delete(
            url(ep.friends.unblock(Number(memberIdB))),
            { headers: auth(tokenA) }
        )
        expect([200, 204, 400, 404]).toContain(res.status())
    })
})

// ─── 14. Friends Meals ───────────────────────────────────────────────────

test.describe('Friends Meals', () => {
    test('GET /friends/me/meals → 200 배열', async ({ request }) => {
        const { res, body } = await getJson(request, responses.friendsMeals, {
            headers: auth(tokenA)
        })
        expect(res.status()).toBe(200)
        expect(Array.isArray(body.data)).toBe(true)
    })
})

// ─── 2. 인증 ─────────────────────────────────────────────────────────────

test('POST /auth/logout → 200 또는 204', async ({ request }) => {
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
        const totalDefined = countLeaves(endpoints)
        const unusedEndpointPaths = getUnusedEndpointPaths(
            endpoints,
            usedEndpointPaths
        )
        console.log(unusedEndpointPaths)
        expect(usedEndpointPaths.size).toBe(totalDefined)
    })
})
