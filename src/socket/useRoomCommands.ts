import { useMemo } from 'react'

import { RoomSocketEmitter } from './roomSocket.emitter'
import type { RoomSocket } from './roomSocket.types'

export function useRoomCommands(socket: RoomSocket | null) {
    return useMemo(() => {
        if (!socket) {
            return null
        }

        const emitter = new RoomSocketEmitter(socket)

        return {
            readyState: (isReady: boolean, taskKey?: Parameters<typeof emitter.readyState>[1]) =>
                emitter.readyState(isReady, taskKey),
            sendChatMessage: (message: string) =>
                emitter.sendChatMessage(message),
            pickDate: (dates: string[]) => emitter.pickDate(dates),
            pickTimes: (times: string[]) => emitter.pickTimes(times),
            addLocationCandidate: (
                payload: Parameters<typeof emitter.addLocationCandidate>[0]
            ) => emitter.addLocationCandidate(payload),
            voteLocation: (
                payload: Parameters<typeof emitter.voteLocation>[0]
            ) => emitter.voteLocation(payload),
            excludeMenu: (payload: Parameters<typeof emitter.excludeMenu>[0]) =>
                emitter.excludeMenu(payload),
            preferMenu: (payload: Parameters<typeof emitter.preferMenu>[0]) =>
                emitter.preferMenu(payload),
            pickMenu: (payload: Parameters<typeof emitter.pickMenu>[0]) =>
                emitter.pickMenu(payload),
            pickRestaurant: (
                payload: Parameters<typeof emitter.pickRestaurant>[0]
            ) => emitter.pickRestaurant(payload),
            confirmDecision: (
                payload: Parameters<typeof emitter.confirmDecision>[0]
            ) => emitter.confirmDecision(payload),
            reopenTask: (payload: Parameters<typeof emitter.reopenTask>[0]) =>
                emitter.reopenTask(payload)
        }
    }, [socket])
}

export type RoomCommands = NonNullable<ReturnType<typeof useRoomCommands>>
