import type { Meta, StoryObj } from '@storybook/react'
import { EmptyNotiView } from './EmptyNotiView'

const meta: Meta<typeof EmptyNotiView> = {
    title: 'Features/Home/Noti/EmptyNotiView',
    component: EmptyNotiView,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        isMatching: {
            control: 'boolean',
            description: '매칭 알림 여부'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const MatchingEmpty: Story = {
    args: {
        isMatching: true
    }
}

export const LocalNewsEmpty: Story = {
    args: {
        isMatching: false
    }
}
