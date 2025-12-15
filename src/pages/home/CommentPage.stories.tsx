import type { Meta, StoryObj } from '@storybook/react'

import { CommentPage } from './CommentPage'

const meta: Meta<typeof CommentPage> = {
    title: 'Pages/Home/CommentPage',
    component: CommentPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '게시글의 댓글을 조회하고 작성할 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof CommentPage>

export const Default: Story = {}
