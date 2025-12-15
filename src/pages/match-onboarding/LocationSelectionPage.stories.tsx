import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { LocationSelectionPage } from './LocationSelectionPage'
import { SocketProvider } from '@/contexts/SocketContext'

const meta: Meta<typeof LocationSelectionPage> = {
    title: 'Pages/MatchOnboarding/LocationSelectionPage',
    component: LocationSelectionPage,
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
                component: '카카오 맵을 통해 장소를 선택하고 후보지를 추가할 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof LocationSelectionPage>

export const Default: Story = {}

export const WithLocationCandidates: Story = {
    parameters: {
        docs: {
            description: {
                story: '장소 후보들이 표시된 상태입니다.'
            }
        }
    }
}
