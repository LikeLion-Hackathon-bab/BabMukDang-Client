import type { Meta, StoryObj } from '@storybook/react'
import { RecruitBottomSheet } from './RecruitBottomSheet'
import { MockRecruits } from '@/constants/mockData'

const meta: Meta<typeof RecruitBottomSheet> = {
    title: 'Features/Matching/Recruit/RecruitBottomSheet',
    component: RecruitBottomSheet,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        isAdd: {
            control: 'boolean',
            description: '공고 추가 모드 여부'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockRecruit = {
    ...MockRecruits[0]
}

export const AddMode: Story = {
    args: {
        isAdd: true,
        myRecruit: null
    }
}

export const ViewMode: Story = {
    args: {
        isAdd: false,
        myRecruit: mockRecruit
    }
}

