import { useEffect } from 'react'
import { getMealPlanStoreActions } from '@/store/mealPlanStore'
import { createMealPlanEventHandlers } from './mealPlanEventHandlers'
import { attachMealPlanSocketListeners } from './mealPlanSocket.listener'
import type { MealPlanSocket } from './mealPlanSocket.types'

export function useMealPlanEvents(socket: MealPlanSocket | null) {
    useEffect(() => {
        if (!socket) return

        const handlers = createMealPlanEventHandlers(getMealPlanStoreActions())
        return attachMealPlanSocketListeners(socket, handlers)
    }, [socket])
}
