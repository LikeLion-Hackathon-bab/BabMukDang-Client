import type { Meta, StoryObj } from '@storybook/react'
import { LongTimeNoSeeFriendList } from './LongTimeNoSeeFriendList'

const meta: Meta<typeof LongTimeNoSeeFriendList> = {
    title: 'Features/Matching/Invitation/LongTimeNoSeeFriendList',
    component: LongTimeNoSeeFriendList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockFriendList = [
    {
        memberId: 1,
        userName: '김철수',
        profileImageUrl: '',
        lastMeetingDate: '2024-10-15T12:00:00'
    },
    {
        memberId: 2,
        userName: '이영희',
        profileImageUrl: '',
        lastMeetingDate: '2024-09-20T18:30:00'
    },
    {
        memberId: 3,
        userName: '박민수',
        profileImageUrl: '',
        lastMeetingDate: '2024-08-05T19:00:00'
    },
    {
        memberId: 4,
        userName: '정수진',
        profileImageUrl: '',
        lastMeetingDate: '2024-07-10T12:00:00'
    }
]

export const Default: Story = {
    args: {
        longTimeNoSeeFriendList: mockFriendList
    }
}

export const SingleFriend: Story = {
    args: {
        longTimeNoSeeFriendList: [mockFriendList[0]]
    }
}

export const ManyFriends: Story = {
    args: {
        longTimeNoSeeFriendList: [
            ...mockFriendList,
            {
                memberId: 5,
                userName: '최현우',
                profileImageUrl: '',
                lastMeetingDate: '2024-06-01T15:00:00'
            },
            {
                memberId: 6,
                userName: '강민정',
                profileImageUrl: '',
                lastMeetingDate: '2024-05-20T11:00:00'
            }
        ]
    }
}

export const Empty: Story = {
    args: {
        longTimeNoSeeFriendList: []
    }
}
