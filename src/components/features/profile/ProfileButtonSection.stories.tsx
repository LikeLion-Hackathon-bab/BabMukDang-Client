import type { Meta, StoryObj } from '@storybook/react'
import { ProfileButtonSection } from './ProfileButtonSection'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof ProfileButtonSection> = {
    title: 'Features/Profile/ProfileButtonSection',
    component: ProfileButtonSection,
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
    ],
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
        },
        challengeCount: {
            control: { type: 'range', min: 0, max: 7, step: 1 },
            description: '챌린지 완료 횟수'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        friends: 15,
        completedMeetings: 8,
        uncompletedMeetings: 3,
        challengeCount: 4
    }
}

export const NewUser: Story = {
    args: {
        friends: 2,
        completedMeetings: 0,
        uncompletedMeetings: 0,
        challengeCount: 0
    }
}

export const ActiveUser: Story = {
    args: {
        friends: 50,
        completedMeetings: 30,
        uncompletedMeetings: 5,
        challengeCount: 7
    }
}
