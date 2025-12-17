import type { Meta, StoryObj } from '@storybook/react'

import { ReadInvitationPage } from './ReadInvitationPage'

const meta: Meta<typeof ReadInvitationPage> = {
    title: 'Pages/Match/ReadInvitationPage',
    component: ReadInvitationPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '받은 한끼 초대를 확인하고 수락/거절할 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof ReadInvitationPage>

export const Default: Story = {}

export const WithInvitation: Story = {
    parameters: {
        docs: {
            description: {
                story: '초대 정보가 표시된 상태입니다.'
            }
        }
    }
}
