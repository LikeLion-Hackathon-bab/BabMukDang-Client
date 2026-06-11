import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
    CommentIcon,
    DeleteIcon,
    DeleteCircleIcon,
    SendIcon
} from '@/assets/icons'
import { COLORS } from '@/constants/colors'
import { useSocket } from '@/contexts/SocketContext'
import { ChatInput } from '@/components/shared'
import { useAuthStore } from '@/store'
import type { ChatMessageResponse as ChatMessage } from '@kimdaegyu/babmukdang-shared/domain'

interface ChatModalProps {
    isOpen: boolean
    onClose: () => void
    roomId?: string
}

export function ChatModal({
    isOpen,
    onClose,
    roomId = 'default-room'
}: ChatModalProps) {
    const { socket, chatMessages } = useSocket()
    const { userId, profile } = useAuthStore()
    const [messages, setMessages] = useState<ChatMessage[]>(chatMessages)
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const inputRef = useCallback(
        (node: HTMLInputElement | null) => {
            if (node && isOpen) {
                // node.focus()
                scrollToBottom(false)
            }
        },
        [isOpen]
    )

    // 메시지 전송
    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const text = newMessage.trim()
            const message: ChatMessage = {
                messageId: Date.now().toString(),
                user: {
                    memberId: Number(userId ?? 0) as ChatMessage['user']['memberId'],
                    username: '나',
                    profileImageUrl: profile.profileImageUrl ?? ''
                },
                message: text,
                createdAt: new Date().toISOString()
            }
            setMessages(prev => [...prev, message])
            setNewMessage('')
            // Backend는 ChatMessageRequestDto({ text })만 수신한다.
            socket?.emit('chat-message', { message: text })
        }
    }

    // Enter 키로 메시지 전송
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // 스크롤을 맨 아래로
    const scrollToBottom = (isSmooth: boolean = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: isSmooth ? 'smooth' : 'auto'
        })
    }
    useEffect(() => {
        if (!socket) return
        const handleChatMessage = (message: ChatMessage) => {
            setMessages(prev => [...prev, message])
        }
        socket.on('chat-message', handleChatMessage)
        return () => {
            socket.off('chat-message', handleChatMessage)
        }
    }, [socket])
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (!isOpen) return null

    return (
        <div className="chat-overlay bg-opacity-40 fixed inset-0 z-1000 flex items-end justify-center bg-black/20">
            <div className="chat-sheet shadow-drop-1 rounded-t-16 relative flex h-[80vh] w-full flex-col">
                <ChatHeader onClose={onClose} />
                {/* 메시지 영역 */}
                <div className="bg-primary-200 flex flex-1 flex-col gap-20 overflow-y-auto px-20 pt-30 pb-80">
                    {messages.map(message =>
                        Number(message.user.memberId) === Number(userId) ? (
                            <ChatMessageMy message={message} />
                        ) : (
                            <ChatMessageOther message={message} />
                        )
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div className="absolute right-0 bottom-40 left-0 px-20">
                    <ChatInput
                        inputRef={
                            inputRef as unknown as React.RefObject<HTMLInputElement>
                        }
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleKeyPress={handleKeyPress}
                        handleSendMessage={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    )
}

const ChatHeader = ({ onClose }: { onClose: () => void }) => {
    return (
        <div>
            {/* 헤더 */}
            <div className="rounded-t-16 flex items-center justify-center bg-white px-20 py-12">
                <div>
                    <h2 className="text-body1-semibold text-black">
                        그룹 채팅
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="absolute right-20"
                    aria-label="채팅창 닫기">
                    <DeleteIcon />
                </button>
            </div>
        </div>
    )
}
const ChatMessageMy = ({ message }: { message: ChatMessage }) => {
    return (
        <div className={`flex justify-end`}>
            <div
                className={`shadow-drop-1 bg-primary-400 rounded-12 w-fit px-16 py-12`}>
                <span className="text-body2-medium break-words whitespace-pre-line text-black">
                    {message.message}
                </span>
            </div>
        </div>
    )
}
const ChatMessageOther = ({ message }: { message: ChatMessage }) => {
    return (
        <div className={`flex flex-col justify-start gap-12`}>
            <div className="text-caption-medium text-gray-5 mb-1">
                {message.user.username}
            </div>
            <div
                className={`shadow-drop-1 rounded-12 w-fit bg-white px-16 py-12`}>
                <span className="text-body2-medium break-words whitespace-pre-line text-black">
                    {message.message}
                </span>
            </div>
        </div>
    )
}
// 채팅 버튼 컴포넌트
interface ChatButtonProps {
    onClick: () => void
    className?: string
    isOpen: boolean
}

export function ChatButton({
    onClick,
    className = '',
    isOpen
}: ChatButtonProps) {
    // const { socket, userId } = useSocket()
    // const [unreadCount, setUnreadCount] = useState(0)
    // useEffect(() => {
    //     const handleChatMessage = (message: ChatMessage) => {
    //         console.log(message.user.userId !== userId, isOpen)
    //         if (message.user.userId !== userId && !isOpen) {
    //             setUnreadCount(prev => prev + 1)
    //         }
    //     }
    //     socket?.on('chat-message', handleChatMessage)
    //     return () => {
    //         socket?.off('chat-message', handleChatMessage)
    //     }
    // }, [])
    // useEffect(() => {
    //     console.log('isOpen', isOpen)
    //     if (isOpen) {
    //         setUnreadCount(0)
    //     }
    // }, [isOpen])
    return (
        <>
            {/* {unreadCount > 0 && !isOpen && (
                <div className="text-caption-medium absolute -top-1 -right-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white">
                    {unreadCount}
                </div>
            )} */}
            <button
                onClick={() => {
                    onClick()
                    console.log('clicked', isOpen)
                }}
                className={`shadow-drop-1 border-primary-400 flex items-center justify-center rounded-full border bg-white p-18 ${className}`}
                aria-label="채팅 열기">
                <CommentIcon strokecolor={COLORS.primaryMain} />
            </button>
        </>
    )
}
