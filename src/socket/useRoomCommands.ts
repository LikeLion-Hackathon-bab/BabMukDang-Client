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
            readyState: (isReady: boolean) => emitter.readyState(isReady),
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
            pickMenu: (payload: Parameters<typeof emitter.pickMenu>[0]) =>
                emitter.pickMenu(payload),
            pickRestaurant: (
                payload: Parameters<typeof emitter.pickRestaurant>[0]
            ) => emitter.pickRestaurant(payload)
        }
    }, [socket])
}

export type RoomCommands = NonNullable<ReturnType<typeof useRoomCommands>>
