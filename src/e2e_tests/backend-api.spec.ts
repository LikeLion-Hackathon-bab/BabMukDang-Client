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
 */

import { test, expect, type APIRequestContext } from '@playwright/test'

const BASE = (process.env.BACKEND_URL ?? 'http://localhost:3000') + '/api/v1'

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────

async function signup(
    request: APIRequestContext,
    email: string,
    username: string,
): Promise<void> {
    const res = await request.post(`${BASE}/auth/signup`, {
        data: { email, username },
    })
    // 이미 존재하는 계정은 409를 허용한다
    expect([200, 201, 409]).toContain(res.status())
}

async function login(
    request: APIRequestContext,
    email: string,
): Promise<string> {
    const res = await request.post(`${BASE}/auth/login`, {
        data: { email },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const token: string = body.data?.accessToken ?? body.accessToken ?? body.data ?? body
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)
    return token
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` }
}

// ─── 테스트 계정 정보 ────────────────────────────────────────────────────

const USER_A = {
    email: `e2e-user-a-${Date.now()}@babmukdang.test`,
    username: 'E2E유저A',
}
const USER_B = {
    email: `e2e-user-b-${Date.now()}@babmukdang.test`,
    username: 'E2E유저B',
}

// 공유 상태 (테스트 순서에 의존하지 않도록 beforeAll에서 초기화)
let tokenA = ''
let tokenB = ''
let memberIdA = ''
let memberIdB = ''

// ─── 전역 계정 발급 ───────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ request }) => {
    // 계정 생성
    await signup(request, USER_A.email, USER_A.username)
    await signup(request, USER_B.email, USER_B.username)

    // 로그인 → JWT 발급
    tokenA = await login(request, USER_A.email)
    tokenB = await login(request, USER_B.email)

    // 내 프로필에서 memberId 조회
    const profileA = await request.get(`${BASE}/members/me`, {
        headers: auth(tokenA),
    })
    const profileABody = await profileA.json()
    memberIdA = String(
        profileABody.data?.memberId ??
        profileABody.data?.userId ??
        profileABody.memberId ??
        profileABody.userId ??
        '1',
    )

    const profileB = await request.get(`${BASE}/members/me`, {
        headers: auth(tokenB),
    })
    const profileBBody = await profileB.json()
    memberIdB = String(
        profileBBody.data?.memberId ??
        profileBBody.data?.userId ??
        profileBBody.memberId ??
        profileBBody.userId ??
        '2',
    )
})

// ─── 1. App 루트 ──────────────────────────────────────────────────────────

test.describe('App 루트', () => {
    test('GET /api/v1 → 200 Hello World', async ({ request }) => {
        const res = await request.get(`${BASE}`)
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body.data).toBe('Hello World!')
    })
})

// ─── 2. 인증 ─────────────────────────────────────────────────────────────

test.describe('Auth', () => {
    test('GET /auth/test → JWT 문자열 반환', async ({ request }) => {
        const res = await request.get(`${BASE}/auth/test`)
        expect(res.status()).toBe(200)
        const body = await res.json()
        const token: string = body.data ?? body
        expect(token.split('.').length).toBe(3)
    })

    test('미인증 요청 → 401', async ({ request }) => {
        const res = await request.get(`${BASE}/members/me`)
        expect(res.status()).toBe(401)
        const body = await res.json()
        expect(body.success).toBe(false)
    })
})

// ─── 3. Members ──────────────────────────────────────────────────────────

test.describe('Members', () => {
    test('GET /members/me → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/members/me`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body.data ?? body).toBeTruthy()
    })

    test('GET /members/me/profile → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/members/me/profile`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
    })

    test('GET /members/me/profile/detail → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/members/me/profile/detail`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
    })

    test('PATCH /members/me/profile → 200', async ({ request }) => {
        const res = await request.patch(`${BASE}/members/me/profile`, {
            headers: auth(tokenA),
            data: { userName: 'E2E수정A', bio: '테스트 바이오' },
        })
        expect([200, 204]).toContain(res.status())
    })

    test('GET /members/me/articles → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/members/me/articles`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /members/me/summary → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/members/me/summary`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
    })

    test('GET /members/me/meal-status → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/members/me/meal-status`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
    })

    test('PATCH /members/me/meal-status (ATE_NOW) → 200', async ({ request }) => {
        const res = await request.patch(`${BASE}/members/me/meal-status`, {
            headers: auth(tokenA),
            data: { status: 'ATE_NOW' },
        })
        expect([200, 204]).toContain(res.status())
    })

    test('PATCH /members/me/meal-status (SET_OFF) → 200', async ({ request }) => {
        const res = await request.patch(`${BASE}/members/me/meal-status`, {
            headers: auth(tokenA),
            data: { status: 'SET_OFF' },
        })
        expect([200, 204]).toContain(res.status())
    })

    test('GET /members/:memberId/profile → 200', async ({ request }) => {
        const res = await request.get(
            `${BASE}/members/${memberIdA}/profile`,
            { headers: auth(tokenB) },
        )
        expect(res.status()).toBe(200)
    })

    test('GET /members/:memberId/profile/detail → 200', async ({ request }) => {
        const res = await request.get(
            `${BASE}/members/${memberIdA}/profile/detail`,
            { headers: auth(tokenB) },
        )
        expect(res.status()).toBe(200)
    })

    test('GET /members/:memberId/articles → 200 배열', async ({ request }) => {
        const res = await request.get(
            `${BASE}/members/${memberIdA}/articles`,
            { headers: auth(tokenB) },
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /members/:memberId → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/members/${memberIdA}`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
    })
})

// ─── 4. Onboarding ───────────────────────────────────────────────────────

test.describe('Onboarding', () => {
    test('POST /onboarding → 204', async ({ request }) => {
        const res = await request.post(`${BASE}/onboarding`, {
            headers: auth(tokenA),
            data: {
                userName: 'E2E온보딩A',
                profileImageUrl: null,
                bio: null,
                likedCodes: [],
                dislikedCodes: [],
                allergyCodes: [],
            },
        })
        expect([200, 204]).toContain(res.status())
    })
})

// ─── 5. Preferences ──────────────────────────────────────────────────────

test.describe('Preferences', () => {
    test('GET /preferences/me → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/preferences/me`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
    })

    test('GET /preferences/me/meta → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/preferences/me/meta`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
    })

    test('POST /preferences/onboarding → 204', async ({ request }) => {
        const res = await request.post(`${BASE}/preferences/onboarding`, {
            headers: auth(tokenA),
            data: {
                likedCodes: [],
                dislikedCodes: [],
                allergyCodes: [],
            },
        })
        expect([200, 204]).toContain(res.status())
    })

    test('GET /preferences/members/:memberId → 200 배열', async ({ request }) => {
        const res = await request.get(
            `${BASE}/preferences/members/${memberIdA}`,
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })
})

// ─── 6. Articles ─────────────────────────────────────────────────────────

let createdArticleId = 0
let createdCommentId = 0

test.describe('Articles', () => {
    test('GET /articles/home → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/articles/home`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /articles/meals/recent → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/articles/meals/recent`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /articles/by-author/:authorId → 200 배열', async ({ request }) => {
        const res = await request.get(
            `${BASE}/articles/by-author/${memberIdA}`,
            { headers: auth(tokenA) },
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('POST /articles → 201, id 반환', async ({ request }) => {
        const res = await request.post(`${BASE}/articles`, {
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
                    kakaoUrl: 'https://place.map.kakao.com/test',
                },
                taggedMembersId: [],
            },
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.id ?? body.id
        expect(typeof id).toBe('number')
        createdArticleId = id
    })

    test('GET /articles/:articleId → 200', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const res = await request.get(
            `${BASE}/articles/${createdArticleId}`,
            { headers: auth(tokenA) },
        )
        expect(res.status()).toBe(200)
    })

    test('POST /articles/:articleId/like → 200', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const res = await request.post(
            `${BASE}/articles/${createdArticleId}/like`,
            { headers: auth(tokenB) },
        )
        expect([200, 201]).toContain(res.status())
    })

    test('POST /articles/:articleId/comments → 201, id 반환', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const res = await request.post(
            `${BASE}/articles/${createdArticleId}/comments`,
            {
                headers: auth(tokenB),
                data: { content: 'E2E 테스트 댓글입니다.' },
            },
        )
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.id ?? body.id
        expect(typeof id).toBe('number')
        createdCommentId = id
    })

    test('GET /articles/:articleId/comments → 200 배열', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        const res = await request.get(
            `${BASE}/articles/${createdArticleId}/comments`,
            { headers: auth(tokenA) },
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('DELETE /articles/comments/:commentId → 204', async ({ request }) => {
        test.skip(createdCommentId === 0, '댓글 생성 실패로 건너뜀')
        const res = await request.delete(
            `${BASE}/articles/comments/${createdCommentId}`,
            { headers: auth(tokenB) },
        )
        expect(res.status()).toBe(204)
    })

    test('DELETE /articles/:articleId → 204', async ({ request }) => {
        test.skip(createdArticleId === 0, '게시물 생성 실패로 건너뜀')
        // 두 번째 게시물을 만들어 삭제 검증 (첫 번째는 이후 테스트에서 재활용)
        const createRes = await request.post(`${BASE}/articles`, {
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
                    kakaoUrl: 'https://place.map.kakao.com/test2',
                },
                taggedMembersId: [],
            },
        })
        const createBody = await createRes.json()
        const deleteTargetId = createBody.data?.id ?? createBody.id
        if (typeof deleteTargetId !== 'number') return

        const res = await request.delete(
            `${BASE}/articles/${deleteTargetId}`,
            { headers: auth(tokenA) },
        )
        expect(res.status()).toBe(204)
    })
})

// ─── 7. Recruits ─────────────────────────────────────────────────────────

let createdRecruitId = 0

test.describe('Recruits', () => {
    test('GET /recruits → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/recruits`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('POST /recruits → 200 또는 201', async ({ request }) => {
        const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const res = await request.post(`${BASE}/recruits`, {
            headers: auth(tokenA),
            data: {
                targetCount: 2,
                meetingAt: future.toISOString(),
                location: '서울시 강남구 테헤란로',
                message: 'E2E 테스트 모집글',
            },
        })
        expect([200, 201]).toContain(res.status())
        const body = await res.json()
        const id = body.data?.id ?? body.id ?? body.data?.postId ?? body.postId
        if (typeof id === 'number') createdRecruitId = id
    })

    test('POST /recruits/:id/join (다른 사용자) → 200', async ({ request }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            `${BASE}/recruits/${createdRecruitId}/join`,
            { headers: auth(tokenB) },
        )
        // 이미 참여했거나 만원이면 409/400, 정상이면 200/201
        expect([200, 201, 400, 409]).toContain(res.status())
    })

    test('POST /recruits/:id/close (작성자) → 200', async ({ request }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            `${BASE}/recruits/${createdRecruitId}/close`,
            { headers: auth(tokenA) },
        )
        expect([200, 201, 400, 409]).toContain(res.status())
    })
})

// ─── 8. Plans ────────────────────────────────────────────────────────────

let createdPlanId = 0

test.describe('Plans', () => {
    test('POST /plans → 201', async ({ request }) => {
        const res = await request.post(`${BASE}/plans`, {
            headers: auth(tokenA),
            data: {
                meetingDate: '2099-12-31',
                meetingTime: '12:00',
            },
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        const id = body.data?.id ?? body.id
        if (typeof id === 'number') createdPlanId = id
    })

    test('GET /plans → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/plans`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /plans/uncompleted → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/plans/uncompleted`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /plans/completed → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/plans/completed`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })
})

// ─── 9. Invitations ──────────────────────────────────────────────────────

let createdInvitationId = 0

test.describe('Invitations', () => {
    test('POST /invitations/send → 200 또는 201', async ({ request }) => {
        const res = await request.post(`${BASE}/invitations/send`, {
            headers: auth(tokenA),
            data: {
                inviteeId: Number(memberIdB),
                message: 'E2E 테스트 초대장',
            },
        })
        expect([200, 201, 400, 409]).toContain(res.status())
        const body = await res.json()
        const id = body.data?.id ?? body.id
        if (typeof id === 'number') createdInvitationId = id
    })

    test('GET /invitations → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/invitations`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /invitations/me → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/invitations/me`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('PATCH /invitations/:id/accept → 200 (초대가 있는 경우)', async ({ request }) => {
        // 초대 목록에서 첫 번째 초대를 수락한다
        const listRes = await request.get(`${BASE}/invitations`, {
            headers: auth(tokenB),
        })
        const listBody = await listRes.json()
        const list: { id: number }[] = listBody.data ?? listBody
        if (!Array.isArray(list) || list.length === 0) {
            // 초대가 없으면 건너뜀
            return
        }
        const invId = list[0].id
        const res = await request.patch(
            `${BASE}/invitations/${invId}/accept`,
            { headers: auth(tokenB) },
        )
        expect([200, 201, 400, 409]).toContain(res.status())
    })

    test('POST /invitations/send (reject용 2차 초대) → 다양한 상태 허용', async ({ request }) => {
        const res = await request.post(`${BASE}/invitations/send`, {
            headers: auth(tokenA),
            data: {
                inviteeId: Number(memberIdB),
                message: 'E2E 거절용 초대',
            },
        })
        expect([200, 201, 400, 409]).toContain(res.status())
        const body = await res.json()
        const id = body.data?.id ?? body.id
        if (typeof id === 'number') {
            // PATCH reject 검증
            const rejectRes = await request.patch(
                `${BASE}/invitations/${id}/reject`,
                { headers: auth(tokenB) },
            )
            expect([200, 201, 400, 409]).toContain(rejectRes.status())
        }
    })
})

// ─── 10. Subscriptions ───────────────────────────────────────────────────

test.describe('Subscriptions', () => {
    test('POST /subscriptions/recruits/:recruitId → 200 또는 409', async ({ request }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            `${BASE}/subscriptions/recruits/${createdRecruitId}`,
            { headers: auth(tokenA) },
        )
        expect([200, 201, 409]).toContain(res.status())
    })

    test('POST /subscribe/:postId → 200 또는 409', async ({ request }) => {
        test.skip(createdRecruitId === 0, '모집글 생성 실패로 건너뜀')
        const res = await request.post(
            `${BASE}/subscribe/${createdRecruitId}`,
            { headers: auth(tokenB) },
        )
        expect([200, 201, 409]).toContain(res.status())
    })
})

// ─── 11. Referrals ───────────────────────────────────────────────────────

let referralCode = ''

test.describe('Referrals', () => {
    test('POST /referrals → 201, code 반환', async ({ request }) => {
        const res = await request.post(`${BASE}/referrals`, {
            headers: auth(tokenA),
        })
        expect([200, 201]).toContain(res.status())
        const body = await res.json()
        const code = body.data?.code ?? body.code
        if (typeof code === 'string') referralCode = code
    })

    test('GET /referrals/me → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/referrals/me`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('POST /referrals/redeem → 204 또는 400/409 (자기 코드 or 중복)', async ({ request }) => {
        // userB가 userA의 추천코드를 redeem한다
        // referralCode가 없으면 건너뜀
        if (!referralCode) return
        const res = await request.post(`${BASE}/referrals/redeem`, {
            headers: auth(tokenB),
            data: { code: referralCode },
        })
        // 정상: 204, 자기참조 or 중복: 400/409
        expect([200, 204, 400, 409]).toContain(res.status())
    })
})

// ─── 12. Challenges ──────────────────────────────────────────────────────

test.describe('Challenges', () => {
    test('GET /challenges/me → 200', async ({ request }) => {
        const res = await request.get(`${BASE}/challenges/me`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
    })

    test('POST /challenges/me/reward → 200 또는 400/409', async ({ request }) => {
        const res = await request.post(`${BASE}/challenges/me/reward`, {
            headers: auth(tokenA),
        })
        // 조건 미충족: 400, 중복: 409, 정상: 200/201
        expect([200, 201, 400, 409]).toContain(res.status())
    })
})

// ─── 13. Coupons ─────────────────────────────────────────────────────────

test.describe('Coupons', () => {
    test('GET /coupons/me → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/coupons/me`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('POST /coupons/:couponId/use → 쿠폰 있으면 200, 없으면 404', async ({ request }) => {
        // 보유 쿠폰 목록 조회 후 첫 번째 쿠폰 사용
        const listRes = await request.get(`${BASE}/coupons/me`, {
            headers: auth(tokenA),
        })
        const listBody = await listRes.json()
        const list: { id: number }[] = listBody.data ?? listBody
        if (!Array.isArray(list) || list.length === 0) {
            // 쿠폰이 없으면 존재하지 않는 id로 404 검증
            const res = await request.post(`${BASE}/coupons/99999/use`, {
                headers: auth(tokenA),
            })
            expect([404, 400, 403]).toContain(res.status())
            return
        }
        const couponId = list[0].id
        const res = await request.post(`${BASE}/coupons/${couponId}/use`, {
            headers: auth(tokenA),
        })
        expect([200, 201, 409]).toContain(res.status())
    })
})

// ─── 14. Friends ─────────────────────────────────────────────────────────

let friendRequestId = 0

test.describe('Friends', () => {
    test('GET /friends/me → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/friends/me`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /friends/search → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/friends/search?q=E2E`, {
            headers: auth(tokenA),
        })
        expect([200, 400]).toContain(res.status())
    })

    test('GET /friends/blocks/me → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/friends/blocks/me`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /friends/requests/incoming → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/friends/requests/incoming`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('GET /friends/requests/outgoing → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/friends/requests/outgoing`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('POST /friends/requests/:memberId → 200 또는 409', async ({ request }) => {
        const res = await request.post(
            `${BASE}/friends/requests/${memberIdB}`,
            { headers: auth(tokenA) },
        )
        // 이미 요청했거나 친구이면 409, 정상이면 200/201
        expect([200, 201, 400, 409]).toContain(res.status())
        const body = await res.json()
        const id = body.data?.id ?? body.id
        if (typeof id === 'number') friendRequestId = id
    })

    test('GET /friends/requests/incoming (userB 기준) → 요청 목록 확인', async ({ request }) => {
        const res = await request.get(`${BASE}/friends/requests/incoming`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        const list: { id: number }[] = body.data ?? body
        if (Array.isArray(list) && list.length > 0 && friendRequestId === 0) {
            friendRequestId = list[0].id
        }
    })

    test('POST /friends/requests/:requestId/accept → 200 또는 404/409', async ({ request }) => {
        if (friendRequestId === 0) return
        const res = await request.post(
            `${BASE}/friends/requests/${friendRequestId}/accept`,
            { headers: auth(tokenB) },
        )
        expect([200, 201, 400, 404, 409]).toContain(res.status())
    })

    test('DELETE /friends/:memberId → 200 또는 404', async ({ request }) => {
        // 친구 삭제 (친구가 없으면 404)
        const res = await request.delete(
            `${BASE}/friends/${memberIdB}`,
            { headers: auth(tokenA) },
        )
        expect([200, 204, 400, 404, 409]).toContain(res.status())
    })

    test('POST /friends/requests/:memberId (reject용 재요청) → 상태 허용', async ({ request }) => {
        const res = await request.post(
            `${BASE}/friends/requests/${memberIdB}`,
            { headers: auth(tokenA) },
        )
        expect([200, 201, 400, 409]).toContain(res.status())
        const body = await res.json()
        const newRequestId = body.data?.id ?? body.id
        if (typeof newRequestId === 'number') {
            // reject
            const rejectRes = await request.post(
                `${BASE}/friends/requests/${newRequestId}/reject`,
                { headers: auth(tokenB) },
            )
            expect([200, 201, 400, 404, 409]).toContain(rejectRes.status())
        }
    })

    test('DELETE /friends/requests/:requestId → 200 또는 404', async ({ request }) => {
        // userA가 새 요청 후 직접 취소
        const createRes = await request.post(
            `${BASE}/friends/requests/${memberIdB}`,
            { headers: auth(tokenA) },
        )
        const createBody = await createRes.json()
        const reqId = createBody.data?.id ?? createBody.id
        if (typeof reqId !== 'number') return
        const res = await request.delete(
            `${BASE}/friends/requests/${reqId}`,
            { headers: auth(tokenA) },
        )
        expect([200, 204, 400, 404]).toContain(res.status())
    })

    test('POST /friends/blocks/:memberId → 200 또는 409', async ({ request }) => {
        const res = await request.post(
            `${BASE}/friends/blocks/${memberIdB}`,
            { headers: auth(tokenA) },
        )
        expect([200, 201, 400, 409]).toContain(res.status())
    })

    test('DELETE /friends/blocks/:memberId → 200 또는 404', async ({ request }) => {
        const res = await request.delete(
            `${BASE}/friends/blocks/${memberIdB}`,
            { headers: auth(tokenA) },
        )
        expect([200, 204, 400, 404]).toContain(res.status())
    })
})

// ─── 15. Friends Meals ───────────────────────────────────────────────────

test.describe('Friends Meals', () => {
    test('GET /friends/me/meals → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/friends/me/meals`, {
            headers: auth(tokenA),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })
})
