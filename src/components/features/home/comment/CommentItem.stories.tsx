import type { Meta, StoryObj } from '@storybook/react'
import { CommentItem } from './CommentItem'

const meta: Meta<typeof CommentItem> = {
    title: 'Features/Home/Comment/CommentItem',
    component: CommentItem,
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
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        commentAuthorName: '홍길동',
        comment: '맛있어 보이네요! 어디 식당인가요?',
        createdAt: new Date().toISOString(),
        authorId: 1
    }
}

export const WithProfileImage: Story = {
    args: {
        profileImageUrl: 'https://picsum.photos/40/40',
        commentAuthorName: '김철수',
        comment: '저도 가보고 싶어요!',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        authorId: 2
    }
}

export const LongComment: Story = {
    args: {
        commentAuthorName: '이영희',
        comment:
            '정말 맛있어 보이네요! 다음에 꼭 가봐야겠어요. 혹시 예약이 필요한가요? 주말에도 자리가 있을까요?',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        authorId: 3
    }
}
