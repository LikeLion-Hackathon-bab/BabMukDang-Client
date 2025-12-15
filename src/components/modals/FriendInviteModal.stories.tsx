import type { Meta, StoryObj } from '@storybook/react'

import { FriendInviteModal } from './FriendInviteModal'

const meta: Meta<typeof FriendInviteModal> = {
    title: 'Modals/FriendInviteModal',
    component: FriendInviteModal,
    tags: ['autodocs'],
    argTypes: {
        id: {
            control: 'text',
            description: '모달의 고유 ID'
        },
        onClose: {
            action: 'onClose',
            description: '모달 닫기 시 호출되는 콜백'
        },
        onAccept: {
            action: 'onAccept',
            description: '모달 확인 시 호출되는 콜백'
        }
    },
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        id: 'friend-invite-modal'
    }
}

export const WithCustomId: Story = {
    args: {
        id: 'custom-friend-invite-modal'
    }
}
