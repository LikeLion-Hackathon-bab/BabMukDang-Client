import type { ElementType } from 'react'
import { create } from 'zustand'
import {
    DishIcon,
    HomeIcon,
    MeetingIcon,
    PeopleIcon,
    ProfileDefaultIcon
} from '@/assets/icons'

export interface BottomNavConfig {
    visible: boolean
    items?: Array<{
        path: string
        label: string
        icon: ElementType
    }>
}

interface BottomNavStore {
    config: BottomNavConfig
    updateBottomNav: (newConfig: Partial<BottomNavConfig>) => void
    hideBottomNav: () => void
    showBottomNav: () => void
    setItems: (
        items: Array<{ path: string; label: string; icon: ElementType }>
    ) => void
    resetBottomNav: () => void
}

const defaultConfig: BottomNavConfig = {
    visible: true,
    items: [
        // { path: '/home', label: '홈', icon: HomeIcon },
        // { path: '/meeting', label: '내 밥약', icon: MeetingIcon },
        // { path: '/friend', label: '친구', icon: PeopleIcon },
        // { path: '/meal-map', label: '밥지도', icon: DishIcon },
        // { path: '/profile', label: '내 밥그릇', icon: ProfileDefaultIcon }
        { path: '/', label: '홈', icon: 'i' },
        { path: '/matching', label: '매칭', icon: 'i' },
        { path: '/friend', label: '친구', icon: 'i' },
        { path: '/meeting', label: '밥약', icon: 'i' },
        { path: '/profile', label: '내 밥그릇', icon: 'i' }
    ]
}

export const useBottomNavStore = create<BottomNavStore>(set => ({
    config: defaultConfig,

    updateBottomNav: (newConfig: Partial<BottomNavConfig>) => {
        set(state => ({
            config: { ...state.config, ...newConfig }
        }))
    },

    hideBottomNav: () => {
        set(state => ({
            config: { ...state.config, visible: false }
        }))
    },

    showBottomNav: () => {
        set(state => ({
            config: { ...state.config, visible: true }
        }))
    },

    setItems: (
        items: Array<{ path: string; label: string; icon: ElementType }>
    ) => {
        set(state => ({
            config: { ...state.config, items }
        }))
    },

    resetBottomNav: () => {
        set({ config: defaultConfig })
    }
}))
