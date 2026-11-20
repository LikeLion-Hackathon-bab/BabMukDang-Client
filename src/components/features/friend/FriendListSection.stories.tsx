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

const allFilter = { key: 'all', label: '전체' }
const hungryFilter = { key: 'hungry', label: '배고픈' }

export const Default: Story = {
    args: {
        friendList: mockFriendList,
        activeFilter: allFilter
    }
}

export const AllHungry: Story = {
    args: {
        friendList: mockFriendList.map(f => ({ ...f, hungry: true })),
        activeFilter: hungryFilter
    }
}

export const NoneHungry: Story = {
    args: {
        friendList: mockFriendList.map(f => ({ ...f, hungry: false })),
        activeFilter: { key: 'not_hungry', label: '배부른' }
    }
}

export const Empty: Story = {
    args: {
        friendList: [],
        activeFilter: allFilter
    }
}

export const SingleFriend: Story = {
    args: {
        friendList: [mockFriendList[0]],
        activeFilter: allFilter
    }
}
