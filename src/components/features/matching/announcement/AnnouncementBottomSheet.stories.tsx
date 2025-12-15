import type { Meta, StoryObj } from '@storybook/react'
import { AnnouncementBottomSheet } from './AnnouncementBottomSheet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const meta: Meta<typeof AnnouncementBottomSheet> = {
    title: 'Features/Matching/Announcement/AnnouncementBottomSheet',
    component: AnnouncementBottomSheet,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <div style={{ height: '100vh', position: 'relative' }}>
                        <Story />
                    </div>
                </MemoryRouter>
            </QueryClientProvider>
        )
    ],
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
    postId: 1,
    author: {
        memberId: 1,
        name: '홍길동',
        profileImageUrl: ''
    },
    message: '점심 같이 드실 분!',
    location: '강남역 근처',
    targetCount: 3,
    meetingAt: '2024-12-15T12:00',
    createdAt: new Date().toISOString(),
    participants: []
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
