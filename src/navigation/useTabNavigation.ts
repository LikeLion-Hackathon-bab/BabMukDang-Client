import { useCallback } from 'react'
import { useFlow, useStack } from '@stackflow/react'
import { resolvePathToActivity } from './routes'

export const TAB_ROOT_PATHS = [
    '/home',
    '/meeting',
    '/friend',
    '/meal-map',
    '/profile'
] as const

export type TabRootPath = (typeof TAB_ROOT_PATHS)[number]

const isTabRootPath = (path: string): path is TabRootPath =>
    TAB_ROOT_PATHS.includes(path as TabRootPath)

export function useTabNavigation() {
    const stack = useStack()
    const { pop, replace } = useFlow()

    return useCallback(
        (targetPath: TabRootPath) => {
            if (!isTabRootPath(targetPath)) {
                throw new Error(`INVALID_TAB_ROOT_PATH:${targetPath}`)
            }

            const target = resolvePathToActivity(targetPath)

            if (!target) {
                throw new Error(`UNRESOLVED_TAB_TARGET:${targetPath}`)
            }

            const activeActivities = stack.activities.filter(
                activity => activity.transitionState !== 'exit-done'
            )

            const currentActivity =
                activeActivities.find(activity => activity.isTop) ??
                activeActivities[activeActivities.length - 1]

            const isAlreadyCurrentTab =
                currentActivity?.name === target.route.name

            if (isAlreadyCurrentTab) {
                return
            }

            const popCount = Math.max(0, activeActivities.length - 1)

            if (popCount > 0) {
                pop(popCount, { animate: false })
            }

            replace(target.route.name, target.params, {
                animate: false
            })
        },
        [pop, replace, stack.activities]
    )
}
