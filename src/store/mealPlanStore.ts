import { create } from 'zustand'
import type {
    MealPlanChatMessageResponse,
    MealPlanDecisionProgress,
    MealPlanDecisionStageResponse,
    MealPlanParticipantResponse,
    MealPlanResponse,
    MealPlanStatus
} from '@kimdaegyu/babmukdang-shared/domain'
import type { MealPlanServerPayload } from '@/socket/mealPlanSocket.types'

export interface MealPlanStoreActions {
    setCurrentMealPlan(payload: MealPlanResponse): void
    setChatMessages(payload: MealPlanChatMessageResponse[]): void
    applyChatMessage(payload: MealPlanChatMessageResponse): void
    applyParticipantJoined(
        payload: MealPlanServerPayload<'mealPlan:participant:joined'>
    ): void
    applyParticipantReady(
        payload: MealPlanServerPayload<'mealPlan:participant:ready'>
    ): void
    applyParticipantUnready(
        payload: MealPlanServerPayload<'mealPlan:participant:unready'>
    ): void
    applyStatusChanged(
        payload: MealPlanServerPayload<'mealPlan:status:changed'>
    ): void
    applyDecisionUpdated(
        payload: MealPlanServerPayload<'mealPlan:decision:updated'>
    ): void
    applyDecisionProgressUpdated(
        payload: MealPlanServerPayload<'mealPlan:decision:progressUpdated'>
    ): void
    setMealPlanError(payload: MealPlanServerPayload<'mealPlan:error'>): void
}

export interface MealPlanStore extends MealPlanStoreActions {
    mealPlanId: string | null
    current: MealPlanResponse | null
    participants: MealPlanParticipantResponse[]
    decisionStages: MealPlanDecisionStageResponse[]
    decisionProgress: MealPlanDecisionProgress | null
    chatMessages: MealPlanChatMessageResponse[]
    status: MealPlanStatus | null
    readyCount: number
    participantCount: number
    isSelfReady: boolean
    error: MealPlanServerPayload<'mealPlan:error'> | null
    setIsSelfReady(isSelfReady: boolean): void
    resetMealPlanState(): void
}

const countReadyParticipants = (participants: MealPlanParticipantResponse[]) =>
    participants.filter(participant => participant.status === 'READY').length

const joinedParticipantCount = (participants: MealPlanParticipantResponse[]) =>
    participants.filter(participant =>
        ['JOINED', 'READY'].includes(participant.status)
    ).length

const initialState = {
    mealPlanId: null,
    current: null,
    participants: [] as MealPlanParticipantResponse[],
    decisionStages: [] as MealPlanDecisionStageResponse[],
    decisionProgress: null as MealPlanDecisionProgress | null,
    chatMessages: [] as MealPlanChatMessageResponse[],
    status: null as MealPlanStatus | null,
    readyCount: 0,
    participantCount: 0,
    isSelfReady: false,
    error: null as MealPlanServerPayload<'mealPlan:error'> | null
}

export const useMealPlanStore = create<MealPlanStore>(set => ({
    ...initialState,

    setIsSelfReady: isSelfReady => set({ isSelfReady }),

    resetMealPlanState: () => set({ ...initialState }),

    setCurrentMealPlan: payload =>
        set({
            mealPlanId: payload.mealPlanId,
            current: payload,
            participants: payload.participants,
            decisionStages: payload.decisionStages,
            decisionProgress: payload.decisionProgress ?? null,
            status: payload.status,
            readyCount: countReadyParticipants(payload.participants),
            participantCount: joinedParticipantCount(payload.participants),
            isSelfReady: payload.viewerParticipantStatus === 'READY',
            error: null
        }),

    setChatMessages: payload =>
        set({
            chatMessages: [...payload].sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )
        }),

    applyChatMessage: payload =>
        set(state => {
            const exists = state.chatMessages.some(
                message => message.messageId === payload.messageId
            )
            if (exists) return state
            return { chatMessages: [...state.chatMessages, payload] }
        }),

    applyParticipantJoined: payload =>
        set(state => {
            if (state.mealPlanId && state.mealPlanId !== payload.mealPlanId) {
                return state
            }
            const participants = [
                ...state.participants.filter(
                    participant =>
                        participant.participantId !==
                        payload.participant.participantId
                ),
                payload.participant
            ]
            return {
                mealPlanId: payload.mealPlanId,
                participants,
                participantCount: joinedParticipantCount(participants),
                readyCount: countReadyParticipants(participants)
            }
        }),

    applyParticipantReady: payload =>
        set(state => {
            if (state.mealPlanId && state.mealPlanId !== payload.mealPlanId) {
                return state
            }
            const participants = state.participants.map(participant =>
                participant.participantId === payload.participantId
                    ? {
                          ...participant,
                          status: 'READY' as const,
                          readyAt: new Date().toISOString()
                      }
                    : participant
            )
            const current = state.current
                ? { ...state.current, participants }
                : state.current
            return {
                mealPlanId: payload.mealPlanId,
                current,
                readyCount: payload.readyCount,
                participantCount: payload.participantCount,
                participants
            }
        }),

    applyParticipantUnready: payload =>
        set(state => {
            if (state.mealPlanId && state.mealPlanId !== payload.mealPlanId) {
                return state
            }
            const participants = state.participants.map(participant =>
                participant.participantId === payload.participantId
                    ? {
                          ...participant,
                          status: 'JOINED' as const,
                          readyAt: null
                      }
                    : participant
            )
            const current = state.current
                ? { ...state.current, participants }
                : state.current
            return {
                mealPlanId: payload.mealPlanId,
                current,
                readyCount: payload.readyCount,
                participantCount: payload.participantCount,
                participants
            }
        }),

    applyStatusChanged: payload =>
        set(state => {
            if (state.mealPlanId && state.mealPlanId !== payload.mealPlanId) {
                return state
            }
            const current = payload.mealPlan
                ? payload.mealPlan
                : state.current
                  ? {
                        ...state.current,
                        status: payload.status,
                        viewerPermissions: {
                            ...state.current.viewerPermissions,
                            canConfirmMealPlan:
                                state.current.viewerRole === 'OWNER' &&
                                payload.status === 'READY'
                        }
                    }
                  : null
            const participants = payload.mealPlan?.participants ?? state.participants
            return {
                mealPlanId: payload.mealPlanId,
                current,
                status: payload.status,
                participants,
                readyCount: countReadyParticipants(participants),
                participantCount: joinedParticipantCount(participants),
                decisionStages:
                    payload.mealPlan?.decisionStages ?? state.decisionStages,
                decisionProgress:
                    payload.mealPlan?.decisionProgress ?? state.decisionProgress,
                isSelfReady:
                    payload.mealPlan?.viewerParticipantStatus === 'READY'
                        ? true
                        : payload.mealPlan
                          ? false
                          : state.isSelfReady
            }
        }),

    applyDecisionUpdated: payload =>
        set(state => {
            if (state.mealPlanId && state.mealPlanId !== payload.mealPlanId) {
                return state
            }
            return {
                mealPlanId: payload.mealPlanId,
                decisionStages: payload.stages,
                decisionProgress: payload.progress ?? null
            }
        }),

    applyDecisionProgressUpdated: payload =>
        set(state => {
            if (state.mealPlanId && state.mealPlanId !== payload.mealPlanId) {
                return state
            }
            return {
                mealPlanId: payload.mealPlanId,
                current: payload.mealPlan ?? state.current,
                decisionProgress: payload.progress,
                decisionStages:
                    payload.mealPlan?.decisionStages ?? state.decisionStages,
                participants:
                    payload.mealPlan?.participants ?? state.participants,
                status: payload.mealPlan?.status ?? state.status,
                isSelfReady:
                    payload.mealPlan?.viewerParticipantStatus === 'READY'
                        ? true
                        : payload.mealPlan
                          ? false
                          : state.isSelfReady
            }
        }),

    setMealPlanError: payload => set({ error: payload })
}))

export function getMealPlanStoreActions(): MealPlanStoreActions {
    const store = useMealPlanStore.getState()

    return {
        setCurrentMealPlan: store.setCurrentMealPlan,
        setChatMessages: store.setChatMessages,
        applyChatMessage: store.applyChatMessage,
        applyParticipantJoined: store.applyParticipantJoined,
        applyParticipantReady: store.applyParticipantReady,
        applyParticipantUnready: store.applyParticipantUnready,
        applyStatusChanged: store.applyStatusChanged,
        applyDecisionUpdated: store.applyDecisionUpdated,
        applyDecisionProgressUpdated: store.applyDecisionProgressUpdated,
        setMealPlanError: store.setMealPlanError
    }
}
