import type { Socket } from 'socket.io-client'
import type {
    ClientToServerEvents,
    ServerToClientEvents
} from '@kimdaegyu/babmukdang-shared'

/**
 * Backend gateway 계약(Shared)으로 타입이 고정된 socket.io 클라이언트 소켓.
 * - listen(수신) 이벤트: 서버 → 클라이언트(`ServerToClientEvents`)
 * - emit(송신) 이벤트: 클라이언트 → 서버(`ClientToServerEvents`)
 */
export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>
