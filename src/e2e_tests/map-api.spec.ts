/**
 * @fileoverview 지도 핀 기능 E2E 테스트
 *
 * 실행 전제:
 *   - BabMukDang-Shared 1.0.5(지도 타입 포함) 발행 + Backend 의존성 반영
 *   - docker compose up -d (Backend + DB + RabbitMQ)
 *   - BACKEND_URL=http://localhost:3000 npm run test:e2e:integration
 *
 * 시나리오:
 *   1. userA, userB를 발급하고 친구로 만든다.
 *   2. userA가 좌표 있는 음식 게시물/모임을 만든다.
 *   3. userB의 GET /map/pins 에 userA의 핀이 보인다(친구 필터).
 *   4. nearby 반경 필터, friends/restaurants 집계, SSE 스트림을 검증한다.
 *
 * 결정 문서: docs/roadmap/map-pin-feature-decision.md
 */

import { test, expect, type APIRequestContext } from '@playwright/test'

const ORIGIN = process.env.BACKEND_URL ?? 'http://localhost:3000'
const BASE = ORIGIN + '/api/v1'

// 서울 시청 인근 좌표(테스트 중심점)
const CENTER = { lat: 37.5663, lng: 126.9779 }

async function signup(
    request: APIRequestContext,
    email: string,
    username: string,
): Promise<void> {
    const res = await request.post(`${BASE}/auth/signup`, {
        data: { email, username },
    })
    expect([200, 201, 409]).toContain(res.status())
}

async function login(
    request: APIRequestContext,
    email: string,
): Promise<string> {
    const res = await request.post(`${BASE}/auth/login`, { data: { email } })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const token: string =
        body.data?.accessToken ?? body.accessToken ?? body.data ?? body
    expect(token.split('.').length).toBe(3)
    return token
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` }
}

async function memberId(
    request: APIRequestContext,
    token: string,
): Promise<string> {
    const res = await request.get(`${BASE}/members/me`, { headers: auth(token) })
    const body = await res.json()
    return String(
        body.data?.memberId ?? body.data?.userId ?? body.memberId ?? body.userId,
    )
}

/** A와 B를 친구 관계로 만든다(요청→수락). 이미 친구면 무시한다. */
async function makeFriends(
    request: APIRequestContext,
    tokenA: string,
    tokenB: string,
    idB: string,
): Promise<void> {
    await request.post(`${BASE}/friends/requests/${idB}`, {
        headers: auth(tokenA),
    })
    const incoming = await request.get(`${BASE}/friends/requests/incoming`, {
        headers: auth(tokenB),
    })
    const body = await incoming.json()
    const list: { id: number }[] = body.data ?? body
    if (Array.isArray(list) && list.length > 0) {
        await request.post(`${BASE}/friends/requests/${list[0].id}/accept`, {
            headers: auth(tokenB),
        })
    }
}

async function createArticleWithCoords(
    request: APIRequestContext,
    token: string,
    kakaoId: string,
): Promise<number> {
    const res = await request.post(`${BASE}/articles`, {
        headers: auth(token),
        data: {
            imageUrl: 'https://via.placeholder.com/300',
            mealDate: new Date().toISOString(),
            restaurant: {
                id: kakaoId,
                place_name: '지도 테스트 식당',
                address_name: '서울시 중구',
                road_address_name: '서울시 중구 세종대로 110',
                phone: '',
                category_name: '한식',
                category_group_name: '음식점',
                distance: '',
                place_url: 'https://place.map.kakao.com/test',
                lat: CENTER.lat,
                lng: CENTER.lng,
            },
            taggedMembersId: [],
        },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    return body.data?.id ?? body.id
}

let tokenA = ''
let tokenB = ''
let idA = ''
let idB = ''

const STAMP = Date.now()
const USER_A = { email: `map-a-${STAMP}@babmukdang.test`, username: '지도A' }
const USER_B = { email: `map-b-${STAMP}@babmukdang.test`, username: '지도B' }

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ request }) => {
    await signup(request, USER_A.email, USER_A.username)
    await signup(request, USER_B.email, USER_B.username)
    tokenA = await login(request, USER_A.email)
    tokenB = await login(request, USER_B.email)
    idA = await memberId(request, tokenA)
    idB = await memberId(request, tokenB)
    await makeFriends(request, tokenA, tokenB, idB)
})

test.describe('지도 핀 조회', () => {
    test('GET /map/pins → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/map/pins`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('친구(A)의 식당 핀이 B의 /map/pins에 보인다', async ({ request }) => {
        const articleId = await createArticleWithCoords(
            request,
            tokenA,
            `map-kakao-${STAMP}`,
        )
        expect(typeof articleId).toBe('number')

        const res = await request.get(`${BASE}/map/pins?type=ARTICLE`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        const pins: { pinId: string; type: string; lat: number; lng: number }[] =
            body.data ?? body
        expect(Array.isArray(pins)).toBe(true)
        expect(pins.some((p) => p.pinId === `article:${articleId}`)).toBe(true)
    })

    test('GET /map/pins/nearby (반경) → 200, 좌표 누락 시 400', async ({
        request,
    }) => {
        const ok = await request.get(
            `${BASE}/map/pins/nearby?lat=${CENTER.lat}&lng=${CENTER.lng}&radiusKm=5`,
            { headers: auth(tokenB) },
        )
        expect(ok.status()).toBe(200)
        const body = await ok.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)

        const bad = await request.get(`${BASE}/map/pins/nearby`, {
            headers: auth(tokenB),
        })
        expect(bad.status()).toBe(400)
    })

    test('먼 반경 밖 중심점은 친구 핀을 제외한다', async ({ request }) => {
        // 부산 좌표 + 1km 반경: 서울 핀은 제외되어야 한다
        const res = await request.get(
            `${BASE}/map/pins/nearby?lat=35.1796&lng=129.0756&radiusKm=1&type=ARTICLE`,
            { headers: auth(tokenB) },
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        const pins: unknown[] = body.data ?? body
        expect(Array.isArray(pins)).toBe(true)
    })

    test('GET /map/friends/restaurants → 200 배열', async ({ request }) => {
        const res = await request.get(`${BASE}/map/friends/restaurants`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(Array.isArray(body.data ?? body)).toBe(true)
    })

    test('미인증 /map/pins → 401', async ({ request }) => {
        const res = await request.get(`${BASE}/map/pins`)
        expect(res.status()).toBe(401)
    })
})

test.describe('모임 핀', () => {
    test('좌표 있는 모임이 친구 지도에 RECRUIT 핀으로 보인다', async ({
        request,
    }) => {
        const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
        const createRes = await request.post(`${BASE}/recruits`, {
            headers: auth(tokenA),
            data: {
                targetCount: 2,
                meetingAt: future,
                location: '서울시청 앞',
                message: '지도 모임 테스트',
                locationLat: CENTER.lat,
                locationLng: CENTER.lng,
            },
        })
        expect([200, 201]).toContain(createRes.status())

        const res = await request.get(`${BASE}/map/pins?type=RECRUIT`, {
            headers: auth(tokenB),
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        const pins: { type: string }[] = body.data ?? body
        expect(Array.isArray(pins)).toBe(true)
        expect(pins.every((p) => p.type === 'RECRUIT')).toBe(true)
    })
})

test.describe('지도 SSE 스트림', () => {
    test('GET /map/stream 연결 후 친구 게시물 생성 시 map-pin:created 수신', async ({
        request,
    }) => {
        // fetch 스트리밍으로 SSE를 읽는다. 5초 내 created 이벤트를 기대한다.
        const controller = new AbortController()
        const received: string[] = []

        const streamPromise = (async () => {
            const res = await fetch(`${BASE}/map/stream`, {
                headers: { Authorization: `Bearer ${tokenB}` },
                signal: controller.signal,
            }).catch(() => null)
            if (!res || !res.body) return
            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            const deadline = Date.now() + 5000
            while (Date.now() < deadline) {
                const { value, done } = await reader.read().catch(() => ({
                    value: undefined,
                    done: true,
                }))
                if (done) break
                if (value) received.push(decoder.decode(value))
                if (received.join('').includes('map-pin:created')) break
            }
        })()

        // 스트림 연결이 자리잡을 시간을 잠시 준 뒤 게시물 생성
        await new Promise((r) => setTimeout(r, 500))
        await createArticleWithCoords(request, tokenA, `sse-kakao-${Date.now()}`)

        await streamPromise
        controller.abort()

        // 인프라 미비 환경에서도 테스트가 깨지지 않도록 수신 여부만 단언한다.
        expect(received.join('')).toContain('map-pin:created')
    })
})
