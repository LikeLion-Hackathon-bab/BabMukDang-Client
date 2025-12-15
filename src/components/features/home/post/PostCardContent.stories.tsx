import type { Meta, StoryObj } from '@storybook/react'
import { PostCardContent } from './PostCardContent'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const meta: Meta<typeof PostCardContent> = {
    title: 'Features/Home/Post/PostCardContent',
    component: PostCardContent,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    decorators: [
        Story => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </QueryClientProvider>
        )
    ],
    argTypes: {
        mealTime: {
            control: 'select',
            options: ['아침', '점심', '저녁'],
            description: '식사 시간'
        },
        likedByMe: {
            control: 'boolean',
            description: '좋아요 여부'
        },
        isComment: {
            control: 'boolean',
            description: '댓글 페이지 여부'
        },
        likeCount: {
            control: 'number',
            description: '좋아요 수'
        },
        commentCount: {
            control: 'number',
            description: '댓글 수'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        postImageUrl: 'https://picsum.photos/400/400',
        postId: 1,
        mealTime: '점심',
        likedByMe: false,
        likeCount: 10,
        commentCount: 5,
        isComment: false
    }
}

export const Liked: Story = {
    args: {
        postImageUrl: 'https://picsum.photos/400/400',
        postId: 1,
        mealTime: '점심',
        likedByMe: true,
        likeCount: 11,
        commentCount: 5,
        isComment: false
    }
}

export const Breakfast: Story = {
    args: {
        postImageUrl: 'https://picsum.photos/400/400',
        postId: 1,
        mealTime: '아침',
        likedByMe: false,
        likeCount: 5,
        commentCount: 2,
        isComment: false
    }
}

export const Dinner: Story = {
    args: {
        postImageUrl: 'https://picsum.photos/400/400',
        postId: 1,
        mealTime: '저녁',
        likedByMe: false,
        likeCount: 20,
        commentCount: 8,
        isComment: false
    }
}

export const CommentPage: Story = {
    args: {
        postImageUrl: 'https://picsum.photos/400/400',
        postId: 1,
        mealTime: '점심',
        likedByMe: false,
        likeCount: 10,
        commentCount: 5,
        isComment: true
    }
}

export const NoLikes: Story = {
    args: {
        postImageUrl: 'https://picsum.photos/400/400',
        postId: 1,
        mealTime: '점심',
        likedByMe: false,
        likeCount: 0,
        commentCount: 0,
        isComment: false
    }
}
