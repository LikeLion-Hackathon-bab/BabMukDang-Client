import type { Meta, StoryObj } from '@storybook/react'
import { AnnouncementCarousel } from './AnnouncementCarousel'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const meta: Meta<typeof AnnouncementCarousel> = {
    title: 'Features/Matching/Announcement/AnnouncementCarousel',
    component: AnnouncementCarousel,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <div style={{ padding: '20px 0' }}>
                        <Story />
                    </div>
                </MemoryRouter>
            </QueryClientProvider>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

const mockAnnouncements = [
    {
        postId: 1,
        authorId: 1,
        author: { memberId: 1, name: '홍길동', profileImageUrl: '' },
        message: '점심 같이 드실 분!',
        location: '강남역 근처',
        targetCount: 3,
        meetingAt: '2024-12-15T12:00',
        createdAt: new Date().toISOString(),
        participants: []
    },
    {
        postId: 2,
        authorId: 2,
        author: { memberId: 2, name: '김철수', profileImageUrl: '' },
        message: '저녁 같이 먹어요',
        location: '홍대입구역',
        targetCount: 4,
        meetingAt: '2024-12-15T18:00',
        createdAt: new Date().toISOString(),
        participants: [{ memberId: 3, name: '이영희', profileImageUrl: '' }]
    },
    {
        postId: 3,
        authorId: 3,
        author: { memberId: 3, name: '박지민', profileImageUrl: '' },
        message: '아침 산책 후 브런치',
        location: '성수역',
        targetCount: 2,
        meetingAt: '2024-12-16T10:00',
        createdAt: new Date().toISOString(),
        participants: []
    }
]

export const Default: Story = {
    args: {
        announcements: mockAnnouncements
    }
}

export const SingleAnnouncement: Story = {
    args: {
        announcements: [mockAnnouncements[0]]
    }
}

export const EmptyAnnouncements: Story = {
    args: {
        announcements: []
    }
}

export const ManyAnnouncements: Story = {
    args: {
        announcements: [
            ...mockAnnouncements,
            {
                postId: 4,
                authorId: 4,
                author: { memberId: 4, name: '최유리', profileImageUrl: '' },
                message: '주말 점심 모임',
                location: '신촌역',
                targetCount: 5,
                meetingAt: '2024-12-17T12:00',
                createdAt: new Date().toISOString(),
                participants: []
            },
            {
                postId: 5,
                authorId: 5,
                author: { memberId: 5, name: '정민수', profileImageUrl: '' },
                message: '커피 마실 분',
                location: '을지로입구역',
                targetCount: 2,
                meetingAt: '2024-12-17T15:00',
                createdAt: new Date().toISOString(),
                participants: []
            }
        ]
    }
}
