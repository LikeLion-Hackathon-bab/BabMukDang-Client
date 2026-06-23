import type {
    MealPlanClientEventName,
    MealPlanClientPayload,
    MealPlanSocket
} from './mealPlanSocket.types'
import {
    parseMealPlanClientPayload,
    parseMealPlanDecisionVoteSocketAck
} from './mealPlanSocket.validator'
import { MealPlanDecisionVoteSocketEvent } from '@kimdaegyu/babmukdang-shared/domain'
import type { MealPlanResponse } from '@kimdaegyu/babmukdang-shared/domain'

export class MealPlanSocketCommandError extends Error {
    constructor(
        readonly code: string,
        message: string
    ) {
        super(message)
        this.name = 'MealPlanSocketCommandError'
    }
}

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
            this.socket.emit as unknown as (
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

    async vote(
        payload: MealPlanClientPayload<typeof MealPlanDecisionVoteSocketEvent>
    ): Promise<MealPlanResponse> {
        const parsedPayload = parseMealPlanClientPayload(
            MealPlanDecisionVoteSocketEvent,
            payload
        )

        let rawAck: unknown
        try {
            rawAck = await this.socket
                .timeout(10_000)
                .emitWithAck(MealPlanDecisionVoteSocketEvent, parsedPayload)
        } catch {
            throw new Error('실시간 투표 요청이 시간 안에 완료되지 않았습니다.')
        }

        try {
            const ack = parseMealPlanDecisionVoteSocketAck(rawAck)
            if (!ack.ok) {
                throw new MealPlanSocketCommandError(
                    ack.error.code,
                    ack.error.message
                )
            }
            return ack.mealPlan
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error('실시간 투표 응답을 해석하지 못했습니다.')
        }
    }
}
