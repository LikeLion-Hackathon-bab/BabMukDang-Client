import type { Meta, StoryObj } from '@storybook/react'
import { CloseAnnouncementCard } from './CloseAnnouncementCard'

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
    postId: 1,
    author: { memberId: 1, name: '홍길동', profileImageUrl: '' },
    message: '점심 같이 드실 분!\n맛있는 거 먹어요',
    location: '강남역 근처',
    targetCount: 3,
    meetingAt: '2024-12-15T12:00',
    createdAt: new Date().toISOString(),
    participants: [
        { memberId: 2, name: '김철수', profileImageUrl: '' },
        { memberId: 3, name: '이영희', profileImageUrl: '' }
    ]
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
