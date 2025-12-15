import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { WaitingPage } from './WaitingPage'
import { SocketProvider } from '@/contexts/SocketContext'

const meta: Meta<typeof WaitingPage> = {
    title: 'Pages/MatchOnboarding/WaitingPage',
    component: WaitingPage,
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
                component: '매칭이 성사되어 대기 중인 상태를 보여주는 페이지입니다. 시간, 장소, 인원 정보가 표시되며 매칭 취소가 가능합니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof WaitingPage>

export const Default: Story = {}

export const AnnouncementType: Story = {
    parameters: {
        docs: {
            description: {
                story: '공고 타입의 매칭 대기 상태입니다.'
            }
        }
    }
}

export const InvitationType: Story = {
    parameters: {
        docs: {
            description: {
                story: '한끼 제안 타입의 매칭 대기 상태입니다.'
            }
        }
    }
}
