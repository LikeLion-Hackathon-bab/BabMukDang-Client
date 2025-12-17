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
import { client } from './client'
import { endpoints } from './endpoints'
import type { BaseResponse, TokenResponse } from './types'

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
    login: async (): Promise<BaseResponse<TokenResponse>> => {
        const res = await client.get(endpoints.auth.kakaoLogin)
        console.log(res.data)
        return res.data
    },

    /**
     * 로그아웃
     * @returns 성공 응답
     */
    logout: async (): Promise<BaseResponse<void>> => {
        const res = await client.post(endpoints.auth.logout)
        return res.data
    },

    /**
     * 토큰 갱신
     * @returns 새로운 토큰 응답
     */
    refresh: async (): Promise<BaseResponse<TokenResponse>> => {
        const res = await client.post(endpoints.auth.refresh)
        return res.data
    }
}

// 기존 함수 export 유지 (하위 호환성)
export const login = authApi.login
export const logout = authApi.logout
export const refresh = authApi.refresh

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 뮤테이션 옵션 타입
 */
interface MutationOptions {
    /** 성공 시 콜백 */
    onSuccess?: () => void
    /** 에러 시 콜백 */
    onError?: (error: Error) => void
    /** 완료 시 콜백 (성공/실패 무관) */
    onSettled?: () => void
}

/**
 * 토큰 갱신 Hook
 * @param options - 성공/에러/완료 콜백
 *
 * @example
 * const { mutate: refreshToken } = useRefreshToken({
 *   onSuccess: () => {
 *     console.log('토큰 갱신 성공')
 *   },
 *   onError: (error) => {
 *     console.error('토큰 갱신 실패:', error)
 *     navigate('/login')
 *   }
 * })
 */
export const useRefreshToken = (options: MutationOptions = {}) => {
    return useMutation({
        mutationFn: authApi.refresh,
        onSuccess: options.onSuccess,
        onError: options.onError,
        onSettled: options.onSettled
    })
}

/**
 * 로그아웃 Hook
 * @param options - 성공/에러 콜백
 */
export const useLogout = (options: MutationOptions = {}) => {
    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: options.onSuccess,
        onError: options.onError
    })
}
