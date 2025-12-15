import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { MenuPage } from './MenuPage'
import { SocketProvider } from '@/contexts/SocketContext'

const meta: Meta<typeof MenuPage> = {
    title: 'Pages/MatchOnboarding/MenuPage',
    component: MenuPage,
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
                component: '추천된 메뉴 중에서 선택하여 투표할 수 있는 페이지입니다. 3열 그리드로 메뉴 카드가 표시됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof MenuPage>

export const Default: Story = {}

export const WithMenuRecommendations: Story = {
    parameters: {
        docs: {
            description: {
                story: '메뉴 추천 목록이 표시된 상태입니다.'
            }
        }
    }
}

export const WithSelectedMenus: Story = {
    parameters: {
        docs: {
            description: {
                story: '참여자들이 메뉴를 선택한 상태입니다.'
            }
        }
    }
}
