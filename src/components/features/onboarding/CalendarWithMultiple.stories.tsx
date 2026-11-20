import type { Meta, StoryObj } from '@storybook/react'
import { CalendarWithMultiple } from './CalendarWithMultiple'

const meta: Meta<typeof CalendarWithMultiple> = {
    title: 'Features/Onboarding/CalendarWithMultiple',
    component: CalendarWithMultiple,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        onSelectDates: {
            action: 'dates selected',
            description: '날짜 선택 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithServerSelections: Story = {
    args: {
        serverDateSelections: [
            { userId: '1', dates: ['25. 12. 15', '25. 12. 16'] },
            { userId: '2', dates: ['25. 12. 16', '25. 12. 17'] }
        ]
    }
}

export const ManyServerSelections: Story = {
    args: {
        serverDateSelections: [
            { userId: '1', dates: ['25. 12. 15', '25. 12. 16', '25. 12. 17'] },
            { userId: '2', dates: ['25. 12. 16', '25. 12. 17', '25. 12. 18'] },
            { userId: '3', dates: ['25. 12. 17', '25. 12. 18', '25. 12. 19'] }
        ]
    }
}
