import type { Meta, StoryObj } from '@storybook/react'
import { AddCardButton } from './AddCardButton'

const meta: Meta<typeof AddCardButton> = {
    title: 'Features/Matching/Announcement/AddCardButton',
    component: AddCardButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithClickHandler: Story = {
    args: {
        onClick: () => alert('공고 추가 버튼 클릭!')
    }
}
