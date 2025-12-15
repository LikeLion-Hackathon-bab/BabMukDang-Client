import type { Meta, StoryObj } from '@storybook/react'

import { MenuExcludePage } from './MenuExcludePage'

const meta: Meta<typeof MenuExcludePage> = {
    title: 'Pages/MatchOnboarding/MenuExcludePage',
    component: MenuExcludePage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '각 참여자의 최근 식사 메뉴 중 제외할 메뉴를 선택할 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof MenuExcludePage>

export const Default: Story = {}

export const WithUserMenus: Story = {
    parameters: {
        docs: {
            description: {
                story: '참여자들의 메뉴 목록이 표시된 상태입니다.'
            }
        }
    }
}

export const WithExcludedMenus: Story = {
    parameters: {
        docs: {
            description: {
                story: '일부 메뉴가 제외된 상태입니다.'
            }
        }
    }
}
