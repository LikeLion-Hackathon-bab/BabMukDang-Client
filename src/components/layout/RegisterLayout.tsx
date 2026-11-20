import type { ReactNode } from 'react'
import { usePageChrome } from '@/hooks/usePageChrome'
import type { LayoutChromeConfig } from '@/store/layoutChromeStore'

const registerChromeConfig: LayoutChromeConfig = {
    header: { visible: false },
    bottomNav: { visible: false },
    content: { bottomInset: false }
}

export function RegisterLayout({ children }: { children: ReactNode }) {
    usePageChrome(registerChromeConfig)
    return <>{children}</>
}
