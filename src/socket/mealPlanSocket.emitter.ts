import type {
    MealPlanClientEventName,
    MealPlanClientPayload,
    MealPlanSocket
} from './mealPlanSocket.types'
import { parseMealPlanClientPayload } from './mealPlanSocket.validator'

/**
 * UI가 socket event name을 직접 알지 않아도 MealPlan 실시간 명령을 보낼 수 있게 하는 얇은 adapter.
 */
export class MealPlanSocketEmitter {
    constructor(private readonly socket: MealPlanSocket) {}

    emit<E extends MealPlanClientEventName>(
        event: E,
        payload: MealPlanClientPayload<E>
    ) {
        const parsedPayload = parseMealPlanClientPayload(event, payload)
        ;(
            this.socket.emit as (
                event: E,
                payload: MealPlanClientPayload<E>
            ) => void
        ).call(this.socket, event, parsedPayload)
    }

    join(mealPlanId: string) {
        this.emit('mealPlan:join', { mealPlanId })
    }

    leave(mealPlanId: string) {
        this.emit('mealPlan:leave', { mealPlanId })
    }

    sendChatMessage(payload: MealPlanClientPayload<'mealPlan:chat:send'>) {
        this.emit('mealPlan:chat:send', payload)
    }

    ready(mealPlanId: string) {
        this.emit('mealPlan:participant:ready', { mealPlanId })
    }

    unready(mealPlanId: string) {
        this.emit('mealPlan:participant:unready', { mealPlanId })
    }

    vote(payload: MealPlanClientPayload<'mealPlan:decision:vote'>) {
        this.emit('mealPlan:decision:vote', payload)
    }

    taskReady(payload: MealPlanClientPayload<'mealPlan:decision:taskReady'>) {
        this.emit('mealPlan:decision:taskReady', payload)
    }
}
