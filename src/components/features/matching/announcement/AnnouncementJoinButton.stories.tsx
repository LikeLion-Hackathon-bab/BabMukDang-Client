import type { Meta, StoryObj } from '@storybook/react'
import { JoinButton } from './AnnouncementJoinButton'

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

const mockAnnouncement = {
    postId: 1,
    author: { memberId: 1, name: '홍길동', profileImageUrl: '' },
    message: '점심 같이 드실 분!',
    location: '강남역 근처',
    targetCount: 3,
    meetingAt: '2024-12-15T12:00',
    createdAt: new Date().toISOString(),
    participants: []
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
