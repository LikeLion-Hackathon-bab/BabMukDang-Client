import { useAuthStore } from '@/store'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Axios 클라이언트 인스턴스 생성
export const client = axios.create({
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

// Request Interceptor: Authorization 헤더 자동 추가
client.interceptors.request.use(
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
client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }

        // 401 에러가 아니거나 이미 재시도한 요청이면 에러 반환
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        originalRequest._retry = true
        const { setTokens, logout, refreshToken } = useAuthStore.getState()

        // refreshToken이 없으면 로그아웃
        if (!refreshToken) {
            logout()
            return Promise.reject(error)
        }

        // 이미 갱신 중이면 대기열에 추가
        if (isRefreshing) {
            return new Promise(resolve => {
                addRefreshSubscriber((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    resolve(client(originalRequest))
                })
            })
        }

        isRefreshing = true

        try {
            // 토큰 갱신 요청
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            )

            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            } = response.data
            setTokens({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })

            // 대기 중인 요청들 처리
            onRefreshed(newAccessToken)

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return client(originalRequest)
        } catch (refreshError) {
            // 갱신 실패 시 로그아웃
            logout()
            refreshSubscribers = []
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)
