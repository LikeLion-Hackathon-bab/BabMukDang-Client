/**
 * TaskGraph 기반 Room WebSocket E2E 테스트.
 *
 * 기존 선형 lifecycle(waiting → date → time → ...) 검증 대신, 선택 command가 즉시
 * room state를 갱신하고 서버가 progress/decision/candidate 이벤트를 broadcast하는지 확인한다.
 */

import { expect, test, type APIRequestContext } from '@playwright/test'
import { io } from 'socket.io-client'
import type {
    ChatMessageRequest,
    ChatMessageResponse,
    DatePicksUpdateResponse,
    ExcludeMenuUpdateResponse,
    LocationCandidateAddUpdateResponse,
    LocationCandidateVoteUpdateResponse,
    Menu,
    MenuCandidatesUpdate,
    MenuPickUpdateResponse,
    PreferMenuUpdateResponse,
    ReadyStateChanged,
    ReadyStateRequest,
    RestaurantPickUpdateResponse,
    RoomClientToServerEvents as ClientToServerEvents,
    RoomProgress,
    RoomServerToClientEvents as ServerToClientEvents,
    TimePicksUpdateResponse
} from '@kimdaegyu/babmukdang-shared/domain/room'
import {
    DateStringSchema,
    LatitudeSchema,
    LocationIdSchema,
    LongitudeSchema,
    MenuCandidateIdSchema,
    TimeStringSchema
} from '@kimdaegyu/babmukdang-shared/domain/room'
import {
    FoodCodeSchema,
    FoodLabelSchema,
    apiContract,
    toMemberId
} from '@kimdaegyu/babmukdang-shared/domain'

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

let tokenA = ''
let tokenB = ''
let memberIdA = ''
let memberIdB = ''
let socketA: AppSocket
let socketB: AppSocket
let roomId = ''
let locationId = ''
let selectedMenuCandidateId: MenuPickUpdateResponse[number]['menuCandidateId'] | undefined
let selectedRestaurantId: RestaurantPickUpdateResponse[number]['restaurantId'] | undefined

test.beforeAll(async ({ request }) => {
    test.setTimeout(120_000)
    tokenA = await login(request, USER_A.email, USER_A.username)
    tokenB = await login(request, USER_B.email, USER_B.username)
    memberIdA = await fetchMemberId(request, tokenA, USER_A.email)
    memberIdB = await fetchMemberId(request, tokenB, USER_B.email)
    await seedRecentMeal(request, tokenA)

    const sendRes = await request.post(url(apiContract.invitations.send.path), {
        headers: auth(tokenA),
        data: {
            inviteeId: toMemberId(Number(memberIdB)),
            message: 'E2E TaskGraph 소켓 테스트 초대장'
        }
    })
    const sendBody = await readBody(sendRes)
    const invitationId = sendBody?.data?.invitationId ?? sendBody?.invitationId
    if (typeof invitationId !== 'number') {
        throw new Error(
            `[e2e] POST /invitations/send 실패: status=${sendRes.status()}, body=${JSON.stringify(sendBody)}`
        )
    }

    const acceptRes = await request.post(
        url(resolvePath(apiContract.invitations.accept.path, { invitationId })),
        { headers: auth(tokenB) }
    )
    const acceptBody = await readBody(acceptRes)
    expect([200, 201]).toContain(acceptRes.status())

    const acceptedRoomId = acceptBody?.data?.room?.roomId
    if (typeof acceptedRoomId !== 'string' || acceptedRoomId.length === 0) {
        throw new Error(
            `[e2e] accept 응답에 room.roomId가 없습니다: body=${JSON.stringify(acceptBody)}`
        )
    }

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

async function emitAndExpectBroadcast<
    ClientEvent extends keyof ClientToServerEvents,
    ServerEvent extends keyof ServerToClientEvents
>(
    emitter: AppSocket,
    listeners: AppSocket[],
    clientEvent: ClientEvent,
    payload: Parameters<ClientToServerEvents[ClientEvent]>[0],
    serverEvent: ServerEvent
): Promise<Array<Parameters<ServerToClientEvents[ServerEvent]>[0]>> {
    const waiters = listeners.map(socket => waitForEvent(socket, serverEvent))
    emitter.emit(clientEvent as any, payload as any)
    return Promise.all(waiters)
}

async function expectProgressAfter(action: () => void | Promise<void>) {
    const waiters = [
        waitForEvent(socketA, 'room-progress-updated'),
        waitForEvent(socketB, 'room-progress-updated')
    ]
    await action()
    const [progressA, progressB] = await Promise.all(waiters)
    expect(progressB).toEqual(progressA)
    return progressA as RoomProgress
}

test.describe('연결/인증', () => {
    test('정상 토큰 → room-assigned 수신', () => {
        expect(roomId.length).toBeGreaterThan(0)
    })

    test('토큰 누락 → 연결 거부', async () => {
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
})

test.describe('TaskGraph room socket flow', () => {
    test('chat-message는 stage와 무관하게 broadcast된다', async () => {
        const payload: ChatMessageRequest = {
            message: `TaskGraph 채팅 ${Date.now()}`
        }
        const [resA, resB] = await emitAndExpectBroadcast(
            socketA,
            [socketA, socketB],
            'chat-message',
            payload,
            'chat-message'
        )
        const message = resA as ChatMessageResponse
        expect(message.message).toBe(payload.message)
        expect(message.user.memberId).toBe(toMemberId(Number(memberIdA)))
        expect(resB).toEqual(resA)
    })

    test('date/time 선택은 progress를 갱신하지만 stage 전환을 요구하지 않는다', async () => {
        const datePayload = {
            dates: [DateStringSchema.parse('2099-12-31')]
        }
        const [dateA] = await emitAndExpectBroadcast(
            socketA,
            [socketA, socketB],
            'pick-date',
            datePayload,
            'date-updated'
        )
        expect((dateA as DatePicksUpdateResponse).some(item => item.memberId === toMemberId(Number(memberIdA)))).toBe(true)

        const progress = await expectProgressAfter(() => {
            socketA.emit('pick-times', {
                times: [TimeStringSchema.parse('12:00')]
            })
        })
        expect(progress.phase).toBe('active')
        expect(progress.tasks.some(task => task.key === 'schedule-time')).toBe(true)
    })

    test('장소 후보 추가와 장소 투표는 동시에 진행되고 decision 후보를 만든다', async () => {
        locationId = `e2e-loc-${Date.now()}`
        const addPayload = {
            locationId: LocationIdSchema.parse(locationId),
            placeName: 'E2E 테스트 장소',
            lat: LatitudeSchema.parse(37.5),
            lng: LongitudeSchema.parse(127),
            address: '서울시 테스트구',
            source: 'manual' as const
        }
        const [locations] = await emitAndExpectBroadcast(
            socketA,
            [socketA, socketB],
            'add-location-candidate',
            addPayload,
            'location-add-updated'
        )
        expect((locations as LocationCandidateAddUpdateResponse).some(item => item.locationId === addPayload.locationId)).toBe(true)

        const decisionWaiters = [
            waitForEvent(socketA, 'decision-candidate-updated'),
            waitForEvent(socketB, 'decision-candidate-updated')
        ]
        const [votes] = await emitAndExpectBroadcast(
            socketB,
            [socketA, socketB],
            'vote-location',
            { locationId: addPayload.locationId },
            'location-vote-updated'
        )
        expect((votes as LocationCandidateVoteUpdateResponse).some(item => item.locationId === addPayload.locationId)).toBe(true)
        const [decisionA, decisionB] = await Promise.all(decisionWaiters)
        expect(decisionB).toEqual(decisionA)
        expect(decisionA.snapshots.some(snapshot => snapshot.field === 'location')).toBe(true)
    })

    test('exclude/prefer menu는 메뉴 후보를 갱신하고 menu pick은 후보 id를 사용한다', async () => {
        const preferPayload = {
            menu: {
                code: FoodCodeSchema.parse('SUSHI'),
                label: FoodLabelSchema.parse('초밥')
            } as Menu
        }
        const [preferred] = await emitAndExpectBroadcast(
            socketA,
            [socketA, socketB],
            'prefer-menu',
            preferPayload,
            'prefer-menu-updated'
        )
        expect((preferred as PreferMenuUpdateResponse).some(item => item.memberId === toMemberId(Number(memberIdA)))).toBe(true)

        const menuCandidateWaiters = [
            waitForEvent(socketA, 'menu-candidates-updated'),
            waitForEvent(socketB, 'menu-candidates-updated')
        ]
        await emitAndExpectBroadcast(
            socketB,
            [socketA, socketB],
            'exclude-menu',
            {
                menu: {
                    code: FoodCodeSchema.parse('JAPANESE'),
                    label: FoodLabelSchema.parse('일식')
                } as Menu
            },
            'exclude-menu-updated'
        )
        const [menuCandidates] = await Promise.all(menuCandidateWaiters)
        const candidates = (menuCandidates as MenuCandidatesUpdate).candidates
        expect(candidates.length).toBeGreaterThan(0)
        selectedMenuCandidateId = MenuCandidateIdSchema.parse(String(candidates[0].id))

        const [menuPick] = await emitAndExpectBroadcast(
            socketA,
            [socketA, socketB],
            'pick-menu',
            { menuCandidateId: selectedMenuCandidateId },
            'menu-pick-updated'
        )
        expect((menuPick as MenuPickUpdateResponse).some(item => item.menuCandidateId === selectedMenuCandidateId)).toBe(true)
    })

    test('ready-state는 taskKey별 confidence signal로 동작한다', async () => {
        const payload: ReadyStateRequest = {
            taskKey: 'menu-pick',
            isReady: true
        }
        const [readyA, readyB] = await emitAndExpectBroadcast(
            socketA,
            [socketA, socketB],
            'ready-state',
            payload,
            'ready-state-changed'
        )
        const ready = readyA as ReadyStateChanged
        expect(readyB).toEqual(readyA)
        expect(ready.taskKey).toBe('menu-pick')
        expect(ready.readyCount).toBeGreaterThan(0)
        expect(ready.participantCount).toBe(2)
    })
})
