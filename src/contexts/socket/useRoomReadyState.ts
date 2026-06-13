import { useMatchStore } from '@/store/matchStore'

export function useRoomReadyState() {
    const readyCount = useMatchStore(state => state.readyCount)
    const participantCount = useMatchStore(state => state.participantCount)
    const isSelfReady = useMatchStore(state => state.isSelfReady)
    const setIsSelfReady = useMatchStore(state => state.setIsSelfReady)

    return { readyCount, participantCount, isSelfReady, setIsSelfReady }
}
