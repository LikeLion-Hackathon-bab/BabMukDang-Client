import { useLayoutEffect } from 'react'
import { useNavigationActivityContext } from '@/navigation/NavigationActivityContext'
import {
    type LayoutChromeConfig,
    useLayoutChromeStore
} from '@/store/layoutChromeStore'

/**
 * Page chrome belongs to the activity that renders the page. Keeping this value
 * until that activity unmounts prevents an exiting Stackflow activity from
 * borrowing the entering activity's header during the transition.
 */
export function usePageChrome(config: LayoutChromeConfig) {
    const activity = useNavigationActivityContext()
    const setPageChromeConfig = useLayoutChromeStore(
        state => state.setPageChromeConfig
    )
    const clearPageChromeConfig = useLayoutChromeStore(
        state => state.clearPageChromeConfig
    )

    useLayoutEffect(() => {
        const activityId = activity?.activityId
        if (!activityId) return

        setPageChromeConfig(config, activityId)

        return () => {
            clearPageChromeConfig(activityId)
        }
    }, [activity?.activityId, clearPageChromeConfig, config, setPageChromeConfig])
}
