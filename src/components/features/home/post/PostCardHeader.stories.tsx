import type { Meta, StoryObj } from '@storybook/react'
import { PostCardHeader } from './PostCardHeader'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const meta: Meta<typeof PostCardHeader> = {
    title: 'Features/Home/Post/PostCardHeader',
    component: PostCardHeader,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    decorators: [
        Story => (
            <QueryClientProvider client={queryClient}>
                <Story />
            </QueryClientProvider>
        )
    ],
    argTypes: {
        authorId: {
            control: 'number',
            description: '작성자 ID'
        },
        authorUsername: {
            control: 'text',
            description: '작성자 이름'
        },
        postedAt: {
            control: 'text',
            description: '작성 시간'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        authorId: 1,
        authorUsername: '홍길동',
        postedAt: new Date().toISOString()
    }
}

export const WithTags: Story = {
    args: {
        authorId: 1,
        authorUsername: '홍길동',
        tags: [2, 3],
        postedAt: new Date().toISOString()
    }
}

export const OldPost: Story = {
    args: {
        authorId: 1,
        authorUsername: '김철수',
        postedAt: new Date(Date.now() - 86400000 * 7).toISOString()
    }
}

export const RecentPost: Story = {
    args: {
        authorId: 1,
        authorUsername: '이영희',
        postedAt: new Date(Date.now() - 3600000).toISOString()
    }
}
