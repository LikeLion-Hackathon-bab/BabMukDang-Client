const PENDING_PUSH_DEEP_LINK_KEY = 'babmukdang-pending-push-deep-link'

export const normalizePushDeepLink = (deepLink: string): string => {
    try {
        const url = new URL(deepLink, window.location.origin)
        return `${url.pathname}${url.search}${url.hash}`
    } catch {
        return deepLink.startsWith('/') ? deepLink : `/home`
    }
}

export const savePendingPushDeepLink = (deepLink: string) => {
    window.sessionStorage.setItem(
        PENDING_PUSH_DEEP_LINK_KEY,
        normalizePushDeepLink(deepLink)
    )
}

export const consumePendingPushDeepLink = () => {
    const deepLink = window.sessionStorage.getItem(PENDING_PUSH_DEEP_LINK_KEY)
    if (deepLink) {
        window.sessionStorage.removeItem(PENDING_PUSH_DEEP_LINK_KEY)
    }
    return deepLink
}
