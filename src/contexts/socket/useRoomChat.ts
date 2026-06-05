import { useEffect, useState } from 'react'
import type {
    ChatMessage,
    ChatMessageResponseItem,
    RoomInitialState
} from '@kimdaegyu/babmukdang-shared'
import type { AppSocket } from './types'

/**
 * 채팅 도메인 훅.
 * - `join-room`: 입장 시 채팅 히스토리 seed (`RoomInitialState.chat`)
 * - `chat-message`: 신규 메시지 append
 */
export function useRoomChat(socket: AppSocket | null) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

    useEffect(() => {
        if (!socket) return

        const handleJoinRoom = (state: RoomInitialState) => {
            setChatMessages(state.chat)
        }
        const handleChatMessage = (message: ChatMessageResponseItem) => {
            setChatMessages(prev => [...prev, message])
        }

        socket.on('join-room', handleJoinRoom)
        socket.on('chat-message', handleChatMessage)

        return () => {
            socket.off('join-room', handleJoinRoom)
            socket.off('chat-message', handleChatMessage)
        }
    }, [socket])

    return { chatMessages }
}
