import { fromEvent, map } from 'rxjs'
import type { Socket } from 'socket.io-client'
import type { SocketClientEventMap } from '@kimdaegyu/babmukdang-shared'

export function fromEventTyped<K extends keyof SocketClientEventMap>(
    socket: Socket,
    event: K
) {
    type Payload = SocketClientEventMap[K]
    // socket.io 이벤트의 첫 번째 인자를 그대로 전달합니다.
    // 배열(payload가 Array)인 경우도 그대로 보존하여 단일 요소 배열이 잘못 언랩되는 문제를 방지합니다.
    return fromEvent<unknown>(socket as any, event).pipe(
        map(arg => arg as Payload)
    )
}
