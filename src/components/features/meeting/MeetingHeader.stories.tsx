import type { Meta, StoryObj } from '@storybook/react'
import { MeetingHeader } from './MeetingHeader'

const meta: Meta<typeof MeetingHeader> = {
    title: 'Features/Meeting/MeetingHeader',
    component: MeetingHeader,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockMeeting = {
    id: 1,
    participants: [
        { name: '홍길동', userId: 1 },
        { name: '김철수', userId: 2 }
    ],
    location: '강남역 2번 출구',
    time: '12월 15일 (일) 12:00',
    restaurant: '맛있는 식당',
    isCompleted: false,
    restaurantType: '한식'
}

export const Default: Story = {
    args: {
        meeting: mockMeeting
    }
}

export const ManyParticipants: Story = {
    args: {
        meeting: {
            ...mockMeeting,
            participants: [
                { name: '홍길동', userId: 1 },
                { name: '김철수', userId: 2 },
                { name: '이영희', userId: 3 }
            ]
        }
    }
}

export const LongLocation: Story = {
    args: {
        meeting: {
            ...mockMeeting,
            location: '서울특별시 강남구 테헤란로 123 ABC빌딩'
        }
    }
}

export const UpcomingSoon: Story = {
    args: {
        meeting: {
            ...mockMeeting,
            time: '오늘 12:00'
        }
    }
}
