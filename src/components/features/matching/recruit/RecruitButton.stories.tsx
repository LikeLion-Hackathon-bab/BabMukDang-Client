import type { Meta, StoryObj } from '@storybook/react'
import {
    AddRecruitButton,
    CloseRecruitButton
} from './RecruitButton'

const AddButtonMeta: Meta<typeof AddRecruitButton> = {
    title: 'Features/Matching/Recruit/AddRecruitButton',
    component: AddRecruitButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default AddButtonMeta
type AddButtonStory = StoryObj<typeof AddButtonMeta>

export const AddButton: AddButtonStory = {
    args: {
        recruitAddData: {
            location: '강남역 근처',
            message: '점심 같이 드실 분!',
            targetCount: 3,
            meetingAt: '2024-12-15T12:00'
        }
    }
}

// CloseRecruitButton 스토리
export const CloseButton: StoryObj<typeof CloseRecruitButton> = {
    render: () => <CloseRecruitButton recruitId={1} />
}

