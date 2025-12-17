import type { Meta, StoryObj } from '@storybook/react'
import { JoinButton } from './AnnouncementJoinButton'
import { PostResponse } from '@/apis'
import { MockAnnouncements } from '@/constants/mockData'

const meta: Meta<typeof JoinButton> = {
    title: 'Features/Matching/Announcement/JoinButton',
    component: JoinButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        disabled: {
            control: 'boolean',
            description: '비활성화 상태'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockAnnouncement: PostResponse = {
    ...MockAnnouncements[0]
}

export const Default: Story = {
    args: {
        disabled: false,
        announcement: mockAnnouncement
    }
}

export const Disabled: Story = {
    args: {
        disabled: true,
        announcement: mockAnnouncement
    }
}
