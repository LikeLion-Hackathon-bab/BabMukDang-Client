import { useLayoutEffect } from 'react'
import { useNavigationActivityContext } from '@/navigation/NavigationActivityContext'
import {
    type LayoutChromeConfig,
    useLayoutChromeStore
} from '@/store/layoutChromeStore'

export function usePageChrome(config: LayoutChromeConfig) {
    const activity = useNavigationActivityContext()
    const setPageChromeConfig = useLayoutChromeStore(
        state => state.setPageChromeConfig
    )
    const clearPageChromeConfig = useLayoutChromeStore(
        state => state.clearPageChromeConfig
    )

    useLayoutEffect(() => {
        if (!activity?.isTop) return
        setPageChromeConfig(config, activity.activityId)

        return () => {
            clearPageChromeConfig(activity.activityId)
        }
    }, [
        activity?.activityId,
        activity?.isTop,
        clearPageChromeConfig,
        config,
        setPageChromeConfig
    ])
}
