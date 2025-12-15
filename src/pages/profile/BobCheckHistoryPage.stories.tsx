import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { BobCheckHistoryPage } from './BobCheckHistoryPage'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: Infinity
        }
    }
})

const meta: Meta<typeof BobCheckHistoryPage> = {
    title: 'Pages/Profile/BobCheckHistoryPage',
    component: BobCheckHistoryPage,
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
                component: '밥체크 인증 기록을 그리드 형태로 볼 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof BobCheckHistoryPage>

export const Default: Story = {}

export const WithHistory: Story = {
    parameters: {
        docs: {
            description: {
                story: '인증 기록이 있는 상태입니다.'
            }
        }
    }
}

export const EmptyState: Story = {
    parameters: {
        docs: {
            description: {
                story: '인증 기록이 없는 빈 상태입니다.'
            }
        }
    }
}
