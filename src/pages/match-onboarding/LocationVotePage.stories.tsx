import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { LocationVotePage } from './LocationVotePage'
import { SocketProvider } from '@/contexts/SocketContext'

const meta: Meta<typeof LocationVotePage> = {
    title: 'Pages/MatchOnboarding/LocationVotePage',
    component: LocationVotePage,
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
                component: '선택된 장소 후보들 중에서 투표할 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof LocationVotePage>

export const Default: Story = {}

export const WithLocationOptions: Story = {
    parameters: {
        docs: {
            description: {
                story: '장소 후보들이 표시되어 투표할 수 있는 상태입니다.'
            }
        }
    }
}

export const WithSelectedLocation: Story = {
    parameters: {
        docs: {
            description: {
                story: '장소가 선택된 상태입니다.'
            }
        }
    }
}
