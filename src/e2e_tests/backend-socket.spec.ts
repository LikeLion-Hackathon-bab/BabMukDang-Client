/**
 * @fileoverview 매칭방 WebSocket(Socket.IO) E2E 테스트
 *
 * 실행 전제:
 *   docker compose up -d (Backend + DB + RabbitMQ)
 *   npm run test:e2e:integration
 *
 * `backend-api.spec.ts`와 동일하게 두 테스트 계정(userA, userB)을 로그인해
 * JWT/memberId를 확보한 뒤, 실제 도메인 흐름(초대 전송 → 수락)으로 매칭방을
 * 생성시키고 `socket.io-client`로 `/invitation` 네임스페이스에 접속해
 * `BaseRoomGateway`(Backend)가 정의한 양방향 이벤트 9종을 모두 검증한다.
 *
 * 룸 생성은 `POST /invitations/send` → `PATCH /invitations/:id/accept` 흐름으로 만든다.
 * accept API가 반환하는 roomId를 `/invitation?roomId={roomId}` 쿼리로 넘겨
 * 명시적인 방 입장 권한 검증과 Socket.IO 이벤트 흐름을 검증한다.
 */

import { expect, test, type APIRequestContext } from '@playwright/test'
import { io, type Socket } from 'socket.io-client'
import type {
    ChatMessageRequest as ChatMessageRequestDto,
    ChatMessageResponse as ChatMessageResponseItem,
    DatePicksUpdateResponse as DatePicksUpdateResponseDto,
    ExcludeMenuUpdateResponse as ExcludeMenuUpdateResponseDto,
    LocationCandidate,
    LocationCandidateAddUpdateResponse as LocationCandidateAddUpdateResponseDto,
    LocationCandidateVoteUpdateResponse as LocationCandidateVoteUpdateResponseDto,
    Menu,
    MenuPickUpdateResponse as MenuPickUpdateResponseDto,
    PhaseDataBroadcast as StageChangedResponseDto,
    RoomClientToServerEvents as ClientToServerEvents,
    RoomServerToClientEvents as ServerToClientEvents,
    ReadyStateRequest as ReadyStateRequestDto,
    RestaurantPickUpdateResponse as RestaurantPickUpdateResponseDto,
    TimePicksUpdateResponse as TimePicksUpdateResponseDto
} from '@kimdaegyu/babmukdang-shared/domain'
import {
    AddLocationCandidateRequestSchema,
    apiContract,
    ExcludeMenuRequestSchema,
    PickDateRequestSchema,
    PickMenuRequestSchema,
    PickRestaurantRequestSchema,
    PickTimesRequestSchema,
    VoteLocationRequestSchema,
    FoodCodeSchema,
    FoodLabelSchema,
    LocationIdSchema,
    toMemberId,
    toRestaurantId
} from '@kimdaegyu/babmukdang-shared/domain'

type DatePicksRequestDto = Parameters<ClientToServerEvents['pick-date']>[0]
type TimePicksRequestDto = Parameters<ClientToServerEvents['pick-times']>[0]
type LocationCandidateAddRequestDto = LocationCandidate
type LocationCandidateVoteRequestDto = Parameters<
    ClientToServerEvents['vote-location']
>[0]
type ExcludeMenuRequestDto = { menu: Menu }
type MenuPickRequestDto = Parameters<ClientToServerEvents['pick-menu']>[0]
type RestaurantPickRequestDto = Parameters<
    ClientToServerEvents['pick-restaurant']
>[0]
import {
    AppSocket,
    USER_A,
    USER_B,
    WS_BASE,
    auth,
    connectAndWaitForRoom,
    fetchMemberId,
    login,
    readBody,
    url,
    waitForDisconnect,
    waitForEvent
} from './helpers/auth'

test.describe.configure({ mode: 'serial', retries: 0 })

const resolvePath = (
    path: string,
    params: Record<string, string | number> = {}
) =>
    path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) =>
        encodeURIComponent(String(params[key]))
    )

async function seedRecentMeal(
    request: APIRequestContext,
    token: string
): Promise<void> {
    const res = await request.post(url(apiContract.articles.create.path), {
        headers: auth(token),
        data: {
            imageUrl: 'https://via.placeholder.com/300',
            mealDate: new Date().toISOString().slice(0, 10),
            restaurant: {
                restaurantId: `socket-e2e-restaurant-${Date.now()}`,
                placeName: '소켓 E2E 식당',
                categoryName: '한식',
                categoryGroupName: '음식점',
                roadAddressName: '서울시 테스트로 1',
                addressName: '서울시 테스트구',
                phone: '',
                placeUrl: 'https://place.map.kakao.com/socket-e2e',
                lat: 37.5,
                lng: 127.0
            },
            taggedMemberIds: [],
            foodAnalysis: {
                code: FoodCodeSchema.parse('KOREAN'),
                label: FoodLabelSchema.parse('한식'),
                confidence: 0.99,
                tsUtc: new Date().toISOString()
            }
        }
    })

    if (res.status() !== 201) {
        const body = await readBody(res)
        throw new Error(
            `[e2e] POST /articles 최근 메뉴 seed 실패: status=${res.status()}, body=${JSON.stringify(body)}`
        )
    }
}

// ─── 계정/룸 준비 ─────────────────────────────────────────────────────────

let tokenA = ''
let tokenB = ''
let memberIdA = ''
let memberIdB = ''
let invitationId = 0

let socketA: AppSocket
let socketB: AppSocket
let roomId = ''

test.beforeAll(async ({ request }) => {
    test.setTimeout(120_000)
    tokenA = await login(request, USER_A.email, USER_A.username)
    tokenB = await login(request, USER_B.email, USER_B.username)
    memberIdA = await fetchMemberId(request, tokenA, USER_A.email)
    memberIdB = await fetchMemberId(request, tokenB, USER_B.email)
    await seedRecentMeal(request, tokenA)

    // userA → userB 초대 전송, userB가 수락 → 도메인 이벤트가 RabbitMQ를 거쳐
    // `RoomSeedFlowService.seedInvitation`을 호출하고 매칭방이 생성된다.
    const sendRes = await request.post(url(apiContract.invitations.send.path), {
        headers: auth(tokenA),
        data: {
            inviteeId: toMemberId(Number(memberIdB)),
            message: 'E2E 소켓 테스트 초대장'
        }
    })
    const sendBody = await readBody(sendRes)
    const id = sendBody?.data?.invitationId ?? sendBody?.invitationId
    if (typeof id !== 'number') {
        throw new Error(
            `[e2e] POST /invitations/send 실패: status=${sendRes.status()}, body=${JSON.stringify(sendBody)}`
        )
    }
    invitationId = id

    const acceptRes = await request.post(
        url(
            resolvePath(apiContract.invitations.accept.path, {
                invitationId
            })
        ),
        {
            headers: auth(tokenB)
        }
    )
    const acceptBody = await readBody(acceptRes)
    expect([200, 201]).toContain(acceptRes.status())

    const acceptedRoomId = acceptBody?.data?.room?.roomId
    if (typeof acceptedRoomId !== 'string' || acceptedRoomId.length === 0) {
        throw new Error(
            `[e2e] POST /invitations/:invitationId/accept 응답에 room.roomId가 없습니다: body=${JSON.stringify(acceptBody)}`
        )
    }

    // 두 사용자 모두 accept API가 반환한 roomId를 명시해서 같은 매칭방에 접속한다.
    const [a, b] = await Promise.all([
        connectAndWaitForRoom(tokenA, acceptedRoomId),
        connectAndWaitForRoom(tokenB, acceptedRoomId)
    ])
    socketA = a.socket
    socketB = b.socket
    roomId = a.roomAssigned.roomId
    expect(b.roomAssigned.roomId).toBe(roomId)
})

test.afterAll(async () => {
    socketA?.disconnect()
    socketB?.disconnect()
})

// ─── 1. 연결/인증 ─────────────────────────────────────────────────────────

test.describe('연결/인증', () => {
    test('정상 토큰 → room-assigned/join-room/final-state-response/stage-changed 수신', () => {
        // beforeAll에서 이미 room-assigned까지 수신했으므로, roomId가 채워졌는지만 확인한다
        expect(typeof roomId).toBe('string')
        expect(roomId.length).toBeGreaterThan(0)
    })

    test('토큰 누락 → 연결 거부(disconnect)', async () => {
        const socket = io(`${WS_BASE}/invitation`, {
            auth: {},
            transports: ['websocket'],
            forceNew: true
        })
        try {
            await waitForDisconnect(socket as unknown as AppSocket)
        } finally {
            socket.disconnect()
        }
    })

    test('위조 토큰 → 연결 거부(disconnect)', async () => {
        const socket = io(`${WS_BASE}/invitation`, {
            auth: { token: 'invalid.invalid.invalid' },
            transports: ['websocket'],
            forceNew: true
        })
        try {
            await waitForDisconnect(socket as unknown as AppSocket)
        } finally {
            socket.disconnect()
        }
    })
})

// ─── 2. 양방향 이벤트 / Room lifecycle ───────────────────────────────────
//
// RoomLifecycleService는 현재 stage에서 허용된 이벤트만 처리한다.
// 따라서 E2E도 단순 이벤트 나열이 아니라 아래 순서의 실제 room lifecycle을 따른다.
//
// waiting → date → time → location → location-vote → exclude-menu → menu → restaurant → finish

async function emitAndExpectBroadcast<
    ServerEvent extends keyof ClientToServerEvents,
    ClientEvent extends keyof ServerToClientEvents
>(
    emitter: AppSocket,
    listeners: AppSocket[],
    serverEvent: ServerEvent,
    payload: Parameters<ClientToServerEvents[ServerEvent]>[0],
    clientEvent: ClientEvent
): Promise<Array<Parameters<ServerToClientEvents[ClientEvent]>[0]>> {
    const waiters = listeners.map(s => waitForEvent(s, clientEvent))
    emitter.emit(serverEvent as any, payload as any)
    return Promise.all(waiters)
}

async function readyBothAndExpectStage(
    expectedPhase: string
): Promise<StageChangedResponseDto> {
    const payload: ReadyStateRequestDto = { isReady: true }

    await emitAndExpectBroadcast<'ready-state', 'ready-state-changed'>(
        socketA,
        [socketA, socketB],
        'ready-state',
        payload,
        'ready-state-changed'
    )

    const stageWaiters = [
        waitForEvent(socketA, 'stage-changed'),
        waitForEvent(socketB, 'stage-changed')
    ]

    const [readyA, readyB] = await emitAndExpectBroadcast<
        'ready-state',
        'ready-state-changed'
    >(
        socketB,
        [socketA, socketB],
        'ready-state',
        payload,
        'ready-state-changed'
    )

    expect(readyA).toEqual(readyB)
    expect(readyA.readyCount).toBe(2)
    expect(readyA.participantCount).toBe(2)

    const [stageA, stageB] = await Promise.all(stageWaiters)

    expect(stageA).toEqual(stageB)
    expect(stageA.phase).toBe(expectedPhase)

    return stageA
}

let locationId = ''
let selectedMenuCode: MenuPickRequestDto['menuCode'] | undefined
let selectedRestaurantId: RestaurantPickRequestDto['restaurantId'] | undefined

test.describe('양방향 이벤트 — Room lifecycle 순서 검증', () => {
    test('1) ready-state → stage-changed(date)', async () => {
        await readyBothAndExpectStage('date')
    })

    test('2) chat-message → chat-message', async () => {
        const text = `E2E 소켓 채팅 ${Date.now()}`
        const payload: ChatMessageRequestDto = { message: text }
        const [resA, resB] = await emitAndExpectBroadcast<
            'chat-message',
            'chat-message'
        >(socketA, [socketA, socketB], 'chat-message', payload, 'chat-message')
        const a = resA as ChatMessageResponseItem
        const b = resB as ChatMessageResponseItem
        expect(a.message).toBe(text)
        expect(a.user.memberId).toBe(toMemberId(Number(memberIdA)))
        expect(b).toEqual(a)
    })

    test('3) date 단계: pick-date → date-updated', async () => {
        const payload: DatePicksRequestDto = { dates: ['2099-12-31'] }
        const [resA, resB] = await emitAndExpectBroadcast<
            'pick-date',
            'date-updated'
        >(socketA, [socketA, socketB], 'pick-date', payload, 'date-updated')
        const a = resA as DatePicksUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const mine = a.find(
            item => item.memberId === toMemberId(Number(memberIdA))
        )
        expect(mine?.dates).toEqual(payload.dates)
        expect(resB).toEqual(resA)
    })

    test('4) date 완료 → stage-changed(time)', async () => {
        await readyBothAndExpectStage('time')
    })

    test('5) time 단계: pick-times → time-updated', async () => {
        const payload: TimePicksRequestDto = { times: ['12:00', '13:00'] }
        const [resA, resB] = await emitAndExpectBroadcast<
            'pick-times',
            'time-updated'
        >(socketA, [socketA, socketB], 'pick-times', payload, 'time-updated')
        const a = resA as TimePicksUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const mine = a.find(
            item => item.memberId === toMemberId(Number(memberIdA))
        )
        expect(mine?.times).toEqual(payload.times)
        expect(resB).toEqual(resA)
    })

    test('6) time 완료 → stage-changed(location)', async () => {
        await readyBothAndExpectStage('location')
    })

    test('7) location 단계: add-location-candidate → location-add-updated', async () => {
        locationId = `e2e-loc-${Date.now()}`
        const payload: LocationCandidateAddRequestDto = {
            locationId: LocationIdSchema.parse(locationId),
            placeName: 'E2E 테스트 장소',
            lat: 37.5,
            lng: 127.0,
            address: '서울시 테스트구'
        }
        const [resA, resB] = await emitAndExpectBroadcast<
            'add-location-candidate',
            'location-add-updated'
        >(
            socketA,
            [socketA, socketB],
            'add-location-candidate',
            payload,
            'location-add-updated'
        )
        const a = resA as LocationCandidateAddUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const added = a.find(item => item.locationId === payload.locationId)
        expect(added?.placeName).toBe(payload.placeName)
        expect(added?.authorMemberId).toBe(toMemberId(Number(memberIdA)))
        expect(resB).toEqual(resA)
    })

    test('8) location 완료 → stage-changed(location-vote)', async () => {
        await readyBothAndExpectStage('location-vote')
    })

    test('9) location-vote 단계: vote-location → location-vote-updated', async () => {
        expect(locationId.length).toBeGreaterThan(0)
        const payload: LocationCandidateVoteRequestDto = {
            locationId: LocationIdSchema.parse(locationId)
        }

        const [resA, resB] = await emitAndExpectBroadcast<
            'vote-location',
            'location-vote-updated'
        >(
            socketB,
            [socketA, socketB],
            'vote-location',
            payload,
            'location-vote-updated'
        )
        const a = resA as LocationCandidateVoteUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const voted = a.find(item => item.locationId === payload.locationId)
        expect(voted?.votes).toContain(toMemberId(Number(memberIdB)))
        expect(resB).toEqual(resA)
    })

    test('10) location-vote 완료 → stage-changed(exclude-menu)', async () => {
        await readyBothAndExpectStage('exclude-menu')
    })

    test('11) exclude-menu 단계: exclude-menu → exclude-menu-updated', async () => {
        const payload: ExcludeMenuRequestDto = {
            menu: {
                code: FoodCodeSchema.parse('JAPANESE'),
                label: FoodLabelSchema.parse('일식')
            }
        }
        const [resA, resB] = await emitAndExpectBroadcast<
            'exclude-menu',
            'exclude-menu-updated'
        >(
            socketA,
            [socketA, socketB],
            'exclude-menu',
            payload,
            'exclude-menu-updated'
        )
        const a = resA as ExcludeMenuUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const mine = a.find(
            item => item.memberId === toMemberId(Number(memberIdA))
        )
        expect(mine?.exclusions.some(m => m.code === payload.menu.code)).toBe(
            true
        )
        expect(resB).toEqual(resA)
    })

    test('12) exclude-menu 완료 → stage-changed(menu)', async () => {
        const stage = await readyBothAndExpectStage('menu')
        const initialMenus =
            (stage.data as { initialMenus?: Array<{ code: unknown }> })
                .initialMenus ?? []

        expect(initialMenus.length).toBeGreaterThan(0)
        selectedMenuCode = FoodCodeSchema.parse(initialMenus[0].code)
    })

    test('13) menu 단계: pick-menu → menu-pick-updated', async () => {
        expect(selectedMenuCode).toBeDefined()
        const payload: MenuPickRequestDto = { menuCode: selectedMenuCode! }
        const [resA, resB] = await emitAndExpectBroadcast<
            'pick-menu',
            'menu-pick-updated'
        >(
            socketA,
            [socketA, socketB],
            'pick-menu',
            payload,
            'menu-pick-updated'
        )
        const a = resA as MenuPickUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const picked = a.find(item => item.menuCode === payload.menuCode)
        expect(picked?.selectedMembers).toContain(toMemberId(Number(memberIdA)))
        expect(resB).toEqual(resA)
    })

    test('14) menu 완료 → stage-changed(restaurant)', async () => {
        const stage = await readyBothAndExpectStage('restaurant')
        const initialRestaurants =
            (
                stage.data as {
                    initialRestaurants?: Array<{ restaurantId: unknown }>
                }
            ).initialRestaurants ?? []

        expect(initialRestaurants.length).toBeGreaterThan(0)
        selectedRestaurantId = toRestaurantId(
            String(initialRestaurants[0].restaurantId)
        )
    })

    test('15) restaurant 단계: pick-restaurant → restaurant-pick-updated', async () => {
        expect(selectedRestaurantId).toBeDefined()
        const payload: RestaurantPickRequestDto = {
            restaurantId: selectedRestaurantId!
        }
        const [resA, resB] = await emitAndExpectBroadcast<
            'pick-restaurant',
            'restaurant-pick-updated'
        >(
            socketA,
            [socketA, socketB],
            'pick-restaurant',
            payload,
            'restaurant-pick-updated'
        )
        const a = resA as RestaurantPickUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const picked = a.find(
            item => item.restaurantId === payload.restaurantId
        )
        expect(picked?.selectedMembers).toContain(toMemberId(Number(memberIdA)))
        expect(resB).toEqual(resA)
    })

    test('16) restaurant 완료 → stage-changed(finish)', async () => {
        await readyBothAndExpectStage('finish')
    })
})
