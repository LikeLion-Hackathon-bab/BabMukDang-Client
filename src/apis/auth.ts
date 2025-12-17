import { client } from './client'
import { BaseResponse, TokenResponse } from './dto'

/**
 * 카카오 로그인 시작
 * OAuth 인증 페이지로 리다이렉트합니다.
 */
export const login = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/oauth2/authorization/kakao`
}

/**
 * 로그아웃 API
 * 서버에 로그아웃 요청을 보내고 세션을 종료합니다.
 */
export const logout = async (): Promise<BaseResponse<void>> => {
    const res = await client.post('/auth/logout')
    return res.data
}

/**
 * 토큰 갱신 API
 * refreshToken을 사용하여 새로운 accessToken을 발급받습니다.
 */
export const refresh = async (): Promise<BaseResponse<TokenResponse>> => {
    const res = await client.post('/auth/refresh')
    return res.data
}
