import type { Meta, StoryObj } from '@storybook/react'
import { CloseAnnouncementCard } from './CloseAnnouncementCard'
import { MockAnnouncements } from '@/constants/mockData'

const meta: Meta<typeof CloseAnnouncementCard> = {
    title: 'Features/Matching/Announcement/CloseAnnouncementCard',
    component: CloseAnnouncementCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockAnnouncement = {
    ...MockAnnouncements[0]
}

export const Default: Story = {
    render: () => (
        <div className="w-280">
            <CloseAnnouncementCard announcement={mockAnnouncement} />
        </div>
    )
}

export const NoParticipants: Story = {
    render: () => (
        <div className="w-280">
            <CloseAnnouncementCard
                announcement={{
                    ...mockAnnouncement,
                    participants: []
                }}
            />
        </div>
    )
}

export const ManyParticipants: Story = {
    render: () => (
        <div className="w-280">
            <CloseAnnouncementCard
                announcement={{
                    ...mockAnnouncement,
                    targetCount: 5,
                    participants: [
                        { memberId: 2, name: '김철수', profileImageUrl: '' },
                        { memberId: 3, name: '이영희', profileImageUrl: '' },
                        { memberId: 4, name: '박지민', profileImageUrl: '' },
                        { memberId: 5, name: '최유리', profileImageUrl: '' }
                    ]
                }}
            />
        </div>
    )
}
