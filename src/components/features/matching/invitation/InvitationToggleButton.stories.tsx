import type { Meta, StoryObj } from '@storybook/react'
import { InvitationToggleButton } from './InvitationToggleButton'
import { within, userEvent, expect } from '@storybook/test'

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

export const WithInteraction: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)

        // 토글 버튼 찾기
        const toggle = canvas.getByRole('generic', { hidden: true })

        // 토글 클릭
        await userEvent.click(toggle)
    }
}
