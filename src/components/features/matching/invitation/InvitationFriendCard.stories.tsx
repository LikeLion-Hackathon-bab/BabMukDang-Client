import type { Meta, StoryObj } from '@storybook/react'
import { FriendCard } from './InvitationFriendCard'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof FriendCard> = {
    title: 'Features/Matching/Invitation/FriendCard',
    component: FriendCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    decorators: [
        Story => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Hungry: Story = {
    args: {
        friend: {
            memberId: 1,
            userName: '홍길동',
            profileImageUrl: 'https://picsum.photos/40/40',
            hungry: true,
            label: '공복이에요'
        }
    }
}

export const NotHungry: Story = {
    args: {
        friend: {
            memberId: 2,
            userName: '김철수',
            profileImageUrl: 'https://picsum.photos/40/40',
            hungry: false,
            label: '식사를 마친 상태예요'
        }
    }
}

export const LongName: Story = {
    args: {
        friend: {
            memberId: 3,
            userName: '아주긴이름을가진친구',
            profileImageUrl: 'https://picsum.photos/40/40',
            hungry: true,
            label: '공복이에요'
        }
    }
}
