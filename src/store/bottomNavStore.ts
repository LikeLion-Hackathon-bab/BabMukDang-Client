import { create } from 'zustand'

import {
    HomeIcon,
    MatchingIcon,
    DishIcon,
    MeetingIcon,
    PeopleIcon
} from '@/assets/icons'
export interface BottomNavConfig {
    visible: boolean
    items?: Array<{
        path: string
        label: string
        icon: React.ElementType
    }>
}

interface BottomNavStore {
    config: BottomNavConfig
    updateBottomNav: (newConfig: Partial<BottomNavConfig>) => void
    hideBottomNav: () => void
    showBottomNav: () => void
    setItems: (
        items: Array<{ path: string; label: string; icon: React.ElementType }>
    ) => void
    resetBottomNav: () => void
}

const defaultConfig: BottomNavConfig = {
    visible: true,
    items: [
        { path: '/', label: '홈', icon: HomeIcon },
        { path: '/matching', label: '매칭', icon: MatchingIcon },
        { path: '/friend', label: '친구', icon: PeopleIcon },
        { path: '/meeting', label: '밥약', icon: MeetingIcon },
        { path: '/profile', label: '내 밥그릇', icon: DishIcon }
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
        items: Array<{ path: string; label: string; icon: React.ElementType }>
    ) => {
        set(state => ({
            config: { ...state.config, items }
        }))
    },

    resetBottomNav: () => {
        set({ config: defaultConfig })
    }
}))
