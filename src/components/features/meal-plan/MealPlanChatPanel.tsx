import { useEffect, useState } from 'react'
import type { MealPlanChatMessageResponse } from '@kimdaegyu/babmukdang-shared/domain'
import { useMealPlanChat } from '@/contexts/socket/useMealPlanChat'
import { useMealPlanChatMessages, useMealPlanGuestChatMessages } from '@/apis'
import { useSocket } from '@/contexts/SocketContext'
import { useMealPlanStore } from '@/store/mealPlanStore'
import { MealPlanSystemMessage } from './MealPlanSystemMessage'

const senderName = (message: MealPlanChatMessageResponse) =>
    message.sender?.username ?? message.guestNickname ?? (message.guestId ? '게스트' : '시스템')

export function MealPlanChatPanel({
    mealPlanId,
    active
}: {
    mealPlanId: string
    active: boolean
}) {
    const [message, setMessage] = useState('')
    const { guestSessionToken, shareLinkToken } = useSocket()
    const setChatMessages = useMealPlanStore(state => state.setChatMessages)
    const { data: memberMessages } = useMealPlanChatMessages(mealPlanId, {
        enabled: active && !guestSessionToken
    })
    const { data: guestMessages } = useMealPlanGuestChatMessages(
        shareLinkToken ?? '',
        guestSessionToken,
        { enabled: active && Boolean(guestSessionToken && shareLinkToken) }
    )
    const { messages, sendMessage } = useMealPlanChat(mealPlanId)

    useEffect(() => {
        const history = guestSessionToken ? guestMessages : memberMessages
        if (history) setChatMessages(history)
    }, [guestMessages, guestSessionToken, memberMessages, setChatMessages])

    const submit = () => {
        const trimmed = message.trim()
        if (!trimmed) return
        if (!active) return
        sendMessage(trimmed)
        setMessage('')
    }

    return (
        <section className="rounded-20 flex flex-col gap-12 bg-white p-16">
            <div>
                <h2 className="text-body1-semibold text-gray-8">채팅</h2>
                <p className="text-caption-regular text-gray-5">
                    {active
                        ? '참여자가 함께 의견을 나누는 밥약 채팅입니다.'
                        : '참여자가 2명 이상이 되면 MealPlanChatRoom이 활성화됩니다.'}
                </p>
            </div>
            <div className="bg-gray-1 flex max-h-260 min-h-160 flex-col gap-10 overflow-y-auto rounded-16 p-12">
                {messages.length === 0 ? (
                    <span className="text-caption-regular text-gray-5">
                        아직 메시지가 없습니다.
                    </span>
                ) : (
                    messages.map(chatMessage =>
                        chatMessage.kind === 'SYSTEM' ? (
                            <MealPlanSystemMessage
                                key={chatMessage.messageId}
                                message={chatMessage}
                            />
                        ) : (
                            <div
                                key={chatMessage.messageId}
                                className="flex flex-col gap-3">
                                <span className="text-caption-medium text-gray-5">
                                    {senderName(chatMessage)}
                                </span>
                                <p className="rounded-16 bg-white px-12 py-8 text-body2-medium text-gray-8">
                                    {chatMessage.message}
                                </p>
                            </div>
                        )
                    )
                )}
            </div>
            <div className="flex gap-8">
                <input
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') submit()
                    }}
                    className="rounded-30 bg-gray-1 text-body2-medium min-w-0 flex-1 px-14 py-10 outline-none"
                    disabled={!active}
                    placeholder={active ? '메시지 입력' : '참여자가 2명 이상일 때 사용할 수 있어요'}
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={!active}
                    className="rounded-30 bg-gray-8 px-16 text-caption-medium text-white disabled:opacity-40">
                    보내기
                </button>
            </div>
        </section>
    )
}
