import { Capacitor, registerPlugin } from '@capacitor/core'

/**
 * 앱 내 로컬 Capacitor 플러그인 `KakaoAuth`의 JS 계약. (ADR 0007, 0008)
 * - Android: android/app/src/main/java/com/babmukdang/app/kakaoauth/KakaoAuthPlugin.java
 * - iOS: ios/App/App/KakaoAuthPlugin.swift
 */
export interface KakaoAuthPlugin {
    /** 카카오톡(가능하면) 또는 카카오계정으로 로그인하고 OIDC id_token을 돌려준다. */
    login(): Promise<{ idToken: string }>
    /** 카카오 SDK 세션을 정리한다. 실패해도 resolve한다. */
    logout(): Promise<void>
    /** refresh token을 Keychain/Keystore에 저장한다. */
    setRefreshToken(options: { refreshToken: string }): Promise<void>
    getRefreshToken(): Promise<{ refreshToken: string | null }>
    clearRefreshToken(): Promise<void>
}

/** 네이티브 플러그인이 reject할 때 쓰는 code */
export type KakaoAuthErrorCode =
    | 'USER_CANCELLED'
    | 'NO_ID_TOKEN'
    | 'KAKAO_NOT_CONFIGURED'
    | 'KAKAO_LOGIN_FAILED'
    | 'SECURE_STORAGE_ERROR'
    | 'INVALID_ARGUMENT'

// 웹 구현은 두지 않는다. 웹에서 호출하면 Capacitor가 UNIMPLEMENTED로 reject한다.
export const KakaoAuth = registerPlugin<KakaoAuthPlugin>('KakaoAuth')

/** 네이티브 앱은 쿠키 대신 보안 저장소의 refresh token을 body로 주고받는다. (ADR 0007) */
export const usesNativeAuthSession = () => Capacitor.isNativePlatform()

export const readNativeRefreshToken = async (): Promise<string | null> => {
    const { refreshToken } = await KakaoAuth.getRefreshToken()
    return refreshToken || null
}

/** 로그아웃 시 보안 저장소와 카카오 SDK 세션을 정리한다. 실패는 무시한다. */
export const clearNativeAuthSession = async () => {
    await Promise.allSettled([
        KakaoAuth.clearRefreshToken(),
        KakaoAuth.logout()
    ])
}

export const getKakaoNativeLoginErrorMessage = (
    error: unknown
): string | null => {
    const code = (error as { code?: unknown } | null)?.code
    if (code === 'USER_CANCELLED') return null
    return '카카오 로그인에 실패했어요. 잠시 후 다시 시도해주세요.'
}
