import { test, expect, type APIRequestContext } from '@playwright/test'
import { io, type Socket } from 'socket.io-client'
import type {
    CreateMealPlanRequest,
    CreateMealPlanResponse,
    FriendRequestItemResponse,
    LoginRequest,
    MealPlanDecisionProgress,
    MealPlanResponse,
    SendMealPlanInviteResponse,
    SignupRequest,
    SignupResponse,
    TokenResponse
} from '@kimdaegyu/babmukdang-shared/domain'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'
const SOCKET_TIMEOUT_MS = 5_000

async function apiSuccessData<T>(response: { json: () => Promise<unknown> }) {
    const body = (await response.json()) as { data?: T }
    return body.data as T
}

async function createSession(request: APIRequestContext, label: string) {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const password = 'e2e-password'
    const signupBody: SignupRequest = {
        email: `${label}-${suffix}@e2e.local`,
        username: `${label}E2E`,
        password
    }
    const signup = await request.post(`${BACKEND_URL}/api/v1/auth/signup`, {
        data: signupBody
    })
    expect(signup.status()).toBe(201)
    const signedUp = await apiSuccessData<SignupResponse>(signup)
    const memberId = Number(signedUp.member.memberId)

    const loginBody: LoginRequest = { email: signupBody.email, password }
    const login = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
        data: loginBody
    })
    expect(login.status()).toBe(201)
    const token = await apiSuccessData<TokenResponse>(login)
    return { ...signupBody, memberId, accessToken: token.accessToken }
}

async function createMealPlan(request: APIRequestContext, accessToken: string) {
    const body: CreateMealPlanRequest = {
        title: 'Socket full-stack E2E 밥약',
        channels: ['OWNER_ONLY'],
        recommendationContext: {
            mealDate: '2026-06-19',
            mealTime: '12:30',
            preferredMenuCategories: ['한식'],
            excludedMenuCategories: [],
            candidateMenuCategories: ['국밥', '비빔밥']
        }
    }
    const response = await request.post(`${BACKEND_URL}/api/v1/meal-plans`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: body
    })
    expect(response.status()).toBe(201)
    return apiSuccessData<CreateMealPlanResponse>(response)
}

async function createSharedMealPlan(
    request: APIRequestContext,
    accessToken: string
) {
    const body: CreateMealPlanRequest = {
        title: 'Socket full-stack E2E 공유 밥약',
        channels: ['OWNER_ONLY', 'FRIEND_INVITE'],
        recommendationContext: {
            mealDate: '2026-06-19',
            mealTime: '12:30',
            preferredMenuCategories: ['한식'],
            excludedMenuCategories: [],
            candidateMenuCategories: ['국밥', '비빔밥']
        }
    }
    const response = await request.post(`${BACKEND_URL}/api/v1/meal-plans`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: body
    })
    expect(response.status()).toBe(201)
    return apiSuccessData<CreateMealPlanResponse>(response)
}

async function createFriendship(
    request: APIRequestContext,
    requesterAccessToken: string,
    recipientAccessToken: string,
    recipientMemberId: number,
    requesterMemberId: number
) {
    const sent = await request.post(
        `${BACKEND_URL}/api/v1/friends/requests/${recipientMemberId}`,
        { headers: { Authorization: `Bearer ${requesterAccessToken}` } }
    )
    expect(sent.status()).toBe(204)

    const incomingResponse = await request.get(
        `${BACKEND_URL}/api/v1/friends/requests/incoming`,
        { headers: { Authorization: `Bearer ${recipientAccessToken}` } }
    )
    expect(incomingResponse.status()).toBe(200)
    const incoming =
        await apiSuccessData<FriendRequestItemResponse[]>(incomingResponse)
    const friendRequest = incoming.find(
        item => Number(item.requester.memberId) === requesterMemberId
    )
    expect(friendRequest).toBeDefined()

    const accepted = await request.post(
        `${BACKEND_URL}/api/v1/friends/requests/${friendRequest!.requestId}/accept`,
        { headers: { Authorization: `Bearer ${recipientAccessToken}` } }
    )
    expect(accepted.status()).toBe(204)
}

async function inviteAndAcceptMealPlan(
    request: APIRequestContext,
    ownerAccessToken: string,
    participantAccessToken: string,
    participantMemberId: number,
    mealPlanId: string
) {
    const inviteResponse = await request.post(
        `${BACKEND_URL}/api/v1/meal-plans/${mealPlanId}/invites`,
        {
            headers: { Authorization: `Bearer ${ownerAccessToken}` },
            data: {
                inviteeId: participantMemberId,
                message: 'Socket CX E2E 초대입니다.'
            }
        }
    )
    expect(inviteResponse.status()).toBe(201)
    const invite =
        await apiSuccessData<SendMealPlanInviteResponse>(inviteResponse)

    const accepted = await request.post(
        `${BACKEND_URL}/api/v1/meal-plans/invites/${invite.inviteId}/accept`,
        { headers: { Authorization: `Bearer ${participantAccessToken}` } }
    )
    expect(accepted.status()).toBe(201)
}

async function getMealPlanDetail(
    request: APIRequestContext,
    accessToken: string,
    mealPlanId: string
) {
    const response = await request.get(
        `${BACKEND_URL}/api/v1/meal-plans/${mealPlanId}`,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    )
    expect(response.status()).toBe(200)
    return apiSuccessData<MealPlanResponse>(response)
}

async function getDecisionProgress(
    request: APIRequestContext,
    accessToken: string,
    mealPlanId: string
) {
    const response = await request.get(
        `${BACKEND_URL}/api/v1/meal-plans/${mealPlanId}/decision-progress`,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    )
    expect(response.status()).toBe(200)
    return apiSuccessData<MealPlanDecisionProgress>(response)
}

function once<T>(socket: Socket, eventName: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            socket.off(eventName, onEvent)
            reject(new Error(`Timed out waiting for ${eventName}`))
        }, SOCKET_TIMEOUT_MS)
        const onEvent = (payload: T) => {
            clearTimeout(timeout)
            resolve(payload)
        }
        socket.once(eventName, onEvent)
    })
}

async function connectMealPlanSocket(accessToken: string): Promise<Socket> {
    const socket = io(`${BACKEND_URL}/meal-plans`, {
        transports: ['websocket'],
        auth: { token: `Bearer ${accessToken}` },
        reconnection: false,
        timeout: SOCKET_TIMEOUT_MS
    })
    await once(socket, 'connect')
    return socket
}

test.describe('MealPlan socket full-stack E2E', () => {
    test.skip(
        process.env.FULLSTACK_E2E !== 'true',
        '실제 Backend/DB/Socket.IO stack에서만 실행한다.'
    )

    test('P0-E2E-007A 참여자는 room join 후 채팅 broadcast를 받는다', async ({
        request
    }) => {
        const alice = await createSession(request, 'socket-alice')
        const { mealPlanId } = await createMealPlan(request, alice.accessToken)
        const socket = await connectMealPlanSocket(alice.accessToken)
        try {
            socket.emit('mealPlan:join', { mealPlanId })
            await new Promise(resolve => setTimeout(resolve, 50))

            const messagePromise = once<{ message: string }>(
                socket,
                'mealPlan:chat:message'
            )
            socket.emit('mealPlan:chat:send', {
                mealPlanId,
                message: '소켓 E2E 채팅입니다.'
            })
            await expect(messagePromise).resolves.toEqual(
                expect.objectContaining({ message: '소켓 E2E 채팅입니다.' })
            )
        } finally {
            socket.disconnect()
        }
    })

    test('P0-E2E-007B 참여자가 아닌 사용자의 room join은 error 이벤트로 거절된다', async ({
        request
    }) => {
        const alice = await createSession(request, 'socket-owner')
        const charlie = await createSession(request, 'socket-stranger')
        const { mealPlanId } = await createMealPlan(request, alice.accessToken)
        const socket = await connectMealPlanSocket(charlie.accessToken)
        try {
            const errorPromise = once<{ code: string }>(
                socket,
                'mealPlan:error'
            )
            socket.emit('mealPlan:join', { mealPlanId })
            await expect(errorPromise).resolves.toEqual(
                expect.objectContaining({ code: 'MEAL_PLAN_JOIN_FAILED' })
            )
        } finally {
            socket.disconnect()
        }
    })

    test('P0-E2E-007C vote와 taskReady가 decision update 이벤트를 broadcast한다', async ({
        request
    }) => {
        const alice = await createSession(request, 'socket-decision')
        const { mealPlanId } = await createMealPlan(request, alice.accessToken)
        const detail = await getMealPlanDetail(
            request,
            alice.accessToken,
            mealPlanId
        )
        const menuStage = detail.decisionStages.find(
            stage => stage.stageType === 'MENU'
        )
        expect(menuStage).toBeDefined()
        expect(menuStage!.candidates.length).toBeGreaterThan(0)
        const menuCandidate = menuStage!.candidates[0]

        const socket = await connectMealPlanSocket(alice.accessToken)
        try {
            socket.emit('mealPlan:join', { mealPlanId })
            await new Promise(resolve => setTimeout(resolve, 50))

            const decisionPromise = once<{ mealPlanId: string }>(
                socket,
                'mealPlan:decision:updated'
            )
            socket.emit('mealPlan:decision:vote', {
                mealPlanId,
                stageId: menuStage!.stageId,
                voteType: 'PICK',
                candidate: menuCandidate
            })
            await expect(decisionPromise).resolves.toEqual(
                expect.objectContaining({ mealPlanId })
            )

            const progressPromise = once<{ mealPlanId: string }>(
                socket,
                'mealPlan:decision:progressUpdated'
            )
            socket.emit('mealPlan:decision:taskReady', {
                mealPlanId,
                taskKey: 'MENU_PICK',
                isReady: true
            })
            await expect(progressPromise).resolves.toEqual(
                expect.objectContaining({ mealPlanId })
            )
        } finally {
            socket.disconnect()
        }
    })

    test('CX-E2E-001 같은 사용자의 두 socket 세션이 같은 room 이벤트를 받는다', async ({
        request
    }) => {
        const alice = await createSession(request, 'socket-multitab')
        const { mealPlanId } = await createMealPlan(request, alice.accessToken)
        const firstSocket = await connectMealPlanSocket(alice.accessToken)
        const secondSocket = await connectMealPlanSocket(alice.accessToken)
        try {
            firstSocket.emit('mealPlan:join', { mealPlanId })
            secondSocket.emit('mealPlan:join', { mealPlanId })
            await new Promise(resolve => setTimeout(resolve, 50))

            const secondMessagePromise = once<{ message: string }>(
                secondSocket,
                'mealPlan:chat:message'
            )
            firstSocket.emit('mealPlan:chat:send', {
                mealPlanId,
                message: '멀티 탭 동기화 확인입니다.'
            })
            await expect(secondMessagePromise).resolves.toEqual(
                expect.objectContaining({
                    message: '멀티 탭 동기화 확인입니다.'
                })
            )
        } finally {
            firstSocket.disconnect()
            secondSocket.disconnect()
        }
    })

    test('CX-E2E-002 socket 재연결 후 room에 다시 join하면 이벤트를 받을 수 있다', async ({
        request
    }) => {
        const alice = await createSession(request, 'socket-reconnect')
        const { mealPlanId } = await createMealPlan(request, alice.accessToken)
        const firstSocket = await connectMealPlanSocket(alice.accessToken)
        firstSocket.emit('mealPlan:join', { mealPlanId })
        await new Promise(resolve => setTimeout(resolve, 50))
        firstSocket.disconnect()

        const reconnectedSocket = await connectMealPlanSocket(alice.accessToken)
        try {
            reconnectedSocket.emit('mealPlan:join', { mealPlanId })
            await new Promise(resolve => setTimeout(resolve, 50))

            const messagePromise = once<{ message: string }>(
                reconnectedSocket,
                'mealPlan:chat:message'
            )
            reconnectedSocket.emit('mealPlan:chat:send', {
                mealPlanId,
                message: '재연결 후 채팅입니다.'
            })
            await expect(messagePromise).resolves.toEqual(
                expect.objectContaining({ message: '재연결 후 채팅입니다.' })
            )
        } finally {
            reconnectedSocket.disconnect()
        }
    })

    test('CX-E2E-003 두 참여자가 동시에 vote하면 두 socket 모두 decision update를 받는다', async ({
        request
    }) => {
        const alice = await createSession(request, 'socket-race-owner')
        const bob = await createSession(request, 'socket-race-friend')
        await createFriendship(
            request,
            alice.accessToken,
            bob.accessToken,
            bob.memberId,
            alice.memberId
        )
        const { mealPlanId } = await createSharedMealPlan(
            request,
            alice.accessToken
        )
        await inviteAndAcceptMealPlan(
            request,
            alice.accessToken,
            bob.accessToken,
            bob.memberId,
            mealPlanId
        )
        const detail = await getMealPlanDetail(
            request,
            alice.accessToken,
            mealPlanId
        )
        const menuStage = detail.decisionStages.find(
            stage => stage.stageType === 'MENU'
        )
        expect(menuStage).toBeDefined()
        const firstCandidate = menuStage!.candidates[0]
        const secondCandidate = menuStage!.candidates[1] ?? firstCandidate

        const ownerSocket = await connectMealPlanSocket(alice.accessToken)
        const friendSocket = await connectMealPlanSocket(bob.accessToken)
        try {
            ownerSocket.emit('mealPlan:join', { mealPlanId })
            friendSocket.emit('mealPlan:join', { mealPlanId })
            await new Promise(resolve => setTimeout(resolve, 50))

            const ownerUpdate = once<{ mealPlanId: string }>(
                ownerSocket,
                'mealPlan:decision:updated'
            )
            const friendUpdate = once<{ mealPlanId: string }>(
                friendSocket,
                'mealPlan:decision:updated'
            )
            ownerSocket.emit('mealPlan:decision:vote', {
                mealPlanId,
                stageId: menuStage!.stageId,
                voteType: 'PICK',
                candidate: firstCandidate
            })
            friendSocket.emit('mealPlan:decision:vote', {
                mealPlanId,
                stageId: menuStage!.stageId,
                voteType: 'PICK',
                candidate: secondCandidate
            })

            await expect(ownerUpdate).resolves.toEqual(
                expect.objectContaining({ mealPlanId })
            )
            await expect(friendUpdate).resolves.toEqual(
                expect.objectContaining({ mealPlanId })
            )
        } finally {
            ownerSocket.disconnect()
            friendSocket.disconnect()
        }
    })

    test('CX-E2E-004 같은 taskReady가 중복 emit돼도 progress readyCount는 참여자 단위로 유지된다', async ({
        request
    }) => {
        const alice = await createSession(request, 'socket-ready-idempotent')
        const { mealPlanId } = await createMealPlan(request, alice.accessToken)
        const socket = await connectMealPlanSocket(alice.accessToken)
        try {
            socket.emit('mealPlan:join', { mealPlanId })
            await new Promise(resolve => setTimeout(resolve, 50))

            const progressUpdate = once<{ mealPlanId: string }>(
                socket,
                'mealPlan:decision:progressUpdated'
            )
            socket.emit('mealPlan:decision:taskReady', {
                mealPlanId,
                taskKey: 'MENU_PICK',
                isReady: true
            })
            socket.emit('mealPlan:decision:taskReady', {
                mealPlanId,
                taskKey: 'MENU_PICK',
                isReady: true
            })

            await expect(progressUpdate).resolves.toEqual(
                expect.objectContaining({ mealPlanId })
            )

            const progress = await getDecisionProgress(
                request,
                alice.accessToken,
                mealPlanId
            )
            const menuPick = progress.tasks.find(
                task => task.taskKey === 'MENU_PICK'
            )
            expect(menuPick).toEqual(
                expect.objectContaining({
                    participantCount: 1,
                    readyCount: 1
                })
            )
        } finally {
            socket.disconnect()
        }
    })
})
