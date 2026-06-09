import { useAuthStore } from '@/store'
import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig
} from 'axios'
import { toAppError } from './errors'
import { BaseResponse, TokenResponse } from '@kimdaegyu/babmukdang-shared'
import { ResponseOf, TypedEndpoint } from './responses'

// Axios 클라이언트 인스턴스 생성
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true,
    timeout: 10000
})

// 토큰 갱신 상태 관리
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

// 대기 중인 요청들에게 새 토큰 전달
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token))
    refreshSubscribers = []
}

// 토큰 갱신 대기열에 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback)
}

export function unwrapBaseResponse<T>(body: BaseResponse<T>): T {
    if (typeof body.code === 'number' && body.code >= 400) {
        throw body
    }

    return body.data
}

// Request Interceptor: Authorization 헤더 자동 추가
axiosClient.interceptors.request.use(
    config => {
        const { accessToken } = useAuthStore.getState()

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    error => Promise.reject(error)
)

// Response Interceptor: 401 에러 시 토큰 갱신 처리
axiosClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(toAppError(error))
        }

        originalRequest._retry = true

        const { setTokens, logout } = useAuthStore.getState()

        if (isRefreshing) {
            return new Promise(resolve => {
                addRefreshSubscriber((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    resolve(axiosClient(originalRequest))
                })
            })
        }

        isRefreshing = true

        try {
            const refreshResponse = await axios.post<
                BaseResponse<TokenResponse>
            >(
                `${import.meta.env.VITE_SERVER_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            )

            const tokenData = unwrapBaseResponse(refreshResponse.data)

            setTokens({
                accessToken: tokenData.accessToken
            })

            onRefreshed(tokenData.accessToken)

            originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`

            return axiosClient(originalRequest)
        } catch {
            logout()
            refreshSubscribers = []
            return Promise.reject(toAppError(error))
        } finally {
            isRefreshing = false
        }
    }
)

export const client = {
    async get<E extends TypedEndpoint<unknown>>(
        endpoint: E,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.get<BaseResponse<ResponseOf<E>>>(
            endpoint,
            config
        )

        return unwrapBaseResponse(res.data)
    },

    async post<E extends TypedEndpoint<unknown>, TBody = unknown>(
        endpoint: E,
        data?: TBody,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.post<BaseResponse<ResponseOf<E>>>(
            endpoint,
            data,
            config
        )

        return unwrapBaseResponse(res.data)
    },

    async patch<E extends TypedEndpoint<unknown>, TBody = unknown>(
        endpoint: E,
        data?: TBody,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.patch<BaseResponse<ResponseOf<E>>>(
            endpoint,
            data,
            config
        )

        return unwrapBaseResponse(res.data)
    },

    async delete<E extends TypedEndpoint<unknown>>(
        endpoint: E,
        config?: AxiosRequestConfig
    ): Promise<ResponseOf<E>> {
        const res = await axiosClient.delete<BaseResponse<ResponseOf<E>>>(
            endpoint,
            config
        )

        return unwrapBaseResponse(res.data)
    }
}
