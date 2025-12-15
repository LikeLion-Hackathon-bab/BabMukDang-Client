import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { HomePage } from './HomePage'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: Infinity
        }
    }
})

const meta: Meta<typeof HomePage> = {
    title: 'Pages/Navigation/HomePage',
    component: HomePage,
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
                component: '메인 홈 페이지로 게시글 목록을 보여줍니다. 새 글 작성 버튼과 게시글 카드들이 표시됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof HomePage>

export const Default: Story = {}

export const WithPosts: Story = {
    parameters: {
        docs: {
            description: {
                story: '게시글이 있는 상태의 홈 페이지입니다.'
            }
        }
    }
}

export const EmptyState: Story = {
    parameters: {
        docs: {
            description: {
                story: '게시글이 없는 빈 상태의 홈 페이지입니다.'
            }
        }
    }
}
