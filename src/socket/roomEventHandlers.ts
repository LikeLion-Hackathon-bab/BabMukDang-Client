import type { RoomServerPayload } from './roomSocket.types'
import type { RoomServerEventHandlers } from './roomSocket.listener'
import { MatchStoreActions } from '@/socket/roomStore.adapter'

// socket event handler는 store action만 호출
export function createRoomEventHandlers(
    actions: MatchStoreActions
): RoomServerEventHandlers {
    return {
        'room-assigned': (payload: RoomServerPayload<'room-assigned'>) => {
            actions.setRoomAssigned(payload)
        },

        'join-room': (payload: RoomServerPayload<'join-room'>) => {
            actions.initializeRoom(payload)
        },

        'stage-changed': (payload: RoomServerPayload<'stage-changed'>) => {
            actions.applyStageChanged(payload)
        },

        'ready-state-changed': (
            payload: RoomServerPayload<'ready-state-changed'>
        ) => {
            actions.applyReadyStateChanged(payload)
        },

        'chat-message': (payload: RoomServerPayload<'chat-message'>) => {
            actions.appendChatMessage(payload)
        },

        'date-updated': (payload: RoomServerPayload<'date-updated'>) => {
            actions.applyDateUpdated(payload)
        },

        'time-updated': (payload: RoomServerPayload<'time-updated'>) => {
            actions.applyTimeUpdated(payload)
        },

        'location-add-updated': (
            payload: RoomServerPayload<'location-add-updated'>
        ) => {
            actions.applyLocationCandidateAdded(payload)
        },

        'location-vote-updated': (
            payload: RoomServerPayload<'location-vote-updated'>
        ) => {
            actions.applyLocationVoteUpdated(payload)
        },

        'exclude-menu-updated': (
            payload: RoomServerPayload<'exclude-menu-updated'>
        ) => {
            actions.applyExcludeMenuUpdated(payload)
        },

        'prefer-menu-updated': (
            payload: RoomServerPayload<'prefer-menu-updated'>
        ) => {
            actions.applyPreferMenuUpdated(payload)
        },

        'menu-pick-updated': (
            payload: RoomServerPayload<'menu-pick-updated'>
        ) => {
            actions.applyMenuPickUpdated(payload)
        },

        'restaurant-pick-updated': (
            payload: RoomServerPayload<'restaurant-pick-updated'>
        ) => {
            actions.applyRestaurantPickUpdated(payload)
        },

        'final-state-response': (
            payload: RoomServerPayload<'final-state-response'>
        ) => {
            actions.applyFinalState(payload)
        },

        'final-state-updated': (
            payload: RoomServerPayload<'final-state-updated'>
        ) => {
            actions.applyFinalState(payload)
        },

        'room-progress-updated': (
            payload: RoomServerPayload<'room-progress-updated'>
        ) => {
            actions.applyRoomProgress(payload)
        },

        'decision-candidate-updated': (
            payload: RoomServerPayload<'decision-candidate-updated'>
        ) => {
            actions.applyDecisionCandidateUpdate(payload)
        },

        'menu-candidates-updated': (
            payload: RoomServerPayload<'menu-candidates-updated'>
        ) => {
            actions.applyMenuCandidatesUpdate(payload)
        },

        'restaurant-candidates-updated': (
            payload: RoomServerPayload<'restaurant-candidates-updated'>
        ) => {
            actions.applyRestaurantCandidatesUpdate(payload)
        },

        'room-error': (payload: RoomServerPayload<'room-error'>) => {
            actions.setRoomError(payload)
        }
    }
}
