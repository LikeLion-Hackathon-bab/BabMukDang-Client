import axios, {
    AxiosError,
    type AxiosAdapter,
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from 'axios'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = {
    accessToken: 'expired-token' as string | null,
    setTokens: vi.fn(({ accessToken }: { accessToken: string }) => {
        authState.accessToken = accessToken
    })
}
const clearUserSession = vi.fn(() => {
    authState.accessToken = null
})

vi.mock('@/store', () => ({
    useAuthStore: { getState: () => authState }
}))
vi.mock('./queryClient', () => ({ clearUserSession }))

const unauthorized = (config: InternalAxiosRequestConfig) =>
    new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { success: false, error: { message: 'expired' } }
    } as AxiosResponse)

let currentAdapter: AxiosAdapter = config =>
    Promise.reject(unauthorized(config))
axios.defaults.adapter = config => currentAdapter(config)

describe('axios client token refresh queue', () => {
    beforeEach(() => {
        authState.accessToken = 'expired-token'
        authState.setTokens.mockClear()
        clearUserSession.mockClear()
    })

    it('rejects every request queued during a failed refresh', async () => {
        let failRefresh: (error: unknown) => void = () => undefined
        const refreshResult = new Promise<never>((_, reject) => {
            failRefresh = reject
        })

        const adapter: AxiosAdapter = config => {
            if (config.url?.endsWith(apiContract.auth.refresh.path)) {
                return refreshResult
            }
            return Promise.reject(unauthorized(config))
        }
        currentAdapter = adapter

        const { contractClient } = await import('./client')

        const first = contractClient.get(apiContract.members.me)
        const second = contractClient.get(apiContract.members.me)
        const firstSettled = first.then(
            () => 'resolved',
            () => 'rejected'
        )
        const secondSettled = second.then(
            () => 'resolved',
            () => 'rejected'
        )

        // 두 요청이 모두 401을 받고 refresh 대기열에 들어갈 때까지 기다린다.
        await new Promise(resolve => setTimeout(resolve, 0))
        failRefresh(new Error('refresh failed'))

        await expect(firstSettled).resolves.toBe('rejected')
        await expect(secondSettled).resolves.toBe('rejected')
        expect(clearUserSession).toHaveBeenCalledTimes(1)
    })

    it('retries queued requests with the refreshed token', async () => {
        let completeRefresh: (response: AxiosResponse) => void = () => undefined
        const refreshResult = new Promise<AxiosResponse>(resolve => {
            completeRefresh = resolve
        })
        const retriedAuthHeaders: unknown[] = []

        const adapter: AxiosAdapter = config => {
            if (config.url?.endsWith(apiContract.auth.refresh.path)) {
                return refreshResult
            }
            if (config.headers.Authorization === 'Bearer fresh-token') {
                retriedAuthHeaders.push(config.headers.Authorization)
                return Promise.resolve({
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                    data: { success: true, data: { ok: true } }
                } as AxiosResponse)
            }
            return Promise.reject(unauthorized(config))
        }
        currentAdapter = adapter

        const { contractClient } = await import('./client')

        const first = contractClient.get(apiContract.members.me)
        const second = contractClient.get(apiContract.members.me)

        await new Promise(resolve => setTimeout(resolve, 0))
        completeRefresh({
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as InternalAxiosRequestConfig,
            data: { success: true, data: { accessToken: 'fresh-token' } }
        } as AxiosResponse)

        await expect(first).resolves.toEqual({ ok: true })
        await expect(second).resolves.toEqual({ ok: true })
        expect(retriedAuthHeaders).toHaveLength(2)
        expect(clearUserSession).not.toHaveBeenCalled()
    })
})
