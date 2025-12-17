import { refresh } from '@/apis'
import { useAuthStore } from '@/store'
import { useMutation } from '@tanstack/react-query'

/**
 * 토큰 갱신을 위한 mutation hook
 * @param onSuccess - 갱신 성공 시 콜백
 * @param onError - 갱신 실패 시 콜백
 */
export const useRefreshToken = (
    onSuccess?: () => void,
    onError?: () => void
) => {
    const { setTokens, logout } = useAuthStore()

    return useMutation({
        mutationFn: refresh,
        onSuccess: data => {
            // 새 토큰 저장
            const { accessToken, refreshToken } = data.data
            setTokens({ accessToken, refreshToken })
            onSuccess?.()
        },
        onError: () => {
            // 갱신 실패 시 로그아웃 처리
            logout()
            onError?.()
        }
    })
}
