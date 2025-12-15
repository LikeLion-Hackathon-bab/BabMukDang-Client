import type { Meta, StoryObj } from '@storybook/react'
import { ChallengeButton } from './ChallengeButton'

const meta: Meta<typeof ChallengeButton> = {
    title: 'Features/Profile/ChallengeButton',
    component: ChallengeButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    decorators: [],
    argTypes: {
        challengeCount: {
            control: { type: 'range', min: 0, max: 7, step: 1 },
            description: '챌린지 완료 횟수 (0-7)'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        challengeCount: 3
    }
}

export const Empty: Story = {
    args: {
        challengeCount: 0
    }
}

export const HalfComplete: Story = {
    args: {
        challengeCount: 4
    }
}

export const AlmostComplete: Story = {
    args: {
        challengeCount: 6
    }
}

export const Complete: Story = {
    args: {
        challengeCount: 7
    }
}
