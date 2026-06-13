import type {
    RoomServerEventName,
    RoomServerPayload,
    RoomSocket
} from './roomSocket.types'
import { safeParseRoomServerPayload } from './roomSocket.validator'

export type RoomServerEventHandler<E extends RoomServerEventName> = (
    payload: RoomServerPayload<E>
) => void

export type RoomServerEventHandlers = {
    [E in RoomServerEventName]?: RoomServerEventHandler<E>
}

export function attachRoomSocketListeners(
    socket: RoomSocket,
    handlers: RoomServerEventHandlers
) {
    const cleanupFns: Array<() => void> = []

    for (const event of Object.keys(handlers) as RoomServerEventName[]) {
        const handler = handlers[event]

        if (!handler) {
            continue
        }

        const listener = (rawPayload: unknown) => {
            const result = safeParseRoomServerPayload(event, rawPayload)

            if (!result.success) {
                console.error('[room-socket] invalid server payload', {
                    event,
                    error: result.error,
                    payload: rawPayload
                })
                return
            }

            // cast가 adapter 내부 한 곳에만 갇혀 있어야 한다
            handler(result.data as never)
        }

        socket.on(event, listener as never)
        cleanupFns.push(() => socket.off(event, listener as never))
    }

    return () => {
        for (const cleanup of cleanupFns) {
            cleanup()
        }
    }
}
