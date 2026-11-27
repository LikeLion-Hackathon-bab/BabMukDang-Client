import { useEffect, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { restoreSession } from '@/apis/client'
import { Header, BottomNavigation } from '@/components'
import { useAuthStore, useBottomNavStore } from '@/store'
import { useGetMyProfile } from '@/query'

export function Layout() {
    const { userId, username, setUserId, setUsername, setProfile, logout } =
        useAuthStore()
    const { data: myProfile, refetch } = useGetMyProfile()
    const { accessToken, refreshToken } = useAuthStore()
    const navigate = useNavigate()
    useEffect(() => {
        console.log('myProfile', myProfile, userId, username)

        if (!userId && !username) {
            if (myProfile) {
                setUserId(myProfile.data.memberId.toString())
                setUsername(myProfile.data.userName)
                setProfile({
                    profileImageUrl: myProfile.data.profileImageUrl,
                    userName: myProfile.data.userName,
                    bio: myProfile.data.bio,
                    meetingCount: myProfile.data.meetingCount
                })
                console.log(myProfile.data)
            } else {
                refetch()
            }
        }
    }, [myProfile])
    useEffect(() => {
        if (useAuthStore.getState().accessToken) return
        let active = true
        restoreSession().catch(() => {
            if (active) navigate('/login', { replace: true })
        })
        return () => { active = false }
    }, [])
    return (
        <div className="bg-gray-1 flex h-screen min-h-screen w-screen min-w-screen flex-col">
            {/* Header */}
            <Header />
            {/* Main Content */}
            <main className="relative flex-1 overflow-x-hidden overflow-y-auto px-20 pb-90">
                <Outlet />
            </main>
            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    )
}
