import type { Meta, StoryObj } from '@storybook/react'
import { JoinButton } from './RecruitJoinButton'
import type { RecruitCardView } from '@/viewModels'
import { MockRecruits } from '@/constants/mockData'

const meta: Meta<typeof JoinButton> = {
    title: 'Features/Matching/Recruit/JoinButton',
    component: JoinButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        disabled: {
            control: 'boolean',
            description: '비활성화 상태'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockRecruit: RecruitCardView = {
    ...MockRecruits[0]
}

export const Default: Story = {
    args: {
        disabled: false,
        recruit: mockRecruit
    }
}

export const Disabled: Story = {
    args: {
        disabled: true,
        recruit: mockRecruit
    }
}

