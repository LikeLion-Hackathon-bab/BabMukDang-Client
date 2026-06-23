import { useMemo } from 'react'
import { MealPlanSocketEmitter } from './mealPlanSocket.emitter'
import type { MealPlanSocket } from './mealPlanSocket.types'

export function useMealPlanCommands(socket: MealPlanSocket | null) {
    return useMemo(() => {
        if (!socket) return null
        const emitter = new MealPlanSocketEmitter(socket)
        return {
            join: (mealPlanId: string) => emitter.join(mealPlanId),
            leave: (mealPlanId: string) => emitter.leave(mealPlanId),
            sendChatMessage: (
                payload: Parameters<typeof emitter.sendChatMessage>[0]
            ) => emitter.sendChatMessage(payload),
            ready: (mealPlanId: string) => emitter.ready(mealPlanId),
            unready: (mealPlanId: string) => emitter.unready(mealPlanId),
            vote: (payload: Parameters<typeof emitter.vote>[0]) =>
                emitter.vote(payload)
        }
    }, [socket])
}

export type MealPlanCommands = NonNullable<
    ReturnType<typeof useMealPlanCommands>
>
