const hasControlCharacter = (value: string) =>
    Array.from(value).some(char => {
        const code = char.charCodeAt(0)
        return code < 0x20 || code === 0x7f
    })

/**
 * 로그인 후 돌아갈 경로는 같은 출처의 상대 경로만 허용한다. (ADR 0008)
 * `//evil.com`, `/\evil.com`, `https://...`처럼 다른 출처로 해석될 수 있는 값은 버린다.
 */
export const sanitizeRedirectPath = (
    value: string | null | undefined
): string | null => {
    if (!value) return null
    if (!value.startsWith('/')) return null
    if (value.startsWith('//') || value.startsWith('/\\')) return null
    // 제어 문자(탭, 개행 등)는 브라우저가 제거하면서 `//`가 될 수 있다.
    if (hasControlCharacter(value)) return null
    return value
}

/** Backend `/auth/kakao/callback` 실패 시 `/login?error=<code>`로 전달되는 코드 */
const KAKAO_LOGIN_ERROR_MESSAGES = {
    kakao_denied: '카카오 로그인 동의가 취소되었어요. 다시 시도해주세요.',
    invalid_state:
        '로그인 요청이 만료되었거나 올바르지 않아요. 다시 로그인해주세요.',
    kakao_failed: '카카오 로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.'
} as const

export type KakaoLoginErrorCode = keyof typeof KAKAO_LOGIN_ERROR_MESSAGES

export const getKakaoLoginErrorMessage = (
    code: string | null | undefined
): string | null => {
    if (
        !code ||
        !Object.prototype.hasOwnProperty.call(KAKAO_LOGIN_ERROR_MESSAGES, code)
    ) {
        return null
    }
    return KAKAO_LOGIN_ERROR_MESSAGES[code as KakaoLoginErrorCode]
}

/** 웹 카카오 로그인 시작 URL. redirect는 상대 경로일 때만 붙인다. */
export const buildKakaoWebLoginUrl = (
    apiBaseUrl: string,
    redirect?: string | null
): string => {
    const safeRedirect = sanitizeRedirectPath(redirect)
    const base = `${apiBaseUrl}/auth/kakao`
    if (!safeRedirect) return base
    return `${base}?${new URLSearchParams({ redirect: safeRedirect }).toString()}`
}
