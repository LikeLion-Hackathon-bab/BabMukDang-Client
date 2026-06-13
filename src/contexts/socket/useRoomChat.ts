import type { ChatMessageResponse } from '@kimdaegyu/babmukdang-shared/domain/room'

import { useMatchStore } from '@/store/matchStore'

export type ChatMessage = ChatMessageResponse

export function useRoomChat() {
    const chatMessages = useMatchStore(state => state.chatMessages)

    return { chatMessages }
}
