import type { ElementType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBottomNavStore } from '@/store/bottomNavStore'
import { BOTTOM_NAVIGATION_HEIGHT } from '@/constants/bottomNav'

interface BottomNavigationProps {
    items?: Array<{
        path: string
        label: string
        icon: ElementType
    }>
}
export function BottomNavigation({ items }: BottomNavigationProps) {
    const location = useLocation()
    const bottomNavConfig = useBottomNavStore(state => state.config)
    const finalItems = items || bottomNavConfig.items || []

    if (!bottomNavConfig.visible) return null

    const tabRoutes: Record<string, string[]> = {
        '/home': ['/home', '/search-restaurant', '/noti', '/upload', '/post'],
        '/meeting': ['/meeting', '/meal-plans'],
        '/friend': ['/friend'],
        '/meal-map': ['/meal-map'],
        '/profile': [
            '/profile',
            '/coupon',
            '/profile-edit',
            '/bob-check-history',
            '/challenge',
            '/friend-profile',
            '/meal-groups'
        ]
    }

    const isActive = (tabPath: string) => {
        const routes = tabRoutes[tabPath]
        if (!routes) return location.pathname === tabPath

        return routes.some(
            route =>
                location.pathname === route ||
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
            className="fixed right-0 bottom-0 left-0 z-500 border-t border-gray-200 bg-white px-26 pt-10"
            style={{ height: `${BOTTOM_NAVIGATION_HEIGHT}px` }}>
            <div className="flex justify-between">
                {finalItems.map((item, index) => (
                    <Link
                        replace
                        key={`${item.path}-${index}`}
                        to={item.path}
                        className="flex min-w-45 flex-col items-center gap-4 rounded-lg">
                        <item.icon
                            className="size-24 min-h-24 min-w-24"
                            strokecolor={strokecolor(item.path)}
                            bgcolor={bgcolor(item.path)}
                        />
                        <span className={`text-caption-medium ${textColor(item.path)}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
