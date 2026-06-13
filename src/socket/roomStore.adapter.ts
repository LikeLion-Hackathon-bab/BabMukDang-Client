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
    MenuPickUpdateResponse,
    RestaurantPickUpdateResponse,
    FinalState,
    RoomSocketError
} from '@kimdaegyu/babmukdang-shared/domain/room'

// socket layer가 Zustand 구현에 직접 끌려가지 않도록 어댑터로 분리
// store 전체를 노출하지 말고, socket이 필요한 action만 노출하는 인터페이스
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
    applyMenuPickUpdated(payload: MenuPickUpdateResponse): void
    applyRestaurantPickUpdated(payload: RestaurantPickUpdateResponse): void
    applyFinalState(payload: FinalState): void
    setRoomError(payload: RoomSocketError): void
}
