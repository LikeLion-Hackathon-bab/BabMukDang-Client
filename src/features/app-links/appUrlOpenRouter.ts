import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { resolvePathToActivity } from '@/navigation/routes'

/** Universal Links / App Links 도메인 (ADR 0008) */
export const APP_LINK_HOST = 'app.babmukdang.link'

/**
 * 앱으로 열린 URL이 app.babmukdang.link의 앱 라우트이면 앱 내부 경로를 돌려준다.
 * 다른 호스트, 다른 스킴, 앱에 없는 경로는 null이다.
 */
export const resolveAppLinkPath = (url: string): string | null => {
    let parsed: URL
    try {
        parsed = new URL(url)
    } catch {
        return null
    }

    if (parsed.protocol !== 'https:' || parsed.host !== APP_LINK_HOST) {
        return null
    }

    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`
    return resolvePathToActivity(path) ? path : null
}

/**
 * 네이티브 앱에서 `appUrlOpen`을 받아 앱 라우터로 이동한다. 해제 함수를 돌려준다.
 */
export const registerAppUrlOpenListener = (
    navigate: (path: string) => void
): (() => void) => {
    if (!Capacitor.isNativePlatform()) return () => undefined

    const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
        const path = resolveAppLinkPath(url)
        if (path) navigate(path)
    })

    return () => {
        void listener.then(handle => handle.remove())
    }
}
