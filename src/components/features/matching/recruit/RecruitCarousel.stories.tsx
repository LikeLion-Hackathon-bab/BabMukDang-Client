import type { Meta, StoryObj } from '@storybook/react'
import { RecruitCarousel } from './RecruitCarousel'
import type { RecruitCardView } from '@/viewModels'
import { MockRecruits } from '@/constants/mockData'

const meta: Meta<typeof RecruitCarousel> = {
    title: 'Features/Matching/Recruit/RecruitCarousel',
    component: RecruitCarousel,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        recruits: MockRecruits
    }
}

export const SingleRecruit: Story = {
    args: {
        recruits: [MockRecruits[0]]
    }
}

export const EmptyRecruits: Story = {
    args: {
        recruits: []
    }
}

export const ManyRecruits: Story = {
    args: {
        recruits: [...MockRecruits]
    }
}

