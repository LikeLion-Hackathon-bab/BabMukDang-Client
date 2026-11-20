import type {
    MealPlanServerEventName,
    MealPlanServerPayload,
    MealPlanSocket
} from './mealPlanSocket.types'
import { safeParseMealPlanServerPayload } from './mealPlanSocket.validator'

export type MealPlanServerEventHandler<E extends MealPlanServerEventName> = (
    payload: MealPlanServerPayload<E>
) => void

export type MealPlanServerEventHandlers = {
    [E in MealPlanServerEventName]?: MealPlanServerEventHandler<E>
}

export function attachMealPlanSocketListeners(
    socket: MealPlanSocket,
    handlers: MealPlanServerEventHandlers
) {
    const cleanupFns: Array<() => void> = []

    for (const event of Object.keys(handlers) as MealPlanServerEventName[]) {
        const handler = handlers[event]

        if (!handler) continue

        const listener = (rawPayload: unknown) => {
            const result = safeParseMealPlanServerPayload(event, rawPayload)

            if (!result.success) {
                console.error('[meal-plan-socket] invalid server payload', {
                    event,
                    error: result.error,
                    payload: rawPayload
                })
                return
            }

            handler(result.data as never)
        }

        socket.on(event, listener as never)
        cleanupFns.push(() => socket.off(event, listener as never))
    }

    return () => {
        for (const cleanup of cleanupFns) {
            cleanup()
        }
    }
}
