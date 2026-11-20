import type { Meta, StoryObj } from '@storybook/react-vite'
import { MeetingPage } from './MeetingPage'

const meta: Meta<typeof MeetingPage> = {
    title: 'Pages/Navigation/MeetingPage',
    component: MeetingPage,
    tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof MeetingPage>

export const Default: Story = {}
