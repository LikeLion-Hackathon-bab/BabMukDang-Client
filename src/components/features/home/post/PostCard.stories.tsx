import type { Meta, StoryObj } from '@storybook/react'
import { PostCard } from './PostCard'

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

const mockPost = {
    articleId: 1,
    authorId: 1,
    authorUsername: '홍길동',
    imageUrl: 'https://picsum.photos/400/400',
    mealDate: '2024-12-15',
    mealTime: '점심',
    restaurantName: {
        placeId: '1',
        placeName: '맛있는 식당',
        addressName: '서울시 강남구',
        roadAddressName: '서울시 강남구 테헤란로 123',
        phoneNumber: '02-1234-5678',
        placeUrl: 'https://example.com',
        categoryGroupCode: 'FD6',
        categoryGroupName: '음식점',
        categoryName: '한식',
        x: 127.0276,
        y: 37.4979
    },
    likeCount: 10,
    commentCount: 5,
    likedByMe: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
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
            mealTime: '아침'
        },
        isComment: false
    }
}

export const DinnerPost: Story = {
    args: {
        post: {
            ...mockPost,
            mealTime: '저녁'
        },
        isComment: false
    }
}
