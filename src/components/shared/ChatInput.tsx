import { DeleteCircleIcon, SendIcon } from '@/assets/icons'
import React, { forwardRef } from 'react'

export const ChatInput = forwardRef<
    HTMLInputElement,
    {
        inputRef?: React.RefObject<HTMLInputElement>
        newMessage: string
        setNewMessage: (value: string) => void
        handleKeyPress: (e: React.KeyboardEvent) => void
        handleSendMessage: () => void
    }
>(
    (
        {
            inputRef,
            newMessage,
            setNewMessage,
            handleKeyPress,
            handleSendMessage
        },
        ref
    ) => {
        return (
            <div className="shadow-drop-1 flex w-full items-center justify-between rounded-full bg-white px-16 py-8">
                <input
                    ref={inputRef}
                    data-testid="chat-input"
                    type="text"
                    placeholder="메시지를 입력해 주세요."
                    className="text-body1-medium text-gray-7 placeholder:text-gray-3 flex-1 bg-transparent focus:outline-none"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                {/* 스크롤된 상태로 채팅창 표시 */}
                <div className="flex items-center gap-10">
                    {newMessage && (
                        <button
                            type="button"
                            data-testid="chat-clear-button"
                            aria-label="입력 내용 지우기"
                            onClick={() => setNewMessage('')}
                            className="flex h-13 w-13 items-center justify-center">
                            <DeleteCircleIcon />
                        </button>
                    )}
                    <button
                        type="button"
                        data-testid="chat-send-button"
                        aria-label="메시지 전송"
                        className="flex h-20 w-20 items-center justify-center"
                        onClick={() => handleSendMessage()}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        )
    }
)
