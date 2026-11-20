import { beforeEach, describe, expect, it, vi } from 'vitest'

const native = vi.hoisted(() => ({
    isNative: true,
    listeners: new Map<string, (event: { url: string }) => void>(),
    remove: vi.fn(async () => undefined)
}))

vi.mock('@capacitor/core', () => ({
    Capacitor: { isNativePlatform: () => native.isNative }
}))
vi.mock('@capacitor/app', () => ({
    App: {
        addListener: vi.fn(
            async (
                eventName: string,
                listener: (event: { url: string }) => void
            ) => {
                native.listeners.set(eventName, listener)
                return { remove: native.remove }
            }
        )
    }
}))

import {
    registerAppUrlOpenListener,
    resolveAppLinkPath
} from './appUrlOpenRouter'

describe('resolveAppLinkPath', () => {
    it('maps app.babmukdang.link app routes to in-app paths', () => {
        expect(
            resolveAppLinkPath(
                'https://app.babmukdang.link/meal-plan-links/share-token/join?from=kakao'
            )
        ).toBe('/meal-plan-links/share-token/join?from=kakao')
    })

    it.each([
        'https://evil.com/meal-plan-links/share-token/join',
        'https://app.babmukdang.link.evil.com/meal-plan-links/a/join',
        'http://app.babmukdang.link/meal-plan-links/a/join',
        'kakao1234://oauth?code=abc',
        'https://app.babmukdang.link/not-an-app-route',
        'not a url'
    ])('ignores %s', url => {
        expect(resolveAppLinkPath(url)).toBeNull()
    })
})

describe('registerAppUrlOpenListener', () => {
    beforeEach(() => {
        native.isNative = true
        native.listeners.clear()
        native.remove.mockClear()
    })

    it('navigates in-app only for app.babmukdang.link routes', async () => {
        const navigate = vi.fn()
        const unregister = registerAppUrlOpenListener(navigate)
        await Promise.resolve()

        const onAppUrlOpen = native.listeners.get('appUrlOpen')
        expect(onAppUrlOpen).toBeDefined()

        onAppUrlOpen?.({
            url: 'https://app.babmukdang.link/meal-plan-links/share-token/join'
        })
        onAppUrlOpen?.({ url: 'https://evil.com/meal-plan-links/x/join' })

        expect(navigate).toHaveBeenCalledTimes(1)
        expect(navigate).toHaveBeenCalledWith(
            '/meal-plan-links/share-token/join'
        )

        unregister()
        await Promise.resolve()
        await Promise.resolve()
        expect(native.remove).toHaveBeenCalledTimes(1)
    })

    it('does nothing on the web', () => {
        native.isNative = false
        registerAppUrlOpenListener(vi.fn())
        expect(native.listeners.size).toBe(0)
    })
})
