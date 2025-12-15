import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { ChatInput } from './ChatInput'

const meta: Meta<typeof ChatInput> = {
    title: 'Shared/ChatInput',
    component: ChatInput,
    tags: ['autodocs'],
    argTypes: {
        newMessage: {
            control: 'text',
            description: '현재 입력된 메시지'
        },
        setNewMessage: {
            action: 'setNewMessage',
            description: '메시지 상태 변경 함수'
        },
        handleKeyPress: {
            action: 'handleKeyPress',
            description: '키 입력 핸들러'
        },
        handleSendMessage: {
            action: 'handleSendMessage',
            description: '메시지 전송 핸들러'
        }
    },    decorators: [
        Story => (
            <div className="w-full max-w-400 p-20">
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        newMessage: ''
    }
}

export const WithText: Story = {
    args: {
        newMessage: '안녕하세요! 오늘 점심 같이 드실래요?'
    }
}

export const LongText: Story = {
    args: {
        newMessage:
            '이것은 긴 메시지입니다. 입력창에 긴 텍스트가 있을 때 어떻게 보이는지 테스트합니다.'
    }
}

// Interactive story with state
const InteractiveChatInput = () => {
    const [message, setMessage] = useState('')

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            console.log('Send message:', message)
            setMessage('')
        }
    }

    const handleSend = () => {
        console.log('Send message:', message)
        setMessage('')
    }

    return (
        <ChatInput
            newMessage={message}
            setNewMessage={setMessage}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSend}
        />
    )
}

export const Interactive: Story = {
    render: () => <InteractiveChatInput />
}
