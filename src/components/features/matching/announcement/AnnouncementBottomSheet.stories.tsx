import type { Meta, StoryObj } from '@storybook/react'
import { AnnouncementBottomSheet } from './AnnouncementBottomSheet'
import { MockAnnouncements } from '@/constants/mockData'

const meta: Meta<typeof AnnouncementBottomSheet> = {
    title: 'Features/Matching/Announcement/AnnouncementBottomSheet',
    component: AnnouncementBottomSheet,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        isAdd: {
            control: 'boolean',
            description: '공고 추가 모드 여부'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockAnnouncement = {
    ...MockAnnouncements[0]
}

export const AddMode: Story = {
    args: {
        isAdd: true,
        myAnnouncement: null
    }
}

export const ViewMode: Story = {
    args: {
        isAdd: false,
        myAnnouncement: mockAnnouncement
    }
}
