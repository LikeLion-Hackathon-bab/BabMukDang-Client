import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SendInvitationPage } from './SendInvitationPage'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: Infinity
        }
    }
})

const meta: Meta<typeof SendInvitationPage> = {
    title: 'Pages/Match/SendInvitationPage',
    component: SendInvitationPage,
    tags: ['autodocs'],
    decorators: [
        Story => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </QueryClientProvider>
        )
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '친구에게 한끼 제안을 보낼 수 있는 페이지입니다. 카드를 선택하여 초대를 보낼 수 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof SendInvitationPage>

export const Default: Story = {}

export const WithCardSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '카드가 선택된 상태입니다.'
            }
        }
    }
}

export const InvitationSent: Story = {
    parameters: {
        docs: {
            description: {
                story: '초대가 발송 완료된 상태입니다.'
            }
        }
    }
}
