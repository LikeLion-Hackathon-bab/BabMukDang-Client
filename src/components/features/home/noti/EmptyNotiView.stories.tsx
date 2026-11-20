import type { Meta, StoryObj } from '@storybook/react'
import { EmptyNotiView } from './EmptyNotiView'

const meta: Meta<typeof EmptyNotiView> = {
    title: 'Features/Home/Noti/EmptyNotiView',
    component: EmptyNotiView,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['mealPlan', 'localNews'],
            description: '빈 상태 종류'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const MealPlanNotificationEmpty: Story = {
    args: {
        variant: 'mealPlan'
    }
}

export const LocalNewsEmpty: Story = {
    args: {
        variant: 'localNews'
    }
}
