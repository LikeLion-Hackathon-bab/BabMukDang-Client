import type { Meta, StoryObj } from '@storybook/react'
import { FriendListSection } from './FriendListSection'

const meta: Meta<typeof FriendListSection> = {
    title: 'Features/Friend/FriendListSection',
    component: FriendListSection,
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
        userName: '홍길동',
        profileImageUrl: 'https://picsum.photos/40/40',
        hungry: true,
        label: '공복이에요'
    },
    {
        memberId: 2,
        userName: '김철수',
        profileImageUrl: 'https://picsum.photos/40/40',
        hungry: false,
        label: '식사를 마친 상태예요'
    },
    {
        memberId: 3,
        userName: '이영희',
        profileImageUrl: 'https://picsum.photos/40/40',
        hungry: true,
        label: '공복이에요'
    },
    {
        memberId: 4,
        userName: '박지민',
        profileImageUrl: 'https://picsum.photos/40/40',
        hungry: false,
        label: '식사를 마친 상태예요'
    }
]

export const Default: Story = {
    args: {
        friendList: mockFriendList
    }
}

export const AllHungry: Story = {
    args: {
        friendList: mockFriendList.map(f => ({ ...f, hungry: true }))
    }
}

export const NoneHungry: Story = {
    args: {
        friendList: mockFriendList.map(f => ({ ...f, hungry: false }))
    }
}

export const Empty: Story = {
    args: {
        friendList: []
    }
}

export const SingleFriend: Story = {
    args: {
        friendList: [mockFriendList[0]]
    }
}
