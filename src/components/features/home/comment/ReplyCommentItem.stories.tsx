import type { Meta, StoryObj } from '@storybook/react'
import { ReplyCommentItem } from './ReplyCommentItem'
import { fn } from '@storybook/test'

const meta: Meta<typeof ReplyCommentItem> = {
    title: 'Features/Home/Comment/ReplyCommentItem',
    component: ReplyCommentItem,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        profileImageUrl: {
            control: 'text',
            description: '프로필 이미지 URL'
        },
        commentAuthorName: {
            control: 'text',
            description: '댓글 작성자 이름'
        },
        comment: {
            control: 'text',
            description: '댓글 내용'
        },
        createdAt: {
            control: 'text',
            description: '작성 시간 (ISO 문자열)'
        },
        authorId: {
            control: 'number',
            description: '작성자 ID'
        },
        onClickReply: {
            action: 'reply clicked',
            description: '답글 버튼 클릭 핸들러'
        }
    },
    args: {
        onClickReply: fn()
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        commentAuthorName: '김철수',
        comment: '답글 내용입니다.',
        createdAt: new Date().toISOString(),
        authorId: 2
    }
}

export const WithProfileImage: Story = {
    args: {
        profileImageUrl: 'https://picsum.photos/40/40',
        commentAuthorName: '이영희',
        comment: '저도 동의해요!',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        authorId: 3
    }
}

export const LongReply: Story = {
    args: {
        commentAuthorName: '박지민',
        comment:
            '좋은 의견이네요. 저도 비슷한 경험이 있어서 공감이 많이 됩니다. 다음에 함께 가면 좋겠어요!',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        authorId: 4
    }
}
