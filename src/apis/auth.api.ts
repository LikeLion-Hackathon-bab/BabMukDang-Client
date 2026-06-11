/**
 * @fileoverview Auth(인증) API 모듈
 *
 * 로그인, 로그아웃, 토큰 갱신 등 인증 관련 API 함수와 hooks를 제공합니다.
 *
 * @example
 * // 토큰 갱신
 * const { mutate: refreshToken } = useRefreshToken({
 *   onSuccess: () => console.log('토큰 갱신 완료')
 * })
 */

import { useMutation } from '@tanstack/react-query'
import { contractClient } from './client'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import type { MutationOptions, NoContent, TokenResponse } from './types'
import { useAuthStore } from '@/store'

import axios from 'axios'
import { unwrapBaseResponse } from './client'
import type { BaseResponse } from '@kimdaegyu/babmukdang-shared/domain'
import { API_BASE_URL } from './baseUrl'

type EmailAuthRequest = {
    email: string
    password: string
}

// ============================================================================
// API 함수
// ============================================================================

/**
 * Auth API 함수 모음
 */
export const authApi = {
    /**
     * 카카오 로그인 시작
     * @returns 토큰 응답
     */
    login: async () => {
        // const res = await client.get(endpoints.auth.kakaoLogin)
        // return res.data
        window.location.href = `${API_BASE_URL}/auth/kakao`
    },

    emailLogin: async ({ email, password }: EmailAuthRequest): Promise<TokenResponse> => {
        return contractClient.post(apiContract.auth.login, { body: { email, password } })
    },

    emailSignup: async ({
        email,
        password
    }: EmailAuthRequest): Promise<TokenResponse> => {
        const username = email.split('@')[0] || email
        await contractClient.post(apiContract.auth.signup, {
            body: { email, username, password }
        })
        return authApi.emailLogin({ email, password })
    },

    /**
     * 로그아웃
     * @returns 성공 응답
     */
    logout: async (): Promise<NoContent> => {
        return contractClient.post(apiContract.auth.logout)
    },

    /**
     * 토큰 갱신
     * @returns 새로운 토큰 응답 (Backend DTO 직접 반환)
     */
    refresh: async (): Promise<TokenResponse> => {
        // 무한 루프 방지를 위해 인터셉터가 없는 axios 직접 사용
        const res = await axios.post<BaseResponse<TokenResponse>>(
            `${API_BASE_URL}${apiContract.auth.refresh.path}`,
            {},
            { withCredentials: true }
        )
        return unwrapBaseResponse(res.data)
    }
}

// 기존 함수 export 유지 (하위 호환성)
export const login = authApi.login
export const emailLogin = authApi.emailLogin
export const emailSignup = authApi.emailSignup
export const logout = authApi.logout
export const refresh = authApi.refresh

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 토큰 갱신 Hook
 * @param options - 성공/에러/완료 콜백
 *
 * @example
 * const { mutate: refreshToken } = useRefreshToken({
 *   onSuccess: data => {
 *     console.log('토큰 갱신 성공')
 *   },
 *   onError: (error) => {
 *     console.error('토큰 갱신 실패:', error)
 *     navigate('/login')
 *   }
 * })
 */
export const useRefreshToken = (options?: MutationOptions<TokenResponse>) => {
    const { setTokens, clearTokens, accessToken } = useAuthStore()

    return useMutation({
        mutationFn: authApi.refresh,
        onSuccess: data => {
            setTokens(data)
            console.log('Token Saved ', accessToken)
            options?.onSuccess?.(data)
        },
        onError: error => {
            clearTokens()
            console.log(error)
            options?.onError?.(
                error instanceof Error
                    ? error
                    : new Error('Token refresh failed')
            )
        },
        onSettled: options?.onSettled
    })
}

export const useEmailLogin = (options?: MutationOptions<TokenResponse>) => {
    const { setTokens, clearTokens } = useAuthStore()

    return useMutation({
        mutationFn: authApi.emailLogin,
        onSuccess: data => {
            setTokens(data)
            options?.onSuccess?.(data)
        },
        onError: error => {
            clearTokens()
            options?.onError?.(
                error instanceof Error ? error : new Error('Email login failed')
            )
        },
        onSettled: options?.onSettled
    })
}

export const useEmailSignup = (options?: MutationOptions<TokenResponse>) => {
    const { setTokens, clearTokens } = useAuthStore()

    return useMutation({
        mutationFn: authApi.emailSignup,
        onSuccess: data => {
            setTokens(data)
            options?.onSuccess?.(data)
        },
        onError: error => {
            clearTokens()
            options?.onError?.(
                error instanceof Error ? error : new Error('Email signup failed')
            )
        },
        onSettled: options?.onSettled
    })
}

/**
 * 로그아웃 Hook
 * @param options - 성공/에러 콜백
 */
export const useLogout = (options: MutationOptions<NoContent> = {}) => {
    const { logout: clearAuthState } = useAuthStore()

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: data => {
            clearAuthState()
            options.onSuccess?.(data)
        },
        onError: options.onError
    })
}
