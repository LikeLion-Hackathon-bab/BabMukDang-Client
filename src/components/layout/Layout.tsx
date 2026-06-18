import { Outlet } from 'react-router-dom'
import { Header, BottomNavigation } from '@/components'
import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useAppBootstrap } from '@/contexts'

export function Layout() {
    return (
        <ProfileBootstrap>
            <div className="bg-gray-1 flex h-screen min-h-screen w-screen min-w-screen flex-col">
                <Header />
                <main className="relative flex-1 overflow-x-hidden overflow-y-auto px-20 pb-90">
                    <Outlet />
                </main>
                <BottomNavigation />
            </div>
        </ProfileBootstrap>
    )
}

type Props = {
    children: React.ReactNode
}

function ProfileBootstrap({ children }: Props) {
    const userId = useAuthStore(state => state.userId)
    const username = useAuthStore(state => state.username)

    const setUserId = useAuthStore(state => state.setUserId)
    const setUsername = useAuthStore(state => state.setUsername)
    const setProfile = useAuthStore(state => state.setProfile)

    const { profile: myProfile } = useAppBootstrap()

    useEffect(() => {
        if (!myProfile) {
            return
        }

        const { memberId, userName, profileImageUrl, bio, meetingCount } =
            myProfile

        if (userId === memberId.toString() && username === userName) {
            return
        }

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
