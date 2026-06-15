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
    RoomProgress,
    DecisionCandidateUpdate,
    MenuCandidatesUpdate,
    RestaurantCandidatesUpdate,
    PreferMenuUpdateResponse,
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
    preferMenuPicks: PreferMenuUpdateResponse
    menuPicks: MenuPickUpdateResponse
    restaurantPicks: RestaurantPickUpdateResponse
    finalState: FinalState | null
    progress: RoomProgress | null
    decisionCandidates: DecisionCandidateUpdate['snapshots']
    menuCandidates: MenuCandidatesUpdate['candidates']
    restaurantCandidates: RestaurantCandidatesUpdate['candidates']
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
    applyPreferMenuUpdated(payload: PreferMenuUpdateResponse): void
    applyMenuPickUpdated(payload: MenuPickUpdateResponse): void
    applyRestaurantPickUpdated(payload: RestaurantPickUpdateResponse): void
    applyFinalState(payload: FinalState): void
    applyRoomProgress(payload: RoomProgress): void
    applyDecisionCandidateUpdate(payload: DecisionCandidateUpdate): void
    applyMenuCandidatesUpdate(payload: MenuCandidatesUpdate): void
    applyRestaurantCandidatesUpdate(payload: RestaurantCandidatesUpdate): void
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
    preferMenuPicks: [] as PreferMenuUpdateResponse,
    menuPicks: [] as MenuPickUpdateResponse,
    restaurantPicks: [] as RestaurantPickUpdateResponse,
    finalState: null as FinalState | null,
    progress: null as RoomProgress | null,
    decisionCandidates: [] as DecisionCandidateUpdate['snapshots'],
    menuCandidates: [] as MenuCandidatesUpdate['candidates'],
    restaurantCandidates: [] as RestaurantCandidatesUpdate['candidates'],
    error: null as RoomSocketError | null,
    readyCount: 0,
    participantCount: 0,
    isSelfReady: false
}


const resolveLegacyStageFromProgress = (progress: RoomProgress | null): RoomStage => {
    if (!progress) return 'waiting'
    if (progress.phase === 'finished') return 'finish'

    const isOpen = (key: RoomProgress['tasks'][number]['key']) =>
        progress.tasks.some(
            task => task.key === key && ['open', 'ready'].includes(task.status)
        )

    if (isOpen('restaurant-pick')) return 'restaurant'
    if (isOpen('menu-pick') || isOpen('prefer-menu')) return 'menu'
    if (isOpen('exclude-menu')) return 'exclude-menu'
    if (isOpen('location-vote')) return 'location-vote'
    if (isOpen('location-candidate')) return 'location'
    if (isOpen('schedule-time')) return 'time'
    if (isOpen('schedule-date')) return 'date'
    return 'waiting'
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
            finalState: payload.final,
            progress: payload.progress ?? null
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

    applyPreferMenuUpdated: payload => set({ preferMenuPicks: payload }),

    applyMenuPickUpdated: payload => set({ menuPicks: payload }),

    applyRestaurantPickUpdated: payload => set({ restaurantPicks: payload }),

    applyFinalState: payload => set({ finalState: payload }),

    applyRoomProgress: payload =>
        set(() => {
            const stage = resolveLegacyStageFromProgress(payload)
            const activeTask = payload.tasks.find(task =>
                ['open', 'ready', 'stale'].includes(task.status)
            )

            return {
                progress: payload,
                finalState: payload.final,
                stage,
                readyCount: activeTask?.readyCount ?? 0,
                participantCount:
                    activeTask?.participantCount ?? payload.tasks[0]?.participantCount ?? 0
            }
        }),

    applyDecisionCandidateUpdate: payload =>
        set({ decisionCandidates: payload.snapshots }),

    applyMenuCandidatesUpdate: payload =>
        set({ menuCandidates: payload.candidates }),

    applyRestaurantCandidatesUpdate: payload =>
        set({ restaurantCandidates: payload.candidates }),

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
        applyPreferMenuUpdated: store.applyPreferMenuUpdated,
        applyMenuPickUpdated: store.applyMenuPickUpdated,
        applyRestaurantPickUpdated: store.applyRestaurantPickUpdated,
        applyFinalState: store.applyFinalState,
        applyRoomProgress: store.applyRoomProgress,
        applyDecisionCandidateUpdate: store.applyDecisionCandidateUpdate,
        applyMenuCandidatesUpdate: store.applyMenuCandidatesUpdate,
        applyRestaurantCandidatesUpdate: store.applyRestaurantCandidatesUpdate,
        setRoomError: store.setRoomError
    }
}

export type { MatchStore, RoomStage }
