import type { MatchStoreActions } from '@/socket/roomStore.adapter'
import type {
    ChatMessageResponse,
    DatePicksUpdateResponse,
    ExcludeMenuUpdateResponse,
    FinalState,
    InvitationRoomStage,
    LocationCandidate,
    LocationCandidateAddUpdateResponse,
    LocationCandidateVoteUpdateResponse,
    MenuPickUpdateResponse,
    Participant,
    PhaseDataBroadcast,
    ReadyStateChanged,
    RecruitRoomStage,
    RestaurantPickUpdateResponse,
    RoomAssignedResponse,
    RoomInitialState,
    RoomSocketError,
    TimePicksUpdateResponse
} from '@kimdaegyu/babmukdang-shared/domain/room'
import { create } from 'zustand'

type RoomStage = RecruitRoomStage | InvitationRoomStage

interface MatchStore {
    roomId: string | null
    stage: RoomStage
    phaseData: PhaseDataBroadcast | null
    participants: Participant[]
    chatMessages: ChatMessageResponse[]
    datePicks: DatePicksUpdateResponse
    timePicks: TimePicksUpdateResponse
    locationCandidates: LocationCandidateAddUpdateResponse
    locationVotes: LocationCandidateVoteUpdateResponse
    excludeMenuPicks: ExcludeMenuUpdateResponse
    menuPicks: MenuPickUpdateResponse
    restaurantPicks: RestaurantPickUpdateResponse
    finalState: FinalState | null
    error: RoomSocketError | null
    readyCount: number
    participantCount: number
    isSelfReady: boolean

    setIsSelfReady(isSelfReady: boolean): void
    resetRoomState(): void
    setRoomAssigned(payload: RoomAssignedResponse): void
    initializeRoom(payload: RoomInitialState): void
    applyStageChanged(payload: PhaseDataBroadcast): void
    applyReadyStateChanged(payload: ReadyStateChanged): void
    appendChatMessage(payload: ChatMessageResponse): void
    applyDateUpdated(payload: DatePicksUpdateResponse): void
    applyTimeUpdated(payload: TimePicksUpdateResponse): void
    applyLocationCandidateAdded(
        payload: LocationCandidateAddUpdateResponse
    ): void
    applyLocationVoteUpdated(payload: LocationCandidateVoteUpdateResponse): void
    applyExcludeMenuUpdated(payload: ExcludeMenuUpdateResponse): void
    applyMenuPickUpdated(payload: MenuPickUpdateResponse): void
    applyRestaurantPickUpdated(payload: RestaurantPickUpdateResponse): void
    applyFinalState(payload: FinalState): void
    setRoomError(payload: RoomSocketError): void
}

const initialRoomState = {
    roomId: null,
    stage: 'waiting' as RoomStage,
    phaseData: null,
    participants: [] as Participant[],
    chatMessages: [] as ChatMessageResponse[],
    datePicks: [] as DatePicksUpdateResponse,
    timePicks: [] as TimePicksUpdateResponse,
    locationCandidates: [] as LocationCandidateAddUpdateResponse,
    locationVotes: [] as LocationCandidateVoteUpdateResponse,
    excludeMenuPicks: [] as ExcludeMenuUpdateResponse,
    menuPicks: [] as MenuPickUpdateResponse,
    restaurantPicks: [] as RestaurantPickUpdateResponse,
    finalState: null as FinalState | null,
    error: null as RoomSocketError | null,
    readyCount: 0,
    participantCount: 0,
    isSelfReady: false
}

export const useMatchStore = create<MatchStore>(set => ({
    ...initialRoomState,

    setIsSelfReady: isSelfReady => set({ isSelfReady }),

    resetRoomState: () => set({ ...initialRoomState }),

    setRoomAssigned: payload => set({ roomId: String(payload.roomId) }),

    initializeRoom: payload =>
        set({
            participants: payload.participants,
            participantCount: payload.participants.length,
            chatMessages: payload.chat,
            finalState: payload.final
        }),

    applyStageChanged: payload =>
        set(state => {
            const nextState: Partial<MatchStore> = {
                stage: payload.phase,
                phaseData: payload,
                isSelfReady: false
            }

            switch (payload.phase) {
                case 'date':
                    nextState.datePicks = payload.data
                    break
                case 'time':
                    nextState.timePicks = payload.data
                    break
                case 'location-vote':
                    nextState.locationCandidates = payload.data.locations
                    nextState.locationVotes = payload.data.votes
                    break
                case 'exclude-menu':
                    nextState.excludeMenuPicks =
                        payload.data.excludedMenuList ?? []
                    break
                case 'menu':
                    nextState.menuPicks = payload.data.menuPick
                    break
                case 'restaurant':
                    nextState.restaurantPicks =
                        payload.data.restaurantUserList
                    break
                default:
                    break
            }

            return {
                ...state,
                ...nextState
            }
        }),

    applyReadyStateChanged: payload =>
        set({
            readyCount: payload.readyCount,
            participantCount: payload.participantCount
        }),

    appendChatMessage: payload =>
        set(state => ({
            chatMessages: [...state.chatMessages, payload]
        })),

    applyDateUpdated: payload => set({ datePicks: payload }),

    applyTimeUpdated: payload => set({ timePicks: payload }),

    applyLocationCandidateAdded: payload =>
        set({ locationCandidates: payload }),

    applyLocationVoteUpdated: payload => set({ locationVotes: payload }),

    applyExcludeMenuUpdated: payload => set({ excludeMenuPicks: payload }),

    applyMenuPickUpdated: payload => set({ menuPicks: payload }),

    applyRestaurantPickUpdated: payload => set({ restaurantPicks: payload }),

    applyFinalState: payload => set({ finalState: payload }),

    setRoomError: payload => set({ error: payload })
}))

export function getMatchStoreActions(): MatchStoreActions {
    const store = useMatchStore.getState()

    return {
        setRoomAssigned: store.setRoomAssigned,
        initializeRoom: store.initializeRoom,
        applyStageChanged: store.applyStageChanged,
        applyReadyStateChanged: store.applyReadyStateChanged,
        appendChatMessage: store.appendChatMessage,
        applyDateUpdated: store.applyDateUpdated,
        applyTimeUpdated: store.applyTimeUpdated,
        applyLocationCandidateAdded: store.applyLocationCandidateAdded,
        applyLocationVoteUpdated: store.applyLocationVoteUpdated,
        applyExcludeMenuUpdated: store.applyExcludeMenuUpdated,
        applyMenuPickUpdated: store.applyMenuPickUpdated,
        applyRestaurantPickUpdated: store.applyRestaurantPickUpdated,
        applyFinalState: store.applyFinalState,
        setRoomError: store.setRoomError
    }
}

export type { MatchStore, RoomStage }
