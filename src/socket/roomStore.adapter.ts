import type {
    RoomAssignedResponse,
    RoomInitialState,
    PhaseDataBroadcast,
    ReadyStateChanged,
    ChatMessageResponse,
    DatePicksUpdateResponse,
    TimePicksUpdateResponse,
    LocationCandidateAddUpdateResponse,
    LocationCandidateVoteUpdateResponse,
    ExcludeMenuUpdateResponse,
    PreferMenuUpdateResponse,
    MenuPickUpdateResponse,
    RestaurantPickUpdateResponse,
    FinalState,
    RoomSocketError,
    RoomProgress,
    DecisionCandidateUpdate,
    MenuCandidatesUpdate,
    RestaurantCandidatesUpdate
} from '@kimdaegyu/babmukdang-shared/domain/room'

export interface MatchStoreActions {
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
