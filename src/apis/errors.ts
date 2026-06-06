/**
 * @fileoverview API 에러 타입과 변환 헬퍼
 *
 * Axios가 던지는 raw `AxiosError`를 컴포넌트에 그대로 노출하지 않고,
 * 사용자/도메인 친화적인 에러 타입으로 변환한다.
 * - 4xx: `AppError` (사용자에게 보여줄 메시지 포함)
 * - 5xx: `ServerError`
 * - 응답 없음(네트워크 단절/타임아웃 등): `NetworkError`
 *
 * 에러 응답 body는 Shared `ApiErrorResponse` 계약을 따른다.
 */

import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@kimdaegyu/babmukdang-shared'

const DEFAULT_MESSAGE = '요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.'
const SERVER_MESSAGE = '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
const NETWORK_MESSAGE = '네트워크 연결을 확인해주세요.'

/** 4xx 도메인 에러. 사용자에게 그대로 보여줄 수 있는 메시지를 담는다. */
export class AppError extends Error {
    readonly status: number
    readonly code?: string
    constructor(message: string, status: number, code?: string) {
        super(message)
        this.name = 'AppError'
        this.status = status
        this.code = code
    }
}

/** 5xx 서버 에러. */
export class ServerError extends Error {
    readonly status: number
    constructor(message: string, status: number) {
        super(message)
        this.name = 'ServerError'
        this.status = status
    }
}

/** 응답을 받지 못한 에러(네트워크 단절, 타임아웃, CORS 등). */
export class NetworkError extends Error {
    constructor(message: string = NETWORK_MESSAGE) {
        super(message)
        this.name = 'NetworkError'
    }
}

const isApiErrorResponse = (data: unknown): data is ApiErrorResponse =>
    typeof data === 'object' &&
    data !== null &&
    typeof (data as ApiErrorResponse).message === 'string'

/**
 * `AxiosError`를 `AppError`/`ServerError`/`NetworkError`로 변환한다.
 * 컴포넌트는 변환된 에러의 `message`만 사용하면 된다.
 */
export const toAppError = (
    error: AxiosError
): AppError | ServerError | NetworkError => {
    const response = error.response
    if (!response) {
        return new NetworkError()
    }

    const { status, data } = response
    const bodyMessage = isApiErrorResponse(data) ? data.message : undefined

    if (status >= 500) {
        return new ServerError(bodyMessage ?? SERVER_MESSAGE, status)
    }

    const code = isApiErrorResponse(data) ? data.code : undefined
    return new AppError(bodyMessage ?? DEFAULT_MESSAGE, status, code)
}
