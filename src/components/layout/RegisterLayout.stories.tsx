import type { Meta, StoryObj } from '@storybook/react'
import { RegisterLayout } from './RegisterLayout'

const meta: Meta<typeof RegisterLayout> = {
    title: 'Layout/RegisterLayout',
    component: RegisterLayout,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
