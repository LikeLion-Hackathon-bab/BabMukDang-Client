import {
    type RoomClientEventName,
    type RoomClientPayload,
    type RoomSocket
} from './roomSocket.types'
import { TimeStringSchema } from '@kimdaegyu/babmukdang-shared/domain/room'

import { parseRoomClientPayload } from './roomSocket.validator'

// Client
//   RoomSocketEmitter/useRoomCommands = event별 사용자 action emit
//   RoomEventHandlers = event별 서버 event 수신 후 store 반영
// SocketContext
//   - socket 연결 생성
//   - socket instance 제공
//   - connect/disconnect 제공

// useRoomEvents
//   - 서버 이벤트 리스너 등록
//   - zod 검증
//   - store action 호출

// useRoomCommands
//   - 클라이언트 이벤트 전송 제공
//   - zod 검증
//   - event name 숨김

// matchStore
//   - 상태 저장
//   - 서버 이벤트 payload 반영
/**
 * UI는 이벤트 이름을 몰라도 작동하도록 emit
 * @example
 * commands.pickDate(selectedDates);
 * commands.pickMenu({ menuIds });
 * commands.readyState(true);
 */
export class RoomSocketEmitter {
    constructor(private readonly socket: RoomSocket) {}

    emit<E extends RoomClientEventName>(
        event: E,
        payload: RoomClientPayload<E>
    ) {
        const parsedPayload = parseRoomClientPayload(event, payload)

        // emit이 클래스 내에서 this 바인딩을 잃어버려서 바인딩 추가
        ;(
            this.socket.emit as (
                event: E,
                payload: RoomClientPayload<E>
            ) => void
        ).call(this.socket, event, parsedPayload)
    }
    readyState(isReady: boolean, taskKey: RoomClientPayload<'ready-state'>['taskKey'] = 'location-candidate') {
        this.emit('ready-state', { taskKey, isReady })
    }

    sendChatMessage(message: string) {
        this.emit('chat-message', { message })
    }

    pickDate(dates: string[]) {
        this.emit('pick-date', { dates })
    }

    pickTimes(times: string[]) {
        this.emit('pick-times', {
            times: times.map(time => TimeStringSchema.parse(time))
        })
    }

    addLocationCandidate(payload: RoomClientPayload<'add-location-candidate'>) {
        this.emit('add-location-candidate', payload)
    }

    voteLocation(payload: RoomClientPayload<'vote-location'>) {
        this.emit('vote-location', payload)
    }

    excludeMenu(payload: RoomClientPayload<'exclude-menu'>) {
        this.emit('exclude-menu', payload)
    }

    pickMenu(payload: RoomClientPayload<'pick-menu'>) {
        this.emit('pick-menu', payload)
    }

    preferMenu(payload: RoomClientPayload<'prefer-menu'>) {
        this.emit('prefer-menu', payload)
    }

    pickRestaurant(payload: RoomClientPayload<'pick-restaurant'>) {
        this.emit('pick-restaurant', payload)
    }

    confirmDecision(payload: RoomClientPayload<'confirm-decision'>) {
        this.emit('confirm-decision', payload)
    }

    reopenTask(payload: RoomClientPayload<'reopen-task'>) {
        this.emit('reopen-task', payload)
    }
}
