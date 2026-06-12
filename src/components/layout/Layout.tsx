import { Outlet } from 'react-router-dom'
import { Header, BottomNavigation } from '@/components'
import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useGetMyProfile } from '@/apis'
import { NotificationSseProvider } from '@/contexts/NotificationSseProvider'

export function Layout() {
    return (
        <ProfileBootstrap>
            <NotificationSseProvider>
                <div className="bg-gray-1 flex h-screen min-h-screen w-screen min-w-screen flex-col">
                    <Header />
                    <main className="relative flex-1 overflow-x-hidden overflow-y-auto px-20 pb-90">
                        <Outlet />
                    </main>
                    <BottomNavigation />
                </div>
            </NotificationSseProvider>
        </ProfileBootstrap>
    )
}

type Props = {
    children: React.ReactNode
}

function ProfileBootstrap({ children }: Props) {
    const accessToken = useAuthStore(state => state.accessToken)
    const userId = useAuthStore(state => state.userId)
    const username = useAuthStore(state => state.username)

    const setUserId = useAuthStore(state => state.setUserId)
    const setUsername = useAuthStore(state => state.setUsername)
    const setProfile = useAuthStore(state => state.setProfile)

    const { data: myProfile } = useGetMyProfile({
        enabled: !!accessToken
    })

    useEffect(() => {
        if (!myProfile) {
            return
        }

        if (userId && username) {
            return
        }

        const { memberId, userName, profileImageUrl, bio, meetingCount } =
            myProfile

        setUserId(memberId.toString())
        setUsername(userName)
        setProfile({
            profileImageUrl,
            userName,
            bio,
            meetingCount
        })
    }, [myProfile, userId, username, setUserId, setUsername, setProfile])

    return <>{children}</>
}
