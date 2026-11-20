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
import { contractClient, requestTokenRefresh } from './client'
import { apiContract } from '@kimdaegyu/babmukdang-shared/domain'
import type { MutationOptions, NoContent, TokenResponse } from './types'
import { useAuthStore } from '@/store'
import { clearUserSession } from './queryClient'

import type {
    LoginRequest,
    RefreshResponse
} from '@kimdaegyu/babmukdang-shared/domain'
import { API_BASE_URL } from './baseUrl'
import { pushTokenApi } from './pushToken.api'
import { getOrCreateDeviceId } from '@/features/push/deviceId'
import { buildKakaoWebLoginUrl } from '@/features/auth/loginRedirect'
import {
    KakaoAuth,
    clearNativeAuthSession,
    readNativeRefreshToken,
    usesNativeAuthSession
} from '@/features/auth/kakaoAuthPlugin'

type EmailAuthRequest = LoginRequest

/** 네이티브 로그인 결과. 웹은 페이지를 이동하므로 null이다. */
export type KakaoLoginResult = {
    accessToken: string
    signupRequired: boolean
} | null

const revokeCurrentDevicePushToken = async () => {
    try {
        await pushTokenApi.revoke({
            provider: 'FCM',
            deviceId: getOrCreateDeviceId()
        })
    } catch (error) {
        console.warn('[auth] current device push token revoke failed', error)
    }
}

// ============================================================================
// API 함수
// ============================================================================

/**
 * Auth API 함수 모음
 */
const authApi = {
    /**
     * 카카오 로그인 (ADR 0008)
     * - 웹: Backend `/auth/kakao`로 이동한다. redirect는 같은 출처 상대 경로만 넘긴다.
     * - 네이티브: 카카오 SDK id_token을 `/auth/kakao/native`로 보내고 refresh token은 보안 저장소에 둔다.
     */
    login: async (redirect?: string | null): Promise<KakaoLoginResult> => {
        if (!usesNativeAuthSession()) {
            window.location.href = buildKakaoWebLoginUrl(API_BASE_URL, redirect)
            return null
        }

        const { idToken } = await KakaoAuth.login()
        const tokens = await contractClient.post(apiContract.auth.kakaoNative, {
            body: { idToken }
        })
        await KakaoAuth.setRefreshToken({ refreshToken: tokens.refreshToken })
        return {
            accessToken: tokens.accessToken,
            signupRequired: tokens.signupRequired
        }
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
        await revokeCurrentDevicePushToken()

        if (!usesNativeAuthSession()) {
            return contractClient.post(apiContract.auth.logout)
        }

        // 네이티브 세션은 쿠키가 없으므로 refresh token을 body로 보내 서버 세션을 끊는다. (ADR 0007)
        try {
            const refreshToken = await readNativeRefreshToken().catch(
                () => null
            )
            return await contractClient.post(apiContract.auth.logout, {
                body: refreshToken ? { refreshToken } : undefined
            })
        } finally {
            await clearNativeAuthSession()
        }
    },

    /**
     * 모든 기기에서 로그아웃
     */
    logoutAll: async (): Promise<NoContent> => {
        await revokeCurrentDevicePushToken()

        try {
            return await contractClient.post(apiContract.auth.logoutAll)
        } finally {
            if (usesNativeAuthSession()) {
                await clearNativeAuthSession()
            }
        }
    },

    /**
     * 토큰 갱신 (웹: 쿠키, 네이티브: 보안 저장소 refresh token body)
     */
    refresh: (): Promise<RefreshResponse> => requestTokenRefresh()
}

// ============================================================================
// Mutation Hooks
// ============================================================================
/**
 * 카카오 로그인 Hook. mutate(redirect)로 시작한다.
 * 네이티브 로그인이 끝나면 access token을 저장하고 결과(signupRequired)를 넘긴다.
 */
export const useKakaoLogin = (
    options: MutationOptions<KakaoLoginResult> = {}
) => {
    const { setTokens } = useAuthStore()

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: data => {
            if (data) {
                setTokens({ accessToken: data.accessToken })
            }
            options.onSuccess?.(data)
        },
        onError: error => {
            options.onError?.(
                error instanceof Error ? error : new Error('Kakao login failed')
            )
        },
        onSettled: options.onSettled
    })
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
export const useRefreshToken = (options?: MutationOptions<RefreshResponse>) => {
    const { setTokens, accessToken } = useAuthStore()

    return useMutation({
        mutationFn: authApi.refresh,
        onSuccess: data => {
            setTokens({ accessToken: data.accessToken })
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

/**
 * 모든 기기에서 로그아웃 Hook
 * @param options - 성공/에러 콜백
 */
export const useLogoutAll = (options: MutationOptions<NoContent> = {}) => {
    return useMutation({
        mutationFn: authApi.logoutAll,
        onSuccess: data => {
            options.onSuccess?.(data)
        },
        onError: error => {
            options.onError?.(
                error instanceof Error ? error : new Error('Logout all failed')
            )
        },
        onSettled: () => {
            clearUserSession()
            options.onSettled?.()
        }
    })
}
