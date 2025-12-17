import type { Meta, StoryObj } from '@storybook/react'

import { TimePage } from './TimePage'

const meta: Meta<typeof TimePage> = {
    title: 'Pages/MatchOnboarding/TimePage',
    component: TimePage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '드래그하여 가능한 시간대를 선택할 수 있는 타임피커 페이지입니다. 8시부터 24시까지 30분 단위로 선택 가능합니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof TimePage>

export const Default: Story = {}

export const WithTimeSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '시간대가 선택된 상태입니다.'
            }
        }
    }
}

export const WithMultipleRanges: Story = {
    parameters: {
        docs: {
            description: {
                story: '여러 시간 범위가 선택된 상태입니다.'
            }
        }
    }
}
