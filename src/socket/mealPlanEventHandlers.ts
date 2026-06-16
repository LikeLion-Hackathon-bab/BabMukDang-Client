import type { MealPlanServerPayload } from './mealPlanSocket.types'
import type { MealPlanServerEventHandlers } from './mealPlanSocket.listener'
import type { MealPlanStoreActions } from '@/store/mealPlanStore'

export function createMealPlanEventHandlers(
    actions: MealPlanStoreActions
): MealPlanServerEventHandlers {
    return {
        'mealPlan:chat:message': (
            payload: MealPlanServerPayload<'mealPlan:chat:message'>
        ) => actions.applyChatMessage(payload),

        'mealPlan:participant:joined': (
            payload: MealPlanServerPayload<'mealPlan:participant:joined'>
        ) => actions.applyParticipantJoined(payload),

        'mealPlan:participant:ready': (
            payload: MealPlanServerPayload<'mealPlan:participant:ready'>
        ) => actions.applyParticipantReady(payload),

        'mealPlan:status:changed': (
            payload: MealPlanServerPayload<'mealPlan:status:changed'>
        ) => actions.applyStatusChanged(payload),

        'mealPlan:decision:updated': (
            payload: MealPlanServerPayload<'mealPlan:decision:updated'>
        ) => actions.applyDecisionUpdated(payload),

        'mealPlan:decision:progressUpdated': (
            payload: MealPlanServerPayload<'mealPlan:decision:progressUpdated'>
        ) => actions.applyDecisionProgressUpdated(payload),

        'mealPlan:error': (payload: MealPlanServerPayload<'mealPlan:error'>) =>
            actions.setMealPlanError(payload)
    }
}
