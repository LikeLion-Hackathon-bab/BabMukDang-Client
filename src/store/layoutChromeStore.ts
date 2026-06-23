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

type ActivityChromeSlot = {
    route?: LayoutChromeConfig
    page?: LayoutChromeConfig
}

interface LayoutChromeStore {
    activityChrome: Record<string, ActivityChromeSlot>
    setRouteChromeConfig: (config?: LayoutChromeConfig, ownerId?: string) => void
    clearRouteChromeConfig: (ownerId?: string) => void
    setPageChromeConfig: (config: LayoutChromeConfig, ownerId?: string) => void
    clearPageChromeConfig: (ownerId?: string) => void
    resetLayoutChromeConfig: () => void
}

const defaultBottomNavItems: BottomNavItem[] = [
    { path: '/home', label: '홈', icon: 'i' },
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

export const resolveLayoutChromeConfig = (
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

const updateActivityChrome = (
    activityChrome: Record<string, ActivityChromeSlot>,
    ownerId: string,
    update: (slot: ActivityChromeSlot) => ActivityChromeSlot
) => ({
    ...activityChrome,
    [ownerId]: update(activityChrome[ownerId] ?? {})
})

export const useLayoutChromeStore = create<LayoutChromeStore>(set => ({
    activityChrome: {},

    setRouteChromeConfig: (config, ownerId) => {
        if (!ownerId) return
        set(state => ({
            activityChrome: updateActivityChrome(
                state.activityChrome,
                ownerId,
                slot => ({ ...slot, route: config })
            )
        }))
    },

    clearRouteChromeConfig: ownerId => {
        if (!ownerId) return
        set(state => {
            const slot = state.activityChrome[ownerId]
            if (!slot) return state
            const next = { ...state.activityChrome }
            if (!slot.page) {
                delete next[ownerId]
            } else {
                next[ownerId] = { ...slot, route: undefined }
            }
            return { activityChrome: next }
        })
    },

    setPageChromeConfig: (config, ownerId) => {
        if (!ownerId) return
        set(state => ({
            activityChrome: updateActivityChrome(
                state.activityChrome,
                ownerId,
                slot => ({ ...slot, page: config })
            )
        }))
    },

    clearPageChromeConfig: ownerId => {
        if (!ownerId) return
        set(state => {
            const slot = state.activityChrome[ownerId]
            if (!slot) return state
            const next = { ...state.activityChrome }
            if (!slot.route) {
                delete next[ownerId]
            } else {
                next[ownerId] = { ...slot, page: undefined }
            }
            return { activityChrome: next }
        })
    },

    resetLayoutChromeConfig: () => set({ activityChrome: {} })
}))
