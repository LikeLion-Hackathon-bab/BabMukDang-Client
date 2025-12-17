import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { Header, BottomNavigation } from '@/components'
import { useAuthStore } from '@/store'
import { useGetMyProfile, useRefreshToken } from '@/apis'

export function Layout() {
    const navigate = useNavigate()
    const {
        userId,
        username,
        accessToken,
        refreshToken,
        setUserId,
        setUsername,
        setProfile
    } = useAuthStore()

    const { data: myProfile, refetch } = useGetMyProfile()

    // 토큰 갱신 mutation
    const { mutate: refreshTokenMutation, isPending: isRefreshing } =
        useRefreshToken({
            onSuccess: () => {
                console.log('[Auth] Token refreshed successfully')
            },
            onError: () => {
                console.log('[Auth] Token refresh failed, redirecting to login')
                navigate('/login', { replace: true })
            }
        })

    // 초기 인증 상태 확인
    useEffect(() => {
        // 토큰이 없으면 로그인 페이지로
        if (!accessToken && !refreshToken) {
            navigate('/login', { replace: true })
            return
        }

        // accessToken이 없고 refreshToken만 있으면 갱신 시도
        if (!accessToken && refreshToken) {
            refreshTokenMutation()
        }
    }, [accessToken, refreshToken, navigate, refreshTokenMutation])

    // 프로필 정보 동기화
    useEffect(() => {
        if (!myProfile?.data) {
            refetch()
            return
        }

        // 프로필 데이터가 있고, store에 아직 없으면 업데이트
        if (!userId || !username) {
            const { memberId, userName, profileImageUrl, bio, meetingCount } =
                myProfile.data
            setUserId(memberId.toString())
            setUsername(userName)
            setProfile({ profileImageUrl, userName, bio, meetingCount })
        }
    }, [
        myProfile,
        userId,
        username,
        setUserId,
        setUsername,
        setProfile,
        refetch
    ])

    return (
        <div className="bg-gray-1 flex h-screen min-h-screen w-screen min-w-screen flex-col">
            <Header />
            <main className="relative flex-1 overflow-x-hidden overflow-y-auto px-20 pb-90">
                <Outlet />
            </main>
            <BottomNavigation />
        </div>
    )
}
