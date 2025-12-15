import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { DatePage } from './DatePage'
import { SocketProvider } from '@/contexts/SocketContext'

const meta: Meta<typeof DatePage> = {
    title: 'Pages/MatchOnboarding/DatePage',
    component: DatePage,
    tags: ['autodocs'],
    decorators: [
        Story => (
            <MemoryRouter>
                <SocketProvider>
                    <Story />
                </SocketProvider>
            </MemoryRouter>
        )
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '매칭 시 날짜를 선택할 수 있는 캘린더 페이지입니다. 여러 날짜를 선택하여 서버에 전송합니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof DatePage>

export const Default: Story = {}

export const WithDatesSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '여러 날짜가 선택된 상태입니다.'
            }
        }
    }
}
