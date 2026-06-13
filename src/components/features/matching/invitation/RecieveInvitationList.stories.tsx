import type { Meta, StoryObj } from '@storybook/react'
import { RecieveInvitationList } from './RecieveInvitationList'
import { domainId } from '@/domain/factories'
import type { InvitationResponse } from '@kimdaegyu/babmukdang-shared/domain'

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

const invitation = (
    invitationId: number,
    inviterName: string,
    inviterProfileImageUrl: string | null = null
): InvitationResponse => ({
    invitationId: domainId.invitation(invitationId),
    inviterName,
    inviterProfileImageUrl
})

const mockInvitations: InvitationResponse[] = [
    invitation(1, '홍길동'),
    invitation(2, '김철수'),
    invitation(3, '이영희')
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
            invitation(4, '박지민'),
            invitation(5, '최유리')
        ]
    }
}

export const Empty: Story = {
    args: {
        invitations: []
    }
}
