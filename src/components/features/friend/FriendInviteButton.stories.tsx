import type { Meta, StoryObj } from '@storybook/react'
import { FriendInviteButton } from './FriendInviteButton'
import { ModalProvider } from '@/components/shared'

const meta: Meta<typeof FriendInviteButton> = {
    title: 'Features/Friend/FriendInviteButton',
    component: FriendInviteButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    decorators: [
        Story => (
            <ModalProvider>
                <Story />
            </ModalProvider>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCustomClassName: Story = {
    args: {
        className: 'w-full max-w-400'
    }
}
