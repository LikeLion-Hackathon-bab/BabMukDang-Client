import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { FinishPage } from './FinishPage'
import { SocketProvider } from '@/contexts/SocketContext'

const meta: Meta<typeof FinishPage> = {
    title: 'Pages/MatchOnboarding/FinishPage',
    component: FinishPage,
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
                component: '매칭이 완료되어 약속이 확정되었을 때 보여주는 완료 페이지입니다. 시간, 장소, 인원 정보가 표시됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof FinishPage>

export const Default: Story = {}

export const WithMatchInfo: Story = {
    parameters: {
        docs: {
            description: {
                story: '매칭 정보가 표시된 완료 페이지입니다.'
            }
        }
    }
}
