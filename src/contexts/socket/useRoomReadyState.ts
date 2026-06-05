import { useEffect, useState } from 'react'
import type { ReadyStateChangedDto } from '@kimdaegyu/babmukdang-shared'
import type { AppSocket } from './types'

/**
 * 대기/준비 상태 도메인 훅.
 * - `ready-state-changed`: 방의 준비 인원/전체 인원 갱신
 * - `stage-changed`: 단계 전환 시 본인 준비 상태 초기화
 */
export function useRoomReadyState(socket: AppSocket | null) {
    const [readyCount, setReadyCount] = useState(0)
    const [participantCount, setParticipantCount] = useState(0)
    const [isSelfReady, setIsSelfReady] = useState(false)

    useEffect(() => {
        if (!socket) return

        const handleReadyStateChanged = (data: ReadyStateChangedDto) => {
            setReadyCount(data.readyCount)
            setParticipantCount(data.participantCount)
        }
        const handleStageChanged = () => {
            setIsSelfReady(false)
        }

        socket.on('ready-state-changed', handleReadyStateChanged)
        socket.on('stage-changed', handleStageChanged)

        return () => {
            socket.off('ready-state-changed', handleReadyStateChanged)
            socket.off('stage-changed', handleStageChanged)
        }
    }, [socket])

    return { readyCount, participantCount, isSelfReady, setIsSelfReady }
}
