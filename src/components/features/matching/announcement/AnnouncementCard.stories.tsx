import type { Meta, StoryObj } from '@storybook/react'
import { AnnouncementCard } from './AnnouncementCard'
import { useRef } from 'react'
import { MockAnnouncements } from '@/constants/mockData'

const meta: Meta<typeof AnnouncementCard> = {
    title: 'Features/Matching/Announcement/AnnouncementCard',
    component: AnnouncementCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        index: {
            control: 'number',
            description: '카드 인덱스'
        },
        currentIndex: {
            control: 'number',
            description: '현재 활성 인덱스'
        },
        isActive: {
            control: 'boolean',
            description: '활성 상태 여부'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockAnnouncement = { ...MockAnnouncements[0] }

const AnnouncementCardWrapper = (props: any) => {
    const cardRef = useRef<HTMLDivElement>(null)
    return (
        <AnnouncementCard
            {...props}
            cardRef={cardRef}
        />
    )
}

export const Active: Story = {
    render: () => (
        <div className="w-280">
            <AnnouncementCardWrapper
                announcement={mockAnnouncement}
                index={0}
                currentIndex={0}
                isActive={true}
            />
        </div>
    )
}

export const Inactive: Story = {
    render: () => (
        <div className="w-280">
            <AnnouncementCardWrapper
                announcement={mockAnnouncement}
                index={1}
                currentIndex={0}
                isActive={false}
            />
        </div>
    )
}

export const WithProfileImages: Story = {
    render: () => (
        <div className="w-280">
            <AnnouncementCardWrapper
                announcement={{
                    ...mockAnnouncement,
                    author: {
                        ...mockAnnouncement.author,
                        profileImageUrl: 'https://picsum.photos/40/40'
                    },
                    participants: [
                        {
                            memberId: 2,
                            name: '김철수',
                            profileImageUrl: 'https://picsum.photos/40/40'
                        },
                        {
                            memberId: 3,
                            name: '이영희',
                            profileImageUrl: 'https://picsum.photos/40/40'
                        }
                    ]
                }}
                index={0}
                currentIndex={0}
                isActive={true}
            />
        </div>
    )
}

export const ManyParticipants: Story = {
    render: () => (
        <div className="w-280">
            <AnnouncementCardWrapper
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
                index={0}
                currentIndex={0}
                isActive={true}
            />
        </div>
    )
}
