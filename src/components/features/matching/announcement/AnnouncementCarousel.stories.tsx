import type { Meta, StoryObj } from '@storybook/react'
import { AnnouncementCarousel } from './AnnouncementCarousel'
import { PostResponse } from '@/apis'
import { MockAnnouncements } from '@/constants/mockData'

const meta: Meta<typeof AnnouncementCarousel> = {
    title: 'Features/Matching/Announcement/AnnouncementCarousel',
    component: AnnouncementCarousel,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        announcements: MockAnnouncements
    }
}

export const SingleAnnouncement: Story = {
    args: {
        announcements: [MockAnnouncements[0]]
    }
}

export const EmptyAnnouncements: Story = {
    args: {
        announcements: []
    }
}

export const ManyAnnouncements: Story = {
    args: {
        announcements: [...MockAnnouncements]
    }
}
