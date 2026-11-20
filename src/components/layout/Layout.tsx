import { matchPath, useLocation } from '@/navigation'
import { Header, BottomNavigation } from '@/components'
import { useEffect, useLayoutEffect, useMemo, type ReactNode } from 'react'
import { useAuthStore } from '@/store'
import { useAppBootstrap } from '@/contexts'
import {
    resolveLayoutChromeConfig,
    useLayoutChromeStore
} from '@/store/layoutChromeStore'
import {
    resolveRouteChromeConfig,
    routeChromeConfigEntries
} from '@/routes/pageChromeConfig'
import { useNavigationActivityContext } from '@/navigation/NavigationActivityContext'

type LayoutProps = {
    children: ReactNode
    showBottomNavigation?: boolean
}

export function Layout({ children, showBottomNavigation = true }: LayoutProps) {
    const location = useLocation()
    const activity = useNavigationActivityContext()
    const activityId = activity?.activityId
    const setRouteChromeConfig = useLayoutChromeStore(
        state => state.setRouteChromeConfig
    )
    const clearRouteChromeConfig = useLayoutChromeStore(
        state => state.clearRouteChromeConfig
    )
    const activityChrome = useLayoutChromeStore(state =>
        activityId ? state.activityChrome[activityId] : undefined
    )
    const routeChromeConfig = useMemo(() => {
        const entry = routeChromeConfigEntries.find(config =>
            matchPath(
                { path: config.path, end: config.end ?? true },
                location.pathname
            )
        )

        return entry ? resolveRouteChromeConfig(entry, location) : undefined
    }, [location])

    useLayoutEffect(() => {
        if (!activityId) return
        setRouteChromeConfig(routeChromeConfig, activityId)

        return () => {
            clearRouteChromeConfig(activityId)
        }
    }, [
        activityId,
        clearRouteChromeConfig,
        routeChromeConfig,
        setRouteChromeConfig
    ])

    const chrome = useMemo(
        () =>
            resolveLayoutChromeConfig(
                routeChromeConfig,
                activityChrome?.page
            ),
        [activityChrome?.page, routeChromeConfig]
    )
    const isBottomNavigationVisible = showBottomNavigation && chrome.bottomNav.visible
    const mainClassName = chrome.content.fullBleed
        ? 'relative min-h-0 flex-1 overflow-hidden'
        : [
              'relative min-h-0 flex-1 overflow-x-hidden px-20',
              chrome.content.scrollable ? 'overflow-y-auto' : 'overflow-y-hidden',
              chrome.content.bottomInset && isBottomNavigationVisible ? 'pb-90' : ''
          ].join(' ')

    return (
        <ProfileBootstrap>
            <div className="bg-gray-1 relative flex h-screen min-h-screen w-screen min-w-screen flex-col overflow-hidden">
                <Header config={chrome.header} />
                <main className={mainClassName}>{children}</main>
                {isBottomNavigationVisible ? (
                    <BottomNavigation config={chrome.bottomNav} />
                ) : null}
            </div>
        </ProfileBootstrap>
    )
}

type Props = {
    children: ReactNode
}

function ProfileBootstrap({ children }: Props) {
    const userId = useAuthStore(state => state.userId)
    const username = useAuthStore(state => state.username)

    const setUserId = useAuthStore(state => state.setUserId)
    const setUsername = useAuthStore(state => state.setUsername)
    const setProfile = useAuthStore(state => state.setProfile)

    const { profile: myProfile } = useAppBootstrap()

    useEffect(() => {
        if (!myProfile) return

        const { memberId, userName, profileImageUrl, bio, meetingCount } =
            myProfile

        if (userId === memberId.toString() && username === userName) return

        setUserId(memberId.toString())
        setUsername(userName)
        setProfile({ profileImageUrl, userName, bio, meetingCount })
    }, [myProfile, userId, username, setUserId, setUsername, setProfile])

    return <>{children}</>
}
