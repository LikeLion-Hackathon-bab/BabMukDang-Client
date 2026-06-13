import type { Socket } from 'socket.io-client'
import type {
    RoomClientToServerEvents,
    RoomServerToClientEvents
} from '@kimdaegyu/babmukdang-shared/domain/room'

export type AppSocket = Socket<RoomServerToClientEvents, RoomClientToServerEvents>
