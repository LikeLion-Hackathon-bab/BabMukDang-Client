import { useAuthStore } from '@/store'
import axios from 'axios'

export const client = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true
})

let refreshPromise: Promise<string> | null = null

// JWT access_token을 Authorization 헤더에 자동으로 추가하는 인터셉터
client.interceptors.request.use(
    config => {
        const { accessToken } = useAuthStore.getState()
        if (accessToken) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    error => Promise.reject(error)
)

export function restoreSession(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${import.meta.env.VITE_BASE_API_URL}/auth/refresh`, null, {
                withCredentials: true
            })
            .then(({ data }) => {
                const { accessToken, refreshToken } = data.data
                useAuthStore.getState().setTokens({ accessToken, refreshToken })
                return accessToken as string
            })
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

client.interceptors.response.use(
    response => response,
    async error => {
        const request = error.config
        if (
            error.response?.status !== 401 ||
            !request ||
            request._retry ||
            request.url?.endsWith('/auth/refresh')
        ) {
            throw error
        }
        request._retry = true
        await restoreSession()
        return client(request)
    }
)
