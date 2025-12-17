import type { Meta, StoryObj } from '@storybook/react'
import { FriendProfileList } from './FriendProfileList'

const meta: Meta<typeof FriendProfileList> = {
    title: 'Features/Onboarding/FriendProfileList',
    component: FriendProfileList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        selectedUsers: ['user1', 'user2', 'user3']
    }
}

export const SingleUser: Story = {
    args: {
        selectedUsers: ['user1']
    }
}

export const ManyUsers: Story = {
    args: {
        selectedUsers: ['user1', 'user2', 'user3', 'user4', 'user5']
    }
}

export const Empty: Story = {
    args: {
        selectedUsers: []
    }
}
