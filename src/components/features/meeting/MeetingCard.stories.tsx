import type { Meta, StoryObj } from '@storybook/react'
import { MeetingCard } from './MeetingCard'
import { fn } from '@storybook/test'

const meta: Meta<typeof MeetingCard> = {
    title: 'Features/Meeting/MeetingCard',
    component: MeetingCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        onClick: {
            action: 'card clicked',
            description: '카드 클릭 핸들러'
        }
    },
    args: {
        onClick: fn()
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
    time: '12월 15일 12:00',
    restaurant: '맛있는 식당',
    isCompleted: false,
    restaurantType: '한식'
}

export const Default: Story = {
    args: {
        meeting: mockMeeting
    }
}

export const Completed: Story = {
    args: {
        meeting: {
            ...mockMeeting,
            isCompleted: true
        }
    }
}

export const ManyParticipants: Story = {
    args: {
        meeting: {
            ...mockMeeting,
            participants: [
                { name: '홍길동', userId: 1 },
                { name: '김철수', userId: 2 },
                { name: '이영희', userId: 3 },
                { name: '박지민', userId: 4 }
            ]
        }
    }
}

export const Japanese: Story = {
    args: {
        meeting: {
            ...mockMeeting,
            restaurant: '스시오마카세',
            restaurantType: '일식'
        }
    }
}

export const LongLocation: Story = {
    args: {
        meeting: {
            ...mockMeeting,
            location: '서울특별시 강남구 테헤란로 123 ABC빌딩 1층'
        }
    }
}
