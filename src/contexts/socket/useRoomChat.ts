import { useEffect, useState } from 'react'
import type {
    ChatMessageResponse,
    RoomInitialState
} from '@kimdaegyu/babmukdang-shared/domain'
import type { AppSocket } from './types'

export type ChatMessage = ChatMessageResponse

export function useRoomChat(socket: AppSocket | null) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

    useEffect(() => {
        if (!socket) return

        const handleJoinRoom = (state: RoomInitialState) => {
            setChatMessages(state.chat)
        }
        const handleChatMessage = (message: ChatMessageResponse) => {
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
