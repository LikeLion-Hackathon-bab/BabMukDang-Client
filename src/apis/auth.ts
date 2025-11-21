import { client } from './client'
import { TokenResponse } from '@kimdaegyu/babmukdang-shared'

export const login = async (): Promise<TokenResponse> => {
    const res = await client.get(`/auth2/authorization/kakao`)
    console.log(res.data)
    return res.data.data
}

export const logout = async (): Promise<void> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/auth/logout`
    )
    return res.data.data
}

export const refresh = async (): Promise<TokenResponse> => {
    const res = await client.post(
        `${import.meta.env.VITE_BASE_API_URL}/auth/refresh`
    )
    return res.data.data
}
