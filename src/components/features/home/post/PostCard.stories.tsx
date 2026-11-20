import type { Meta, StoryObj } from '@storybook/react'
import { PostCard } from './PostCard'
import type { PostCardView } from '@/viewModels'

const meta: Meta<typeof PostCard> = {
    title: 'Features/Home/Post/PostCard',
    component: PostCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        isComment: {
            control: 'boolean',
            description: '댓글 페이지 여부'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockPost: PostCardView = {
    articleId: 1,
    authorId: 1,
    authorUsername: '홍길동',
    imageUrl: 'https://picsum.photos/400/400',
    mealTime: '12:00:00',
    likeCount: 10,
    commentCount: 5,
    likedByMe: false,
    createdAt: new Date().toISOString(),
    taggedMemberIds: []
}

export const Default: Story = {
    args: {
        post: mockPost,
        isComment: false
    }
}

export const Liked: Story = {
    args: {
        post: {
            ...mockPost,
            likedByMe: true,
            likeCount: 11
        },
        isComment: false
    }
}

export const CommentView: Story = {
    args: {
        post: mockPost,
        isComment: true
    }
}

export const WithTags: Story = {
    args: {
        post: {
            ...mockPost,
            taggedMemberIds: [2, 3]
        },
        isComment: false
    }
}

export const BreakfastPost: Story = {
    args: {
        post: {
            ...mockPost,
            mealTime: '09:00:00'
        },
        isComment: false
    }
}

export const DinnerPost: Story = {
    args: {
        post: {
            ...mockPost,
            mealTime: '18:00:00'
        },
        isComment: false
    }
}
