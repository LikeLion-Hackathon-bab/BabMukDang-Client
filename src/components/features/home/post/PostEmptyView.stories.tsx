import type { Meta, StoryObj } from '@storybook/react'
import { PostEmptyView } from './PostEmptyView'

const meta: Meta<typeof PostEmptyView> = {
    title: 'Features/Home/Post/PostEmptyView',
    component: PostEmptyView,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
