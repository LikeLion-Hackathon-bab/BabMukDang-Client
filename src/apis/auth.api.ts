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
import { clearUserSession } from './queryClient'

import axios from 'axios'
import { unwrapBaseResponse } from './client'
import type {
    ApiResponse,
    LoginRequest
} from '@kimdaegyu/babmukdang-shared/domain'
import { API_BASE_URL } from './baseUrl'
import { pushTokenApi } from './pushToken.api'
import { getOrCreateDeviceId } from '@/features/push/deviceId'
import { buildKakaoWebLoginUrl } from '@/features/auth/loginRedirect'

type EmailAuthRequest = LoginRequest

// ============================================================================
// API 함수
// ============================================================================

/**
 * Auth API 함수 모음
 */
const authApi = {
    /**
     * 카카오 로그인 시작
     * @param redirect - 로그인 후 돌아갈 같은 출처 상대 경로 (ADR 0008)
     */
    login: async (redirect?: string | null) => {
        window.location.href = buildKakaoWebLoginUrl(API_BASE_URL, redirect)
    },

    emailLogin: async ({
        email,
        password
    }: EmailAuthRequest): Promise<TokenResponse> => {
        return contractClient.post(apiContract.auth.login, {
            body: { email, password }
        })
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
        try {
            await pushTokenApi.revoke({
                provider: 'FCM',
                deviceId: getOrCreateDeviceId()
            })
        } catch (error) {
            console.warn(
                '[auth] current device push token revoke failed',
                error
            )
        }
        return contractClient.post(apiContract.auth.logout)
    },

    /**
     * 토큰 갱신
     * @returns 새로운 토큰 응답 (Backend DTO 직접 반환)
     */
    refresh: async (): Promise<TokenResponse> => {
        // 무한 루프 방지를 위해 인터셉터가 없는 axios 직접 사용
        const res = await axios.post<ApiResponse<TokenResponse>>(
            `${API_BASE_URL}${apiContract.auth.refresh.path}`,
            {},
            { withCredentials: true }
        )
        return unwrapBaseResponse(res.data)
    }
}

// ============================================================================
// Mutation Hooks
// ============================================================================
/**
 * 카카오 로그인 redirect Hook
 */
export const useKakaoLogin = (redirect?: string | null) => {
    return (async () => await authApi.login(redirect))()
}

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
    const { setTokens, accessToken } = useAuthStore()

    return useMutation({
        mutationFn: authApi.refresh,
        onSuccess: data => {
            setTokens(data)
            console.log('Token Saved ', accessToken)
            options?.onSuccess?.(data)
        },
        onError: error => {
            clearUserSession()
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
                error instanceof Error
                    ? error
                    : new Error('Email signup failed')
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
    return useMutation({
        mutationFn: authApi.logout,

        onSuccess: data => {
            options.onSuccess?.(data)
        },

        onError: error => {
            options.onError?.(
                error instanceof Error ? error : new Error('Logout failed')
            )
        },

        onSettled: () => {
            clearUserSession()
            options.onSettled?.()
        }
    })
}
