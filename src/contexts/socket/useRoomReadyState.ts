import { useEffect, useState } from 'react'
import type { z } from 'zod'
import { ReadyStateChangedSchema } from '@kimdaegyu/babmukdang-shared/domain'
import type { AppSocket } from './types'

type ReadyStateChanged = z.infer<typeof ReadyStateChangedSchema>

export function useRoomReadyState(socket: AppSocket | null) {
    const [readyCount, setReadyCount] = useState(0)
    const [participantCount, setParticipantCount] = useState(0)
    const [isSelfReady, setIsSelfReady] = useState(false)

    useEffect(() => {
        if (!socket) return

        const handleReadyStateChanged = (data: ReadyStateChanged) => {
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
