import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface AuthState {
    accessToken: string | null
    username: string | null
    userId: string | null
    profile: {
        profileImageUrl: string | null
        userName: string | null
        bio: string | null
        meetingCount: number | null
    }
    setTokens: ({ accessToken }: { accessToken: string }) => void
    clearTokens: () => void
    refresh: () => Promise<void>
    setUsername: (username: string) => void
    setUserId: (userId: string) => void
    setProfile: (profile: {
        profileImageUrl: string | null
        userName: string | null
        bio: string | null
        meetingCount: number | null
    }) => void
    logout: () => void
}

// localStorage에 저장될 상태만 정의 (함수 제외)
interface PersistedAuthState {
    accessToken: string | null
    username: string | null
    userId: string | null
    profile: {
        profileImageUrl: string | null
        userName: string | null
        bio: string | null
        meetingCount: number | null
    }
}

const persistConfig: PersistOptions<AuthState, PersistedAuthState> = {
    name: 'auth-storage',
    partialize: (state): PersistedAuthState => ({
        accessToken: state.accessToken,
        username: state.username,
        userId: state.userId,
        profile: state.profile
    })
}

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            accessToken: null,
            refreshToken: null,
            username: null,
            userId: null,
            profile: {
                profileImageUrl: null,
                userName: null,
                bio: null,
                meetingCount: null
            },
            setTokens: ({ accessToken }: { accessToken: string }) =>
                set({ accessToken }),
            clearTokens: () => set({ accessToken: null }),
            // 토큰 갱신 단일 진입점. SocketProvider 등에서 갱신 로직을 중복
            // 구현하지 않고 이 액션만 호출한다.
            // (apis는 client→authStore 순환을 피하려고 동적 import)
            refresh: async () => {
                const { refresh: refreshApi } = await import('@/apis')
                const token = await refreshApi()
                set({
                    accessToken: token.accessToken
                })
            },
            setUsername: (username: string) => set({ username }),
            setUserId: (userId: string) => set({ userId }),
            setProfile: (profile: {
                profileImageUrl: string | null
                userName: string | null
                bio: string | null
                meetingCount: number | null
            }) => set({ profile }),
            logout: () => {
                set({
                    accessToken: null,
                    username: null,
                    userId: null,
                    profile: {
                        profileImageUrl: null,
                        userName: null,
                        bio: null,
                        meetingCount: null
                    }
                })
            }
        }),
        persistConfig
    )
)
