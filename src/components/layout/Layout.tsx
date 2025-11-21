import { useEffect, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { Header, BottomNavigation } from '@/components'
import { useAuthStore, useBottomNavStore } from '@/store'
import { useGetMyProfile, useRefreshToken } from '@/query'

export function Layout() {
    const { userId, username, setUserId, setUsername, setProfile, logout } =
        useAuthStore()
    const { data: myProfile, refetch } = useGetMyProfile()
    const { accessToken, refreshToken } = useAuthStore()
    const navigate = useNavigate()
    const { mutate: refreshTokenMutation } = useRefreshToken(
        () => {
            console.log('refreshToken')
        },
        (error: Error) => {
            console.log('error', error)
        },
        () => {
            if (!accessToken) {
                navigate('/login')
            }
        }
    )

    useEffect(() => {
        console.log('myProfile', myProfile, userId, username)

        if (!userId && !username) {
            if (myProfile) {
                setUserId(myProfile.member.id.toString())
                setUsername(myProfile.member.username)
                setProfile({
                    profileImageUrl: myProfile.member.profileImageUrl,
                    userName: myProfile.member.username,
                    bio: myProfile.member.bio,
                    meetingCount: myProfile.member.meetingCount
                })
                console.log(myProfile.member)
            } else {
                refetch()
            }
        }
    }, [myProfile])
    useEffect(() => {
        refreshTokenMutation()
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
