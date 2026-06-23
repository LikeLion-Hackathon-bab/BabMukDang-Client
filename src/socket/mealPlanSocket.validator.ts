import { z } from 'zod'
import {
    MealPlanDecisionVoteSocketAckSchema,
    MealPlanDecisionVoteSocketEvent,
    MealPlanDecisionVoteSocketPayloadSchema
} from '@kimdaegyu/babmukdang-shared/domain'

import type {
    MealPlanClientEventName,
    MealPlanClientPayload,
    MealPlanServerEventName,
    MealPlanServerPayload
} from './mealPlanSocket.types'

const MealPlanIdPayloadSchema = z.object({ mealPlanId: z.string().uuid() })

export const MealPlanSocketClientEventSchemas = {
    'mealPlan:join': MealPlanIdPayloadSchema,
    'mealPlan:leave': MealPlanIdPayloadSchema,
    'mealPlan:chat:send': z.object({
        mealPlanId: z.string().uuid(),
        message: z.string().min(1),
        guestSessionToken: z.string().min(1).optional()
    }),
    'mealPlan:participant:ready': MealPlanIdPayloadSchema,
    'mealPlan:participant:unready': MealPlanIdPayloadSchema,
    [MealPlanDecisionVoteSocketEvent]: MealPlanDecisionVoteSocketPayloadSchema
}

export const MealPlanSocketServerEventSchemas = {
    'mealPlan:chat:message': z.any(),
    'mealPlan:participant:joined': z.object({
        mealPlanId: z.string().uuid(),
        participant: z.any()
    }),
    'mealPlan:participant:ready': z.object({
        mealPlanId: z.string().uuid(),
        participantId: z.string().uuid(),
        readyCount: z.number().int().min(0),
        participantCount: z.number().int().min(0)
    }),
    'mealPlan:participant:unready': z.object({
        mealPlanId: z.string().uuid(),
        participantId: z.string().uuid(),
        readyCount: z.number().int().min(0),
        participantCount: z.number().int().min(0)
    }),
    'mealPlan:status:changed': z.object({
        mealPlanId: z.string().uuid(),
        status: z.string().min(1),
        mealPlan: z.any().optional()
    }),
    'mealPlan:decision:updated': z.object({
        mealPlanId: z.string().uuid(),
        stages: z.array(z.any()),
        progress: z.any().nullish()
    }),
    'mealPlan:decision:progressUpdated': z.object({
        mealPlanId: z.string().uuid(),
        progress: z.any().nullable(),
        mealPlan: z.any().optional()
    }),
    'mealPlan:error': z.object({
        code: z.string().min(1),
        message: z.string().min(1)
    })
}

export function parseMealPlanClientPayload<E extends MealPlanClientEventName>(
    event: E,
    payload: unknown
): MealPlanClientPayload<E> {
    return MealPlanSocketClientEventSchemas[event].parse(
        payload
    ) as MealPlanClientPayload<E>
}

export function safeParseMealPlanServerPayload<
    E extends MealPlanServerEventName
>(event: E, payload: unknown) {
    return MealPlanSocketServerEventSchemas[event].safeParse(payload)
}

export type ParsedMealPlanServerPayload<E extends MealPlanServerEventName> =
    MealPlanServerPayload<E>
export function parseMealPlanDecisionVoteSocketAck(payload: unknown) {
    return MealPlanDecisionVoteSocketAckSchema.parse(payload)
}
