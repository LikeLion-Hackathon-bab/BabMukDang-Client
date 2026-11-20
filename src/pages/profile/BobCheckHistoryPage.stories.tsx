import type { Meta, StoryObj } from '@storybook/react'

import { BobCheckHistoryPage } from './BobCheckHistoryPage'

const meta: Meta<typeof BobCheckHistoryPage> = {
    title: 'Pages/Profile/BobCheckHistoryPage',
    component: BobCheckHistoryPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '밥체크 인증 기록을 그리드 형태로 볼 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof BobCheckHistoryPage>

export const Default: Story = {}

export const WithHistory: Story = {
    parameters: {
        docs: {
            description: {
                story: '인증 기록이 있는 상태입니다.'
            }
        }
    }
}

export const EmptyState: Story = {
    parameters: {
        docs: {
            description: {
                story: '인증 기록이 없는 빈 상태입니다.'
            }
        }
    }
}
