import { Outlet } from 'react-router-dom'
import { usePageChrome } from '@/hooks/usePageChrome'
import type { LayoutChromeConfig } from '@/store/layoutChromeStore'

const registerChromeConfig: LayoutChromeConfig = {
    header: {
        visible: false
    },
    bottomNav: {
        visible: false
    }
}

export function RegisterLayout() {
    usePageChrome(registerChromeConfig)

    return <Outlet />
}
