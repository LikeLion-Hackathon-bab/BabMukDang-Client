import type { Meta, StoryObj } from '@storybook/react'
import { FriendSearchInput } from './FriendSearchInput'
import { fn } from '@storybook/test'

const meta: Meta<typeof FriendSearchInput> = {
    title: 'Features/Friend/FriendSearchInput',
    component: FriendSearchInput,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    args: {
        handleSearch: fn()
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSearchHandler: Story = {
    args: {
        handleSearch: (search: string) => console.log('검색어:', search)
    }
}
