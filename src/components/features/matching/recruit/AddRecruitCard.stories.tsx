import type { Meta, StoryObj } from '@storybook/react'
import { AddRecruitCard } from './AddRecruitCard'
import { useState } from 'react'
import { Post } from '@/apis'

const meta: Meta<typeof AddRecruitCard> = {
    title: 'Features/Matching/Recruit/AddRecruitCard',
    component: AddRecruitCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

const AddRecruitCardWithState = () => {
    const [data, setData] = useState<Post>({
        location: '',
        message: '',
        targetCount: 0,
        meetingAt: ''
    })
    return (
        <AddRecruitCard
            recruitAddData={data}
            setRecruitAddData={setData}
        />
    )
}

export const Default: Story = {
    render: () => <AddRecruitCardWithState />
}

export const WithInitialData: Story = {
    args: {
        recruitAddData: {
            location: '강남역 근처',
            message: '점심 같이 드실 분!',
            targetCount: 3,
            meetingAt: '2024-12-15T12:00'
        }
    }
}

