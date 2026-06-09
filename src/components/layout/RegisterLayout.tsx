import { useBottomNavStore, useHeaderStore } from '@/store'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

export function RegisterLayout() {
    const { hideHeader, resetHeader } = useHeaderStore()
    const { hideBottomNav, resetBottomNav } = useBottomNavStore()
    useEffect(() => {
        hideHeader()
        hideBottomNav()
        return () => {
            resetHeader()
            resetBottomNav()
        }
    }, [])
    return <Outlet />
}
