import { useLayoutEffect } from 'react'
import {
    type LayoutChromeConfig,
    useLayoutChromeStore
} from '@/store/layoutChromeStore'

export function usePageChrome(config: LayoutChromeConfig) {
    const setPageChromeConfig = useLayoutChromeStore(
        state => state.setPageChromeConfig
    )
    const clearPageChromeConfig = useLayoutChromeStore(
        state => state.clearPageChromeConfig
    )

    useLayoutEffect(() => {
        setPageChromeConfig(config)

        return () => {
            clearPageChromeConfig()
        }
    }, [setPageChromeConfig, clearPageChromeConfig, config])
}
