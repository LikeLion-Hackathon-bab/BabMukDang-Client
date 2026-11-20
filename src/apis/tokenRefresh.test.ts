import axios, {
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from 'axios'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const native = vi.hoisted(() => {
    const state = {
        isNative: false,
        storedRefreshToken: null as string | null
    }
    const plugin = {
        getRefreshToken: vi.fn(async () => ({
            refreshToken: state.storedRefreshToken
        })),
        setRefreshToken: vi.fn(
            async ({ refreshToken }: { refreshToken: string }) => {
                state.storedRefreshToken = refreshToken
            }
        )
    }
    return { state, plugin }
})

vi.mock('@capacitor/core', () => ({
    Capacitor: { isNativePlatform: () => native.state.isNative },
    registerPlugin: () => native.plugin
}))
vi.mock('@/store', () => ({
    useAuthStore: {
        getState: () => ({ accessToken: null, setTokens: vi.fn() })
    }
}))
vi.mock('./queryClient', () => ({ clearUserSession: vi.fn() }))

const requests: InternalAxiosRequestConfig[] = []
let responseData: unknown = null

axios.defaults.adapter = config => {
    requests.push(config)
    return Promise.resolve({
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: { success: true, data: responseData }
    } as AxiosResponse)
}

const sentBody = (config: InternalAxiosRequestConfig) =>
    typeof config.data === 'string' ? JSON.parse(config.data) : config.data

describe('requestTokenRefresh', () => {
    beforeEach(() => {
        requests.length = 0
        native.state.isNative = false
        native.state.storedRefreshToken = null
        native.plugin.getRefreshToken.mockClear()
        native.plugin.setRefreshToken.mockClear()
    })

    it('keeps the web cookie flow: empty body with credentials', async () => {
        responseData = { accessToken: 'web-access' }
        const { requestTokenRefresh } = await import('./client')

        await expect(requestTokenRefresh()).resolves.toEqual({
            accessToken: 'web-access'
        })

        expect(requests).toHaveLength(1)
        expect(requests[0].url).toContain(apiContract.auth.refresh.path)
        expect(requests[0].withCredentials).toBe(true)
        expect(sentBody(requests[0])).toEqual({})
        expect(native.plugin.getRefreshToken).not.toHaveBeenCalled()
        expect(native.plugin.setRefreshToken).not.toHaveBeenCalled()
    })

    it('sends the stored refresh token in the body on native and stores the rotated one', async () => {
        native.state.isNative = true
        native.state.storedRefreshToken = 'stored-refresh'
        responseData = {
            accessToken: 'native-access',
            refreshToken: 'rotated-refresh'
        }
        const { requestTokenRefresh } = await import('./client')

        const tokens = await requestTokenRefresh()

        expect(tokens.accessToken).toBe('native-access')
        expect(requests).toHaveLength(1)
        expect(requests[0].withCredentials).toBe(false)
        expect(sentBody(requests[0])).toEqual({
            refreshToken: 'stored-refresh'
        })
        expect(native.plugin.setRefreshToken).toHaveBeenCalledWith({
            refreshToken: 'rotated-refresh'
        })
        expect(native.state.storedRefreshToken).toBe('rotated-refresh')
    })

    it('fails without calling the API when no native refresh token is stored', async () => {
        native.state.isNative = true
        const { requestTokenRefresh } = await import('./client')

        await expect(requestTokenRefresh()).rejects.toThrow(
            'Native refresh token is missing'
        )
        expect(requests).toHaveLength(0)
    })
})
