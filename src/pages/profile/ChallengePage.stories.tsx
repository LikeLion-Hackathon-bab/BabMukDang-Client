import type { Meta, StoryObj } from '@storybook/react'

import { ChallengePage } from './ChallengePage'

const meta: Meta<typeof ChallengePage> = {
    title: 'Pages/Profile/ChallengePage',
    component: ChallengePage,
    tags: ['autodocs'],
    decorators: [],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '7일 챌린지 진행 현황을 볼 수 있는 페이지입니다. 각 요일별 그래픽이 표시됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof ChallengePage>

export const Default: Story = {}

export const Day0: Story = {
    parameters: {
        docs: {
            description: {
                story: '챌린지 시작 전 상태입니다.'
            }
        }
    }
}

export const Day3: Story = {
    parameters: {
        docs: {
            description: {
                story: '3일차 진행 중인 상태입니다.'
            }
        }
    }
}

export const Day7Completed: Story = {
    parameters: {
        docs: {
            description: {
                story: '7일 챌린지가 완료된 상태입니다.'
            }
        }
    }
}
