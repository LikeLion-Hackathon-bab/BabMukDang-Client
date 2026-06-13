/**
 * @fileoverview 통합 E2E 공용 인증 헬퍼
 *
 * `backend-api.spec.ts`와 `backend-socket.spec.ts`가 공통으로 사용하는
 * 테스트 계정 발급(login) · memberId 조회 · 응답 검증 유틸을 모아둔다.
 * REST 호출 경로는 `endpoints`(`@/apis/endpoints`)를 통해서만 참조한다.
 */

import type { APIRequestContext } from '@playwright/test'
import { expect } from '@playwright/test'
import { endpoints } from '../../mocks/handlers/endpoints'
import { io, type Socket } from 'socket.io-client'
import {
    RoomClientToServerEvents as ClientToServerEvents,
    RoomServerToClientEvents as ServerToClientEvents
} from '@kimdaegyu/babmukdang-shared/domain'

export const BASE =
    (process.env.BACKEND_URL ?? 'http://localhost:3000') + '/api/v1'

export function url(path: string): string {
    return `${BASE}${path}`
}

export function auth(token: string) {
    return { Authorization: `Bearer ${token}` }
}

// 응답 바디를 안전하게 읽는다 (JSON 우선, 실패 시 텍스트). 실패 진단용으로만 사용한다.
export async function readBody(res: {
    json: () => Promise<any>
    text: () => Promise<string>
}) {
    try {
        return await res.json()
    } catch {
        return await res.text().catch(() => '<empty body>')
    }
}

// 상태 코드가 기대값에 없으면, 어떤 호출에서 어떤 응답 바디(NestJS 에러 메시지 등)가
// 왔는지 콘솔에 남기고 실패시킨다. status만 보고는 원인을 알 수 없는 문제를 진단하기 위함.
export async function assertStatus(
    res: {
        status: () => number
        json: () => Promise<any>
        text: () => Promise<string>
    },
    allowed: number[],
    context: string
) {
    const status = res.status()
    if (!allowed.includes(status)) {
        const body = await readBody(res)
        console.error(
            `[e2e] ${context} 실패: status=${status}, body=${JSON.stringify(body)}`
        )
    }
    expect(allowed).toContain(status)
}

export async function signup(
    request: APIRequestContext,
    email: string,
    username: string
): Promise<void> {
    const res = await request.post(url(endpoints.auth.signup), {
        data: { email, username }
    })
    // 이미 존재하는 계정은 409를 허용한다
    await assertStatus(res, [200, 201, 409], `POST /auth/signup (${email})`)
}

export async function login(
    request: APIRequestContext,
    email: string,
    username: string
): Promise<string> {
    const res = await request.post(url(endpoints.auth.login), {
        data: { email }
    })
    if (!res.ok()) {
        await signup(request, email, username)
        console.error(
            `[e2e] POST /auth/login (${email}) 실패: status=${res.status()}, body=${JSON.stringify(
                await readBody(res)
            )}`
        )
        return await login(request, email, username)
    }
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const token: string =
        body.data?.accessToken ?? body.accessToken ?? body.data ?? body
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)
    return token
}

// /members/me에서 memberId를 추출한다. 응답에 memberId가 없으면(=signup/login이
// 실제로는 실패해 토큰이 유효하지 않거나 계정이 만들어지지 않은 상태) '1'/'2' 같은
// 하드코딩 값으로 조용히 fallback하지 않고, 실제 응답 바디를 포함해 즉시 실패시킨다.
// 이렇게 해야 "memberId 2가 없다"는 표면 증상이 아니라 그 원인(가입/로그인 실패 등)이 보인다.
export async function fetchMemberId(
    request: APIRequestContext,
    token: string,
    email: string
): Promise<string> {
    const res = await request.get(url(endpoints.members.me), {
        headers: auth(token)
    })
    const body = await readBody(res)
    const id =
        body?.data?.memberId ??
        body?.data?.member?.memberId ??
        body?.data?.member?.userId ??
        body?.data?.userId ??
        body?.memberId ??
        body?.userId

    if (typeof id !== 'number' && typeof id !== 'string') {
        throw new Error(
            `[e2e] GET /members/me (${email}) 에서 memberId를 찾을 수 없음: ` +
                `status=${res.status()}, body=${JSON.stringify(body)}`
        )
    }
    return String(id)
}

export const USER_A = {
    email: `e2e-user-a@babmukdang.test`,
    username: 'E2E유저A'
}
export const USER_B = {
    email: `e2e-user-b@babmukdang.test`,
    username: 'E2E유저B'
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

// REST와 동일하게 `BACKEND_URL` 하나로 HTTP/WS를 모두 구성한다
// (HTTP는 `${BACKEND_URL}/api/v1`, 소켓은 `${BACKEND_URL}/{namespace}`).
export const WS_BASE = process.env.BACKEND_URL ?? 'http://localhost:3000'

// ─── 소켓 헬퍼 ────────────────────────────────────────────────────────────

export function connectSocket(token: string, roomId?: string): AppSocket {
    return io(`${WS_BASE}/invitation`, {
        auth: { token },
        query: roomId ? { roomId } : undefined,
        transports: ['websocket'],
        forceNew: true
    })
}

export function waitForEvent<K extends keyof ServerToClientEvents>(
    socket: AppSocket,
    event: K,
    timeoutMs = 10_000
): Promise<Parameters<ServerToClientEvents[K]>[0]> {
    return new Promise((resolve, reject) => {
        const cleanup = () => {
            clearTimeout(timer)
            socket.off(event as any, handler as any)
            socket.off('exception' as any, onException as any)
            socket.off('disconnect', onDisconnect)
            socket.off('connect_error', onConnectError)
        }

        const timer = setTimeout(() => {
            cleanup()
            reject(
                new Error(
                    `[e2e] '${String(event)}' 이벤트 대기 타임아웃 (${timeoutMs}ms), connected=${socket.connected}, socketId=${socket.id ?? 'none'}`
                )
            )
        }, timeoutMs)

        const handler = (data: any) => {
            cleanup()
            resolve(data)
        }

        const onException = (error: any) => {
            cleanup()
            reject(
                new Error(
                    `[e2e] '${String(event)}' 대기 중 서버 WebSocket exception 수신: ${JSON.stringify(error)}`
                )
            )
        }

        const onDisconnect = (reason: string) => {
            cleanup()
            reject(
                new Error(
                    `[e2e] '${String(event)}' 대기 중 disconnect: ${reason}`
                )
            )
        }

        const onConnectError = (error: Error) => {
            cleanup()
            reject(
                new Error(
                    `[e2e] '${String(event)}' 대기 중 connect_error: ${error.message}`
                )
            )
        }

        socket.once(event as any, handler as any)
        socket.once('exception' as any, onException as any)
        socket.once('disconnect', onDisconnect)
        socket.once('connect_error', onConnectError)
    })
}

export function waitForDisconnect(
    socket: AppSocket,
    timeoutMs = 10_000
): Promise<void> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () =>
                reject(
                    new Error(`[e2e] disconnect 대기 타임아웃 (${timeoutMs}ms)`)
                ),
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

// accept API가 반환한 roomId를 명시해 접속한다. room-assigned를 받지 못하면
// 테스트 환경의 일시적인 소켓 접속 지연을 고려해 짧게 재시도한다.
export async function connectAndWaitForRoom(
    token: string,
    roomId: string,
    attempts = 5,
    perAttemptTimeoutMs = 8_000
): Promise<{ socket: AppSocket; roomAssigned: { roomId: string } }> {
    let lastError: unknown
    for (let i = 0; i < attempts; i++) {
        const socket = connectSocket(token, roomId)
        try {
            const roomAssigned = await waitForEvent(
                socket,
                'room-assigned',
                perAttemptTimeoutMs
            )
            return { socket, roomAssigned }
        } catch (err) {
            lastError = err
            socket.disconnect()
            await new Promise(r => setTimeout(r, 1_000))
        }
    }
    throw new Error(
        `[e2e] room-assigned 수신 실패 (재시도 ${attempts}회 모두 실패, 마지막 에러: ${
            lastError instanceof Error ? lastError.message : String(lastError)
        })`
    )
}
