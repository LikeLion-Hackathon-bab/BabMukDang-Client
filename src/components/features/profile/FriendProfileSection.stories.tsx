import type { Meta, StoryObj } from '@storybook/react'
import { FriendProfileSection } from './FriendProfileSection'

const meta: Meta<typeof FriendProfileSection> = {
    title: 'Features/Profile/FriendProfileSection',
    component: FriendProfileSection,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        friends: {
            control: 'number',
            description: '친구 수'
        },
        completedMeetings: {
            control: 'number',
            description: '완료된 밥약 수'
        },
        uncompletedMeetings: {
            control: 'number',
            description: '예정된 밥약 수'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        friends: 15,
        completedMeetings: 8,
        uncompletedMeetings: 3
    }
}

export const NewUser: Story = {
    args: {
        friends: 2,
        completedMeetings: 0,
        uncompletedMeetings: 1
    }
}

export const ActiveUser: Story = {
    args: {
        friends: 50,
        completedMeetings: 30,
        uncompletedMeetings: 5
    }
}

export const NoMeetings: Story = {
    args: {
        friends: 10,
        completedMeetings: 0,
        uncompletedMeetings: 0
    }
}
