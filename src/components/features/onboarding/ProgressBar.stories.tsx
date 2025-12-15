import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
    title: 'Features/Onboarding/ProgressBar',
    component: ProgressBar,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const InvitationStart: Story = {}

export const AnnouncementStart: Story = {}

export const InvitationMiddle: Story = {}

export const AnnouncementEnd: Story = {}
