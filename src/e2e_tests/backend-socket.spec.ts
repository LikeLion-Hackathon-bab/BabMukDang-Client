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

import { expect, test } from '@playwright/test'
import { io, type Socket } from 'socket.io-client'
import type { z } from 'zod'
import type {
    ChatMessageRequest as ChatMessageRequestDto,
    ChatMessageResponse as ChatMessageResponseItem,
    RoomClientToServerEvents as ClientToServerEvents,
    RoomServerToClientEvents as ServerToClientEvents,
    ReadyStateRequest as ReadyStateRequestDto
} from '@kimdaegyu/babmukdang-shared/domain'
import {
    AddLocationCandidateRequestSchema,
    DatePicksUpdateResponseSchema,
    ExcludeMenuRequestSchema,
    ExcludeMenuUpdateResponseSchema,
    LocationCandidateAddUpdateResponseSchema,
    LocationCandidateVoteUpdateResponseSchema,
    MenuPickUpdateResponseSchema,
    PickDateRequestSchema,
    PickMenuRequestSchema,
    PickRestaurantRequestSchema,
    PickTimesRequestSchema,
    ReadyStateChangedSchema,
    RestaurantPickUpdateResponseSchema,
    TimePicksUpdateResponseSchema,
    VoteLocationRequestSchema,
    FoodCodeSchema,
    FoodLabelSchema,
    LocationIdSchema,
    toMemberId,
    toRestaurantId
} from '@kimdaegyu/babmukdang-shared/domain'

type DatePicksRequestDto = z.infer<typeof PickDateRequestSchema>
type TimePicksRequestDto = z.infer<typeof PickTimesRequestSchema>
type LocationCandidateAddRequestDto = z.infer<typeof AddLocationCandidateRequestSchema>
type LocationCandidateVoteRequestDto = z.infer<typeof VoteLocationRequestSchema>
type ExcludeMenuRequestDto = z.infer<typeof ExcludeMenuRequestSchema>
type MenuPickRequestDto = z.infer<typeof PickMenuRequestSchema>
type RestaurantPickRequestDto = z.infer<typeof PickRestaurantRequestSchema>
type ReadyStateChangedDto = z.infer<typeof ReadyStateChangedSchema>
type DatePicksUpdateResponseDto = z.infer<typeof DatePicksUpdateResponseSchema>
type TimePicksUpdateResponseDto = z.infer<typeof TimePicksUpdateResponseSchema>
type LocationCandidateAddUpdateResponseDto = z.infer<typeof LocationCandidateAddUpdateResponseSchema>
type LocationCandidateVoteUpdateResponseDto = z.infer<typeof LocationCandidateVoteUpdateResponseSchema>
type ExcludeMenuUpdateResponseDto = z.infer<typeof ExcludeMenuUpdateResponseSchema>
type MenuPickUpdateResponseDto = z.infer<typeof MenuPickUpdateResponseSchema>
type RestaurantPickUpdateResponseDto = z.infer<typeof RestaurantPickUpdateResponseSchema>
import { endpoints } from '../apis/endpoints'
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
        data: {
            inviteeId: toMemberId(Number(memberIdB)),
            message: 'E2E 소켓 테스트 초대장'
        }
    })
    console.log(sendRes)
    const sendBody = await readBody(sendRes)
    console.log(sendBody)
    // turn-001 todo 기록(docs/todo/backend-api-e2e-response-dto-gaps.md)에 따르면
    // `POST /invitations/send` 응답은 `id`가 아니라 `invitationId` 필드를 사용한다.
    const id = sendBody?.data ?? sendBody?.invitationId
    if (typeof id !== 'number') {
        throw new Error(
            `[e2e] POST /invitations/send 실패: status=${sendRes.status()}, body=${JSON.stringify(sendBody)}`
        )
    }
    invitationId = id

    const acceptRes = await request.patch(
        url(endpoints.invitations.accept(invitationId)),
        {
            headers: auth(tokenB)
        }
    )
    const acceptBody = await readBody(acceptRes)
    console.log(acceptRes, acceptBody)
    expect([200, 201]).toContain(acceptRes.status())

    const acceptedRoomId = acceptBody?.data?.room?.roomId
    if (typeof acceptedRoomId !== 'string' || acceptedRoomId.length === 0) {
        throw new Error(
            `[e2e] PATCH /invitations/:id/accept 응답에 room.roomId가 없습니다: body=${JSON.stringify(acceptBody)}`
        )
    }

    // 두 사용자 모두 accept API가 반환한 roomId를 명시해서 같은 매칭방에 접속한다.
    const [a, b] = await Promise.all([
        connectAndWaitForRoom(tokenA, acceptedRoomId),
        connectAndWaitForRoom(tokenB, acceptedRoomId)
    ])
    console.log('접속 완료', a, b)
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

async function readyBothAndExpectStage(expectedPhase: string): Promise<void> {
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
}

let locationId = ''

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
        const mine = a.find(item => item.memberId === toMemberId(Number(memberIdA)))
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
        const mine = a.find(item => item.memberId === toMemberId(Number(memberIdA)))
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
        const payload: LocationCandidateVoteRequestDto = { locationId: LocationIdSchema.parse(locationId) }

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
            menu: { code: FoodCodeSchema.parse('KOREAN'), label: FoodLabelSchema.parse('한식') }
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
        const mine = a.find(item => item.memberId === toMemberId(Number(memberIdA)))
        expect(mine?.exclusions.some(m => m.code === payload.menu.code)).toBe(
            true
        )
        expect(resB).toEqual(resA)
    })

    test('12) exclude-menu 완료 → stage-changed(menu)', async () => {
        await readyBothAndExpectStage('menu')
    })

    test('13) menu 단계: pick-menu → menu-pick-updated', async () => {
        const payload: MenuPickRequestDto = { menuCode: FoodCodeSchema.parse('KOREAN') }
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
        await readyBothAndExpectStage('restaurant')
    })

    test('15) restaurant 단계: pick-restaurant → restaurant-pick-updated', async () => {
        const payload: RestaurantPickRequestDto = {
            restaurantId: toRestaurantId('e2e-restaurant-1')
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
