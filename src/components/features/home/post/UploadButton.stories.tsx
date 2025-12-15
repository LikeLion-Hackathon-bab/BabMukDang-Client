import type { Meta, StoryObj } from '@storybook/react'
import { UploadButton } from './UploadButton'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof UploadButton> = {
    title: 'Features/Home/Post/UploadButton',
    component: UploadButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <MemoryRouter>
                <div style={{ height: '300px', position: 'relative' }}>
                    <Story />
                </div>
            </MemoryRouter>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
