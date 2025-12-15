import type { Meta, StoryObj } from '@storybook/react'
import { RecieveInvitationList } from './RecieveInvitationList'

const meta: Meta<typeof RecieveInvitationList> = {
    title: 'Features/Matching/Invitation/RecieveInvitationList',
    component: RecieveInvitationList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockInvitations = [
    {
        invitationId: 1,
        inviterName: '홍길동',
        inviterId: 1,
        inviteeId: 2,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
    },
    {
        invitationId: 2,
        inviterName: '김철수',
        inviterId: 2,
        inviteeId: 2,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
    },
    {
        invitationId: 3,
        inviterName: '이영희',
        inviterId: 3,
        inviteeId: 2,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
    }
]

export const Default: Story = {
    args: {
        invitations: mockInvitations
    }
}

export const SingleInvitation: Story = {
    args: {
        invitations: [mockInvitations[0]]
    }
}

export const ManyInvitations: Story = {
    args: {
        invitations: [
            ...mockInvitations,
            {
                invitationId: 4,
                inviterName: '박지민',
                inviterId: 4,
                inviteeId: 2,
                status: 'pending' as const,
                createdAt: new Date().toISOString()
            },
            {
                invitationId: 5,
                inviterName: '최유리',
                inviterId: 5,
                inviteeId: 2,
                status: 'pending' as const,
                createdAt: new Date().toISOString()
            }
        ]
    }
}

export const Empty: Story = {
    args: {
        invitations: []
    }
}
