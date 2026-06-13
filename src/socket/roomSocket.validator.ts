import {
    RoomSocketClientEventSchemas,
    RoomSocketServerEventSchemas
} from '@kimdaegyu/babmukdang-shared/domain'
import type {
    RoomClientEventName,
    RoomClientPayload,
    RoomServerEventName,
    RoomServerPayload
} from './roomSocket.types'

export function parseRoomClientPayload<E extends RoomClientEventName>(
    event: E,
    payload: unknown
): RoomClientPayload<E> {
    return RoomSocketClientEventSchemas[event].parse(
        payload
    ) as RoomClientPayload<E>
}

export function parseRoomServerPayload<E extends RoomServerEventName>(
    event: E,
    payload: unknown
): RoomServerPayload<E> {
    return RoomSocketServerEventSchemas[event].parse(
        payload
    ) as RoomServerPayload<E>
}

export function safeParseRoomServerPayload<E extends RoomServerEventName>(
    event: E,
    payload: unknown
) {
    return RoomSocketServerEventSchemas[event].safeParse(payload)
}
