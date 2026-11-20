import { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useMealPlanStore } from '@/store/mealPlanStore'
import { useNotificationStore } from '@/store/notificationStore'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
})

/**
 * 로그아웃/강제 로그아웃 시 이전 사용자의 인증 정보와 사용자별 캐시를 함께 비운다.
 * 이미 비워진 세션에서 다시 호출되면 아무것도 하지 않아, 캐시 삭제로 인한
 * refetch → 401 → refresh 실패 → 재삭제 루프를 만들지 않는다.
 */
export function clearUserSession() {
    const { accessToken, userId, username, flushAuthStore } =
        useAuthStore.getState()
    if (!accessToken && !userId && !username) return

    flushAuthStore()
    useMealPlanStore.getState().resetMealPlanState()
    useNotificationStore.setState({ notifications: [], latest: null })
    queryClient.clear()
}
