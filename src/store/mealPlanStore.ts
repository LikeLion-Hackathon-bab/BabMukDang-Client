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

type MealPlanViewerField =
    | 'viewerRole'
    | 'viewerParticipantStatus'
    | 'viewerPermissions'

/**
 * Room broadcast는 모든 참여자에게 같은 mealPlan을 보내므로 viewer 전용 필드가
 * viewer-neutral 값이다. Backend는 Shared 스키마를 지키기 위해 viewer 없이 만든
 * 응답(viewerRole 'NONE', viewerParticipantStatus null, 모든 권한 false)을 보낸다.
 * ack/REST 응답은 개인화된 MealPlanResponse다.
 */
type RoomMealPlan = Omit<MealPlanResponse, MealPlanViewerField> & {
    [K in MealPlanViewerField]?: MealPlanResponse[K] | null
}

const isViewerNeutral = (mealPlan: RoomMealPlan) =>
    mealPlan.viewerRole == null || mealPlan.viewerRole === 'NONE'

/**
 * Broadcast mealPlan의 공용 필드는 반영하되, viewer 필드는 현재 클라이언트가
 * 가진 값을 유지한다(브로드캐스트의 권한 값은 viewer-neutral이라 쓰지 않는다).
 * 병합할 기준 상태가 없으면 null을 반환한다.
 */
const mergeRoomMealPlan = (
    current: MealPlanResponse | null,
    incoming: RoomMealPlan
): MealPlanResponse | null => {
    if (!isViewerNeutral(incoming)) return incoming as MealPlanResponse
    if (!current || current.mealPlanId !== incoming.mealPlanId) return null

    return {
        ...incoming,
        viewerRole: current.viewerRole,
        viewerParticipantStatus: current.viewerParticipantStatus,
        viewerPermissions: {
            ...current.viewerPermissions,
            canConfirmMealPlan:
                current.viewerRole === 'OWNER' && incoming.status === 'READY'
        }
    }
}

const nextIsSelfReady = (
    incoming: RoomMealPlan | undefined,
    isSelfReady: boolean
) =>
    incoming && !isViewerNeutral(incoming)
        ? incoming.viewerParticipantStatus === 'READY'
        : isSelfReady

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
            const roomMealPlan = payload.mealPlan
                ? mergeRoomMealPlan(state.current, payload.mealPlan)
                : null
            const current = roomMealPlan
                ? roomMealPlan
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
            const participants =
                payload.mealPlan?.participants ?? state.participants
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
                    payload.mealPlan?.decisionProgress ??
                    state.decisionProgress,
                isSelfReady: nextIsSelfReady(
                    payload.mealPlan,
                    state.isSelfReady
                )
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
                current: payload.mealPlan
                    ? (mergeRoomMealPlan(state.current, payload.mealPlan) ??
                      state.current)
                    : state.current,
                decisionProgress: payload.progress,
                decisionStages:
                    payload.mealPlan?.decisionStages ?? state.decisionStages,
                participants:
                    payload.mealPlan?.participants ?? state.participants,
                status: payload.mealPlan?.status ?? state.status,
                isSelfReady: nextIsSelfReady(
                    payload.mealPlan,
                    state.isSelfReady
                )
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
