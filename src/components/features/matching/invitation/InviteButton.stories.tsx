import type { Meta, StoryObj } from '@storybook/react'
import { InviteButton } from './InviteButton'

const meta: Meta<typeof InviteButton> = {
    title: 'Features/Matching/Invitation/InviteButton',
    component: InviteButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
