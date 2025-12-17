import type { Meta, StoryObj } from '@storybook/react'
import { AddAnnouncementCard } from './AddAnnouncementCard'
import { useState } from 'react'
import { Post } from '@/apis'

const meta: Meta<typeof AddAnnouncementCard> = {
    title: 'Features/Matching/Announcement/AddAnnouncementCard',
    component: AddAnnouncementCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

const AddAnnouncementCardWithState = () => {
    const [data, setData] = useState<Post>({
        location: '',
        message: '',
        targetCount: 0,
        meetingAt: ''
    })
    return (
        <AddAnnouncementCard
            announcementAddData={data}
            setAnnouncementAddData={setData}
        />
    )
}

export const Default: Story = {
    render: () => <AddAnnouncementCardWithState />
}

export const WithInitialData: Story = {
    args: {
        announcementAddData: {
            location: '강남역 근처',
            message: '점심 같이 드실 분!',
            targetCount: 3,
            meetingAt: '2024-12-15T12:00'
        }
    }
}
