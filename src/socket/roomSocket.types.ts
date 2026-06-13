import type { Socket } from 'socket.io-client'
import type {
    RoomClientToServerEvents,
    RoomServerToClientEvents
} from '@kimdaegyu/babmukdang-shared/domain/room'

export type RoomSocket = Socket<
    RoomServerToClientEvents,
    RoomClientToServerEvents
>

export type RoomClientEventName = keyof RoomClientToServerEvents & string

export type RoomServerEventName = keyof RoomServerToClientEvents & string

export type RoomClientPayload<E extends RoomClientEventName> = Parameters<
    RoomClientToServerEvents[E]
>[0]

export type RoomServerPayload<E extends RoomServerEventName> = Parameters<
    RoomServerToClientEvents[E]
>[0]
