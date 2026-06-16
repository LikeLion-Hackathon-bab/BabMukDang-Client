import type { Socket } from 'socket.io-client'
import type {
    CreateMealPlanVoteRequest,
    MealPlanChatMessageResponse,
    MealPlanDecisionProgress,
    MealPlanDecisionStageResponse,
    MealPlanDecisionTaskKey,
    MealPlanDecisionTaskReadyRequest,
    MealPlanParticipantResponse,
    MealPlanResponse,
    MealPlanStatus,
    SendMealPlanChatMessageRequest
} from '@kimdaegyu/babmukdang-shared/domain'

export type MealPlanClientToServerEvents = {
    'mealPlan:join': (payload: { mealPlanId: string }) => void
    'mealPlan:leave': (payload: { mealPlanId: string }) => void
    'mealPlan:chat:send': (
        payload: SendMealPlanChatMessageRequest & {
            mealPlanId: string
            guestSessionToken?: string
        }
    ) => void
    'mealPlan:participant:ready': (payload: { mealPlanId: string }) => void
    'mealPlan:participant:unready': (payload: { mealPlanId: string }) => void
    'mealPlan:decision:vote': (
        payload: CreateMealPlanVoteRequest & {
            mealPlanId: string
            stageId: string
            guestSessionToken?: string
        }
    ) => void
    'mealPlan:decision:taskReady': (
        payload: MealPlanDecisionTaskReadyRequest & {
            mealPlanId: string
            taskKey: MealPlanDecisionTaskKey
            guestSessionToken?: string
        }
    ) => void
}

export type MealPlanServerToClientEvents = {
    'mealPlan:chat:message': (payload: MealPlanChatMessageResponse) => void
    'mealPlan:participant:joined': (payload: {
        mealPlanId: string
        participant: MealPlanParticipantResponse
    }) => void
    'mealPlan:participant:ready': (payload: {
        mealPlanId: string
        participantId: string
        readyCount: number
        participantCount: number
    }) => void
    'mealPlan:status:changed': (payload: {
        mealPlanId: string
        status: MealPlanStatus
        mealPlan?: MealPlanResponse
    }) => void
    'mealPlan:decision:updated': (payload: {
        mealPlanId: string
        stages: MealPlanDecisionStageResponse[]
        progress?: MealPlanDecisionProgress | null
    }) => void
    'mealPlan:decision:progressUpdated': (payload: {
        mealPlanId: string
        progress: MealPlanDecisionProgress | null
        mealPlan?: MealPlanResponse
    }) => void
    'mealPlan:error': (payload: { code: string; message: string }) => void
}

export type MealPlanSocket = Socket<
    MealPlanServerToClientEvents,
    MealPlanClientToServerEvents
>

export type MealPlanClientEventName = keyof MealPlanClientToServerEvents &
    string
export type MealPlanServerEventName = keyof MealPlanServerToClientEvents &
    string

export type MealPlanClientPayload<E extends MealPlanClientEventName> =
    Parameters<MealPlanClientToServerEvents[E]>[0]

export type MealPlanServerPayload<E extends MealPlanServerEventName> =
    Parameters<MealPlanServerToClientEvents[E]>[0]
