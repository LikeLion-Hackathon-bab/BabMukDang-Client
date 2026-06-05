import type { Meta, StoryObj } from '@storybook/react'
import { InvitationToggleButton } from './HungryToggleButton'

const meta: Meta<typeof InvitationToggleButton> = {
    title: 'Features/Matching/Invitation/InvitationToggleButton',
    component: InvitationToggleButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInteraction: Story = {}
