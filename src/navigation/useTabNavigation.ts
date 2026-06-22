import { useCallback } from 'react'
import { useFlow, useStack } from '@stackflow/react'
import { resolvePathToActivity } from './routes'

export const TAB_ROOT_PATHS = [
    '/home',
    '/meeting',
    '/friend',
    '/profile'
] as const

export type TabRootPath = (typeof TAB_ROOT_PATHS)[number]

const isTabRootPath = (path: string): path is TabRootPath =>
    TAB_ROOT_PATHS.includes(path as TabRootPath)

export function useTabNavigation() {
    const stack = useStack()
    const { pop, replace } = useFlow()

    return useCallback(
        (targetPath: TabRootPath | string) => {
            if (
                !isTabRootPath(targetPath) &&
                !targetPath.startsWith('/meal-plans/')
            ) {
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
                currentActivity?.name === target.route.name &&
                JSON.stringify(currentActivity.params ?? {}) ===
                    JSON.stringify(target.params)

            if (isAlreadyCurrentTab) {
                return
            }

            const shouldResetToTabRoot = isTabRootPath(targetPath)
            const popCount = shouldResetToTabRoot
                ? Math.max(0, activeActivities.length - 1)
                : 0

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
