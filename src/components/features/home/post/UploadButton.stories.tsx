import type { Meta, StoryObj } from '@storybook/react-vite'
import { UploadButton } from './UploadButton'

const meta: Meta<typeof UploadButton> = {
    title: 'Features/Home/Post/UploadButton',
    component: UploadButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
