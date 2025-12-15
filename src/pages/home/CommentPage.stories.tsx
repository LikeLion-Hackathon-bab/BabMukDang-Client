import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CommentPage } from './CommentPage'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: Infinity
        }
    }
})

const meta: Meta<typeof CommentPage> = {
    title: 'Pages/Home/CommentPage',
    component: CommentPage,
    tags: ['autodocs'],
    decorators: [
        Story => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/comment/1']}>
                    <Routes>
                        <Route
                            path="/comment/:postId"
                            element={<Story />}
                        />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '게시글의 댓글을 조회하고 작성할 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof CommentPage>

export const Default: Story = {}
