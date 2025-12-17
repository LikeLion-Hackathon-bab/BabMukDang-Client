import type { Meta, StoryObj } from '@storybook/react'
import { CommentList } from './CommentList'

const meta: Meta<typeof CommentList> = {
    title: 'Features/Home/Comment/CommentList',
    component: CommentList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        totalCommentCount: {
            control: 'number',
            description: '총 댓글 수'
        },
        onClickReply: {
            action: 'reply clicked',
            description: '답글 버튼 클릭 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockComments = [
    {
        commentId: 1,
        authorId: 1,
        authorUsername: '홍길동',
        parentCommentId: null,
        content: '맛있어 보이네요!',
        createdAt: new Date().toISOString(),
        replies: [
            {
                commentId: 2,
                authorId: 2,
                authorUsername: '김철수',
                parentCommentId: 1,
                content: '저도 그렇게 생각해요!',
                createdAt: new Date().toISOString()
            }
        ]
    },
    {
        commentId: 3,
        authorId: 3,
        authorUsername: '이영희',
        parentCommentId: null,
        content: '어디 식당인가요?',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        replies: []
    }
]

export const Default: Story = {
    args: {
        comments: mockComments,
        totalCommentCount: 4
    }
}

export const EmptyComments: Story = {
    args: {
        comments: [],
        totalCommentCount: 0
    }
}

export const SingleComment: Story = {
    args: {
        comments: [
            {
                commentId: 1,
                authorId: 1,
                authorUsername: '테스트유저',
                parentCommentId: null,
                content: '첫 번째 댓글입니다.',
                createdAt: new Date().toISOString(),
                replies: []
            }
        ],
        totalCommentCount: 1
    }
}

export const ManyReplies: Story = {
    args: {
        comments: [
            {
                commentId: 1,
                authorId: 1,
                authorUsername: '원본작성자',
                parentCommentId: null,
                content: '질문 있어요!',
                createdAt: new Date().toISOString(),
                replies: [
                    {
                        commentId: 2,
                        authorId: 2,
                        authorUsername: '답변자1',
                        parentCommentId: 1,
                        content: '네, 무엇이 궁금하신가요?',
                        createdAt: new Date().toISOString()
                    },
                    {
                        commentId: 3,
                        authorId: 3,
                        authorUsername: '답변자2',
                        parentCommentId: 1,
                        content: '저도 답변 드릴게요!',
                        createdAt: new Date().toISOString()
                    },
                    {
                        commentId: 4,
                        authorId: 4,
                        authorUsername: '답변자3',
                        parentCommentId: 1,
                        content: '추가 정보입니다.',
                        createdAt: new Date().toISOString()
                    }
                ]
            }
        ],
        totalCommentCount: 4
    }
}
