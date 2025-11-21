import { create } from 'zustand'
import { PhaseDataBroadcastDto, User } from '@kimdaegyu/babmukdang-shared'

interface MatchStore {
    roomInfo: {
        roomId: string
        roomUsers: User[]
    }
    phase: number
    phaseData: PhaseDataBroadcastDto | null
    isSelfReady: boolean
    setRoomInfo: (roomUsers: User[]) => void
    setPhase: (phase: number) => void
    setPhaseData: (phaseData: PhaseDataBroadcastDto) => void
    setIsSelfReady: (isSelfReady: boolean) => void
}

export const useMatchStore = create<MatchStore>(set => ({
    roomInfo: {
        roomId: '',
        roomUsers: []
    },
    phase: 0,
    phaseData: null,
    isSelfReady: false,
    setRoomInfo: roomUsers =>
        set({ roomInfo: { ...useMatchStore.getState().roomInfo, roomUsers } }),
    setPhase: phase => set({ phase }),
    setPhaseData: phaseData => set({ phaseData }),
    setIsSelfReady: isSelfReady => set({ isSelfReady })
}))
