import { useEffect } from 'react'

import { getMatchStoreActions } from '@/store/matchStore'
import { createRoomEventHandlers } from './roomEventHandlers'
import { attachRoomSocketListeners } from './roomSocket.listener'
import type { RoomSocket } from './roomSocket.types'

export function useRoomEvents(socket: RoomSocket | null) {
    useEffect(() => {
        if (!socket) {
            return
        }

        const handlers = createRoomEventHandlers(getMatchStoreActions())

        return attachRoomSocketListeners(socket, handlers)
    }, [socket])
}
