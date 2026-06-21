import type { ElementType, ReactNode } from 'react'
import { create } from 'zustand'

export interface HeaderConfig {
    visible: boolean
    left?: ReactNode
    center?: ReactNode
    right?: ReactNode
    showLeftButton?: boolean
    title?: string
    showRightButton?: boolean
    showCenterElement?: boolean
}

export interface BottomNavItem {
    path: string
    label: string
    icon: ElementType
}

export interface BottomNavConfig {
    visible: boolean
    items?: BottomNavItem[]
}

export interface LayoutChromeConfig {
    header?: Partial<HeaderConfig>
    bottomNav?: Partial<BottomNavConfig>
}

export interface ResolvedLayoutChromeConfig {
    header: HeaderConfig
    bottomNav: BottomNavConfig
}

interface LayoutChromeStore {
    routeChromeConfig?: LayoutChromeConfig
    pageChromeConfig?: LayoutChromeConfig
    resolvedConfig: ResolvedLayoutChromeConfig
    setRouteChromeConfig: (config?: LayoutChromeConfig) => void
    setPageChromeConfig: (config: LayoutChromeConfig) => void
    clearPageChromeConfig: () => void
    resetLayoutChromeConfig: () => void
}

const defaultBottomNavItems: BottomNavItem[] = [
    { path: '/', label: '홈', icon: 'i' },
    { path: '/meal-map', label: '지도', icon: 'i' },
    { path: '/friend', label: '친구', icon: 'i' },
    { path: '/meeting', label: '밥약', icon: 'i' },
    { path: '/profile', label: '내 밥그릇', icon: 'i' }
]

const createDefaultHeaderConfig = (): HeaderConfig => ({
    visible: true,
    showLeftButton: true,
    showRightButton: false,
    showCenterElement: true,
    title: ''
})

const createDefaultBottomNavConfig = (): BottomNavConfig => ({
    visible: true,
    items: [...defaultBottomNavItems]
})

const resolveLayoutChromeConfig = (
    routeChromeConfig?: LayoutChromeConfig,
    pageChromeConfig?: LayoutChromeConfig
): ResolvedLayoutChromeConfig => ({
    header: {
        ...createDefaultHeaderConfig(),
        ...routeChromeConfig?.header,
        ...pageChromeConfig?.header
    },
    bottomNav: {
        ...createDefaultBottomNavConfig(),
        ...routeChromeConfig?.bottomNav,
        ...pageChromeConfig?.bottomNav
    }
})

export const useLayoutChromeStore = create<LayoutChromeStore>(set => ({
    routeChromeConfig: undefined,
    pageChromeConfig: undefined,
    resolvedConfig: resolveLayoutChromeConfig(),

    setRouteChromeConfig: routeChromeConfig => {
        set(state => ({
            routeChromeConfig,
            resolvedConfig: resolveLayoutChromeConfig(
                routeChromeConfig,
                state.pageChromeConfig
            )
        }))
    },

    setPageChromeConfig: pageChromeConfig => {
        set(state => ({
            pageChromeConfig,
            resolvedConfig: resolveLayoutChromeConfig(
                state.routeChromeConfig,
                pageChromeConfig
            )
        }))
    },

    clearPageChromeConfig: () => {
        set(state => ({
            pageChromeConfig: undefined,
            resolvedConfig: resolveLayoutChromeConfig(state.routeChromeConfig)
        }))
    },

    resetLayoutChromeConfig: () => {
        set({
            routeChromeConfig: undefined,
            pageChromeConfig: undefined,
            resolvedConfig: resolveLayoutChromeConfig()
        })
    }
}))
