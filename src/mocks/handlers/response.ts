import { HttpResponse } from 'msw'
import type { ApiFailure } from '@kimdaegyu/babmukdang-shared/domain'

type MockApiSuccess<T> = {
    success: true
    code: number
    message: string
    data: T
}

export const apiSuccess = <T>(
    data: T,
    init: { status?: number; code?: number; message?: string } = {}
) => {
    const body: MockApiSuccess<T> = {
        success: true,
        code: init.code ?? init.status ?? 200,
        message: init.message ?? 'OK',
        data
    }

    return HttpResponse.json(body, { status: init.status ?? 200 })
}

export const apiCreated = <T>(data: T, message = 'Created') =>
    apiSuccess(data, { status: 201, code: 201, message })

export const apiNoContent = () => new HttpResponse(null, { status: 204 })

export const apiFailure = (
    status: number,
    code: string,
    message: string
) =>
    HttpResponse.json<ApiFailure>(
        {
            success: false,
            status,
            code,
            message
        },
        { status }
    )
