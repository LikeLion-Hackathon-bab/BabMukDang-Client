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

export interface ContentConfig {
    fullBleed?: boolean
    scrollable?: boolean
    bottomInset?: boolean
}

export interface LayoutChromeConfig {
    header?: Partial<HeaderConfig>
    bottomNav?: Partial<BottomNavConfig>
    content?: ContentConfig
}

export interface ResolvedLayoutChromeConfig {
    header: HeaderConfig
    bottomNav: BottomNavConfig
    content: Required<ContentConfig>
}

type ChromeSlot = {
    ownerId?: string
    config?: LayoutChromeConfig
}

interface LayoutChromeStore {
    routeChrome: ChromeSlot
    pageChrome: ChromeSlot
    resolvedConfig: ResolvedLayoutChromeConfig
    setRouteChromeConfig: (
        config?: LayoutChromeConfig,
        ownerId?: string
    ) => void
    setPageChromeConfig: (config: LayoutChromeConfig, ownerId?: string) => void
    clearPageChromeConfig: (ownerId?: string) => void
    resetLayoutChromeConfig: () => void
}

const defaultBottomNavItems: BottomNavItem[] = [
    { path: '/home', label: '홈', icon: 'i' },
    { path: '/meal-map', label: '밥지도', icon: 'i' },
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

const createDefaultContentConfig = (): Required<ContentConfig> => ({
    fullBleed: false,
    scrollable: true,
    bottomInset: true
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
    },
    content: {
        ...createDefaultContentConfig(),
        ...routeChromeConfig?.content,
        ...pageChromeConfig?.content
    }
})

const isSameOwner = (slot: ChromeSlot, ownerId?: string) =>
    !ownerId || !slot.ownerId || slot.ownerId === ownerId

export const useLayoutChromeStore = create<LayoutChromeStore>(set => ({
    routeChrome: {},
    pageChrome: {},
    resolvedConfig: resolveLayoutChromeConfig(),

    setRouteChromeConfig: (config, ownerId) => {
        set(state => ({
            routeChrome: { config, ownerId },
            resolvedConfig: resolveLayoutChromeConfig(
                config,
                state.pageChrome.config
            )
        }))
    },

    setPageChromeConfig: (config, ownerId) => {
        set(state => ({
            pageChrome: { config, ownerId },
            resolvedConfig: resolveLayoutChromeConfig(
                state.routeChrome.config,
                config
            )
        }))
    },

    clearPageChromeConfig: ownerId => {
        set(state => {
            if (!isSameOwner(state.pageChrome, ownerId)) return state
            return {
                pageChrome: {},
                resolvedConfig: resolveLayoutChromeConfig(
                    state.routeChrome.config
                )
            }
        })
    },

    resetLayoutChromeConfig: () => {
        set({
            routeChrome: {},
            pageChrome: {},
            resolvedConfig: resolveLayoutChromeConfig()
        })
    }
}))
