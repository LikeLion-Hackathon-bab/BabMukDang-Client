/**
 * @fileoverview 통합 E2E 공용 인증 헬퍼
 *
 * `backend-api.spec.ts`와 `backend-socket.spec.ts`가 공통으로 사용하는
 * 테스트 계정 발급(login) · memberId 조회 · 응답 검증 유틸을 모아둔다.
 * REST 호출 경로는 `endpoints`(`@/apis/endpoints`)를 통해서만 참조한다.
 */

import type { APIRequestContext } from '@playwright/test'
import { expect } from '@playwright/test'
import { endpoints } from '../../apis/endpoints'

export const BASE = (process.env.BACKEND_URL ?? 'http://localhost:3000') + '/api/v1'

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
    email: string
): Promise<string> {
    const res = await request.post(url(endpoints.auth.login), {
        data: { email }
    })
    if (!res.ok()) {
        console.error(
            `[e2e] POST /auth/login (${email}) 실패: status=${res.status()}, body=${JSON.stringify(
                await readBody(res)
            )}`
        )
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
    const id = body?.data?.member.userId ?? body?.data.userId ?? body?.userId

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
