import { Link, useLocation } from 'react-router-dom'
import { useBottomNavStore } from '@/store/bottomNavStore'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'

interface BottomNavigationProps {
    items?: Array<{
        path: string
        label: string
        icon: React.ElementType
    }>
}
export function BottomNavigation({ items }: BottomNavigationProps) {
    const location = useLocation()
    const bottomNavConfig = useBottomNavStore(state => state.config)

    // items prop이 제공되면 우선 사용, 아니면 Zustand 스토어의 items 사용
    const finalItems = items || bottomNavConfig.items || []

    if (!bottomNavConfig.visible) {
        return null
    }

    // 각 탭에 속하는 경로들 정의
    const tabRoutes: Record<string, string[]> = {
        '/': ['/', '/search-restaurant', '/noti', '/upload', '/post'],
        '/matching': ['/matching', '/send-invitation', '/read-invitation'],
        '/profile': [
            '/profile',
            '/coupon',
            '/profile-edit',
            '/bob-check-history',
            '/challenge',
            '/friend-profile'
        ],
        '/meeting': ['/meeting']
    }

    // 현재 경로가 해당 탭에 속하는지 확인
    const isActive = (tabPath: string) => {
        const routes = tabRoutes[tabPath]
        if (!routes) return location.pathname === tabPath

        return routes.some(route =>
            route === '/'
                ? location.pathname === '/'
                : location.pathname === route ||
                  location.pathname.startsWith(route + '/')
        )
    }

    const bgcolor = (path: string) => (isActive(path) ? '#FFE2D9' : 'white')
    const strokecolor = (path: string) =>
        isActive(path) ? '#FF480B' : '#B7B7B7'
    const textColor = (path: string) =>
        isActive(path) ? 'text-primary-main' : 'text-gray-600'

    return (
        <nav
            className={`fixed right-0 bottom-0 left-0 z-500 border-t border-gray-200 bg-white px-36 pt-10`}
            style={{ height: `${BOTTOM_NAVIGATION_HEIGHT}px` }}>
            <div className="flex justify-between">
                {finalItems.map((item, index) => (
                    <Link
                        replace
                        key={index}
                        to={item.path}
                        className={`flex min-w-45 flex-col items-center gap-4 rounded-lg`}>
                        <item.icon
                            className="size-24 min-h-24 min-w-24"
                            strokecolor={strokecolor(item.path)}
                            bgcolor={bgcolor(item.path)}
                        />
                        <span
                            className={`text-caption-medium ${textColor(
                                item.path
                            )}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
