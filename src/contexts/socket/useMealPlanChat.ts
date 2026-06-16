import { useSocket } from '@/contexts/SocketContext'
import { useMealPlanStore } from '@/store/mealPlanStore'

export function useMealPlanChat(mealPlanId?: string) {
    const messages = useMealPlanStore(state => state.chatMessages)
    const { commands, guestSessionToken } = useSocket()
    const sendMessage = (message: string) => {
        const trimmed = message.trim()
        if (!mealPlanId || !trimmed) return
        if (guestSessionToken) {
            commands?.sendChatMessage({
                mealPlanId,
                message: trimmed,
                guestSessionToken
            })
            return
        }
        commands?.sendChatMessage({ mealPlanId, message: trimmed })
    }

    return { messages, sendMessage }
}
