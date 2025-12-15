import type { Meta, StoryObj } from '@storybook/react'

import { MeetingPage } from './MeetingPage'

const meta: Meta<typeof MeetingPage> = {
    title: 'Pages/Navigation/MeetingPage',
    component: MeetingPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '약속 목록을 볼 수 있는 페이지입니다. 필터를 통해 진행 중/완료된 약속을 구분하여 볼 수 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof MeetingPage>

export const Default: Story = {}

export const WithMeetings: Story = {
    parameters: {
        docs: {
            description: {
                story: '약속이 있는 상태의 페이지입니다.'
            }
        }
    }
}

export const FilteredByStatus: Story = {
    parameters: {
        docs: {
            description: {
                story: '특정 상태로 필터링된 약속 목록입니다.'
            }
        }
    }
}
