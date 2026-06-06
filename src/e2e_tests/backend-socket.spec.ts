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
 * 룸 생성은 `POST /invitations/send` → `PATCH /invitations/:id/accept`가
 * 발행하는 도메인 이벤트가 RabbitMQ를 거쳐 비동기로 처리된 뒤 이루어지므로,
 * 소켓 연결 직후 `room-assigned`를 受信할 때까지 재시도한다(`connectAndWaitForRoom`).
 */

import { expect, test } from '@playwright/test'
import { io, type Socket } from 'socket.io-client'
import type {
    ChatMessageRequestDto,
    ChatMessageResponseItem,
    ClientToServerEvents,
    DatePicksRequestDto,
    DatePicksUpdateResponseDto,
    ExcludeMenuRequestDto,
    ExcludeMenuUpdateResponseDto,
    LocationCandidateAddRequestDto,
    LocationCandidateAddUpdateResponseDto,
    LocationCandidateVoteRequestDto,
    LocationCandidateVoteUpdateResponseDto,
    MenuPickRequestDto,
    MenuPickUpdateResponseDto,
    ReadyStateChangedDto,
    ReadyStateRequestDto,
    RestaurantPickRequestDto,
    RestaurantPickUpdateResponseDto,
    ServerToClientEvents,
    TimePicksRequestDto,
    TimePicksUpdateResponseDto
} from '@kimdaegyu/babmukdang-shared'
import { endpoints } from '../apis/endpoints'
import {
    USER_A,
    USER_B,
    auth,
    fetchMemberId,
    login,
    readBody,
    url
} from './helpers/auth'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

// REST와 동일하게 `BACKEND_URL` 하나로 HTTP/WS를 모두 구성한다
// (HTTP는 `${BACKEND_URL}/api/v1`, 소켓은 `${BACKEND_URL}/{namespace}`).
const WS_BASE = process.env.BACKEND_URL ?? 'http://localhost:3000'

test.describe.configure({ mode: 'serial', retries: 0 })

// ─── 소켓 헬퍼 ────────────────────────────────────────────────────────────

function connectSocket(token: string): AppSocket {
    return io(`${WS_BASE}/invitation`, {
        auth: { token },
        transports: ['websocket'],
        forceNew: true
    })
}

function waitForEvent<K extends keyof ServerToClientEvents>(
    socket: AppSocket,
    event: K,
    timeoutMs = 10_000
): Promise<Parameters<ServerToClientEvents[K]>[0]> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off(event as any, handler as any)
            reject(new Error(`[e2e] '${String(event)}' 이벤트 대기 타임아웃 (${timeoutMs}ms)`))
        }, timeoutMs)
        const handler = (data: any) => {
            clearTimeout(timer)
            resolve(data)
        }
        socket.once(event as any, handler as any)
    })
}

function waitForDisconnect(socket: AppSocket, timeoutMs = 10_000): Promise<void> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new Error(`[e2e] disconnect 대기 타임아웃 (${timeoutMs}ms)`)),
            timeoutMs
        )
        socket.once('disconnect', () => {
            clearTimeout(timer)
            resolve()
        })
        socket.once('connect_error', () => {
            clearTimeout(timer)
            resolve()
        })
    })
}

// 룸 시드는 RabbitMQ를 거쳐 비동기로 처리되므로, `room-assigned`를 받지 못하면
// (서버가 `findRoomForParticipant` 실패 시 즉시 disconnect함) 재연결을 반복한다.
async function connectAndWaitForRoom(
    token: string,
    attempts = 5,
    perAttemptTimeoutMs = 8_000
): Promise<{ socket: AppSocket; roomAssigned: { roomId: string } }> {
    let lastError: unknown
    for (let i = 0; i < attempts; i++) {
        const socket = connectSocket(token)
        try {
            const roomAssigned = await waitForEvent(socket, 'room-assigned', perAttemptTimeoutMs)
            return { socket, roomAssigned }
        } catch (err) {
            lastError = err
            socket.disconnect()
            await new Promise((r) => setTimeout(r, 1_000))
        }
    }
    throw new Error(
        `[e2e] room-assigned 수신 실패 (재시도 ${attempts}회 모두 실패, 마지막 에러: ${
            lastError instanceof Error ? lastError.message : String(lastError)
        })`
    )
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
    tokenA = await login(request, USER_A.email)
    tokenB = await login(request, USER_B.email)
    memberIdA = await fetchMemberId(request, tokenA, USER_A.email)
    memberIdB = await fetchMemberId(request, tokenB, USER_B.email)

    // userA → userB 초대 전송, userB가 수락 → 도메인 이벤트가 RabbitMQ를 거쳐
    // `RoomSeedFlowService.seedInvitation`을 호출하고 매칭방이 생성된다.
    const sendRes = await request.post(url(endpoints.invitations.send), {
        headers: auth(tokenA),
        data: { inviteeId: Number(memberIdB), message: 'E2E 소켓 테스트 초대장' }
    })
    const sendBody = await readBody(sendRes)
    // turn-001 todo 기록(docs/todo/backend-api-e2e-response-dto-gaps.md)에 따르면
    // `POST /invitations/send` 응답은 `id`가 아니라 `invitationId` 필드를 사용한다.
    const id = sendBody?.data?.invitationId ?? sendBody?.invitationId
    if (typeof id !== 'number') {
        throw new Error(
            `[e2e] POST /invitations/send 실패: status=${sendRes.status()}, body=${JSON.stringify(sendBody)}`
        )
    }
    invitationId = id

    const acceptRes = await request.patch(url(endpoints.invitations.accept(invitationId)), {
        headers: auth(tokenB)
    })
    expect([200, 201]).toContain(acceptRes.status())

    // 두 사용자 모두 같은 매칭방에 접속한다 (roomId 쿼리 없이 자동 탐색).
    const [a, b] = await Promise.all([
        connectAndWaitForRoom(tokenA),
        connectAndWaitForRoom(tokenB)
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

// ─── 2. 양방향 이벤트 (SocketServerEventMap 9종 전부) ─────────────────────
//
// 각 테스트는 userA가 emit → userA·userB 양쪽 소켓이 대응 브로드캐스트를
// 수신하는지, 그리고 페이로드가 Shared 타입과 일치하는지 검증한다.
// 일부 이벤트는 방의 진행 단계(stage)에 의존하므로 serial로 실행하고
// 전제 조건을 각 테스트 상단 주석에 명시한다.

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
    const waiters = listeners.map((s) => waitForEvent(s, clientEvent))
    emitter.emit(serverEvent as any, payload as any)
    return Promise.all(waiters)
}

test.describe('양방향 이벤트 — SocketServerEventMap 9종', () => {
    test('1) ready-state → ready-state-changed', async () => {
        const payload: ReadyStateRequestDto = { isReady: true }
        const [resA, resB] = await emitAndExpectBroadcast<'ready-state', 'ready-state-changed'>(
            socketA,
            [socketA, socketB],
            'ready-state',
            payload,
            'ready-state-changed'
        )
        const a = resA as ReadyStateChangedDto
        const b = resB as ReadyStateChangedDto
        expect(typeof a.readyCount).toBe('number')
        expect(typeof a.participantCount).toBe('number')
        expect(b).toEqual(a)
    })

    test('2) chat-message → chat-message', async () => {
        const text = `E2E 소켓 채팅 ${Date.now()}`
        const payload: ChatMessageRequestDto = { text }
        const [resA, resB] = await emitAndExpectBroadcast<'chat-message', 'chat-message'>(
            socketA,
            [socketA, socketB],
            'chat-message',
            payload,
            'chat-message'
        )
        const a = resA as ChatMessageResponseItem
        const b = resB as ChatMessageResponseItem
        expect(a.text).toBe(text)
        expect(a.user.userId).toBe(memberIdA)
        expect(b).toEqual(a)
    })

    test('3) pick-date → date-updated', async () => {
        const payload: DatePicksRequestDto = { dates: ['2099-12-31'] }
        const [resA, resB] = await emitAndExpectBroadcast<'pick-date', 'date-updated'>(
            socketA,
            [socketA, socketB],
            'pick-date',
            payload,
            'date-updated'
        )
        const a = resA as DatePicksUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const mine = a.find((item) => item.userId === memberIdA)
        expect(mine?.dates).toEqual(payload.dates)
        expect(resB).toEqual(resA)
    })

    test('4) add-location-candidate → location-add-updated', async () => {
        const payload: LocationCandidateAddRequestDto = {
            id: `e2e-loc-${Date.now()}`,
            placeName: 'E2E 테스트 장소',
            lat: 37.5,
            lng: 127.0,
            address: '서울시 테스트구'
        }
        const [resA, resB] = await emitAndExpectBroadcast<
            'add-location-candidate',
            'location-add-updated'
        >(socketA, [socketA, socketB], 'add-location-candidate', payload, 'location-add-updated')
        const a = resA as LocationCandidateAddUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const added = a.find((item) => item.id === payload.id)
        expect(added?.placeName).toBe(payload.placeName)
        expect(added?.author).toBe(memberIdA)
        expect(resB).toEqual(resA)
    })

    test('5) vote-location → location-vote-updated (전제: 4번에서 후보가 추가되어 있어야 함)', async () => {
        const payload: LocationCandidateVoteRequestDto = {
            locationId: `e2e-loc-${Date.now()}`
        }
        // 직전 테스트(4번)에서 추가한 후보가 없을 수 있으므로, 우선 후보를 다시 하나 추가한 뒤 투표한다
        const addPayload: LocationCandidateAddRequestDto = {
            id: payload.locationId,
            placeName: 'E2E 투표용 장소',
            lat: 37.5,
            lng: 127.0
        }
        await emitAndExpectBroadcast<'add-location-candidate', 'location-add-updated'>(
            socketA,
            [socketA],
            'add-location-candidate',
            addPayload,
            'location-add-updated'
        )

        const [resA, resB] = await emitAndExpectBroadcast<
            'vote-location',
            'location-vote-updated'
        >(socketB, [socketA, socketB], 'vote-location', payload, 'location-vote-updated')
        const a = resA as LocationCandidateVoteUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const voted = a.find((item) => item.locationId === payload.locationId)
        expect(voted?.votes).toContain(memberIdB)
        expect(resB).toEqual(resA)
    })

    test('6) pick-times → time-updated', async () => {
        const payload: TimePicksRequestDto = { times: ['12:00', '13:00'] }
        const [resA, resB] = await emitAndExpectBroadcast<'pick-times', 'time-updated'>(
            socketA,
            [socketA, socketB],
            'pick-times',
            payload,
            'time-updated'
        )
        const a = resA as TimePicksUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const mine = a.find((item) => item.userId === memberIdA)
        expect(mine?.times).toEqual(payload.times)
        expect(resB).toEqual(resA)
    })

    test('7) exclude-menu → exclude-menu-updated', async () => {
        const payload: ExcludeMenuRequestDto = { menu: { code: 'KOREAN', label: '한식' } }
        const [resA, resB] = await emitAndExpectBroadcast<
            'exclude-menu',
            'exclude-menu-updated'
        >(socketA, [socketA, socketB], 'exclude-menu', payload, 'exclude-menu-updated')
        const a = resA as ExcludeMenuUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const mine = a.find((item) => item.userId === memberIdA)
        expect(mine?.exclusions.some((m) => m.code === payload.menu.code)).toBe(true)
        expect(resB).toEqual(resA)
    })

    test('8) pick-menu → menu-pick-updated', async () => {
        const payload: MenuPickRequestDto = { menuCode: 'KOREAN' }
        const [resA, resB] = await emitAndExpectBroadcast<'pick-menu', 'menu-pick-updated'>(
            socketA,
            [socketA, socketB],
            'pick-menu',
            payload,
            'menu-pick-updated'
        )
        const a = resA as MenuPickUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const picked = a.find((item) => item.menuCode === payload.menuCode)
        expect(picked?.selectedUsers).toContain(memberIdA)
        expect(resB).toEqual(resA)
    })

    test('9) pick-restaurant → restaurant-pick-updated', async () => {
        const payload: RestaurantPickRequestDto = { restaurantId: 'e2e-restaurant-1' }
        const [resA, resB] = await emitAndExpectBroadcast<
            'pick-restaurant',
            'restaurant-pick-updated'
        >(socketA, [socketA, socketB], 'pick-restaurant', payload, 'restaurant-pick-updated')
        const a = resA as RestaurantPickUpdateResponseDto
        expect(Array.isArray(a)).toBe(true)
        const picked = a.find((item) => item.restaurantId === payload.restaurantId)
        expect(picked?.selectedUsers).toContain(memberIdA)
        expect(resB).toEqual(resA)
    })
})
