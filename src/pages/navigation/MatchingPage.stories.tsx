import type { Meta, StoryObj } from '@storybook/react'

import { MatchingPage } from './MatchingPage'

const meta: Meta<typeof MatchingPage> = {
    title: 'Pages/Navigation/MatchingPage',
    component: MatchingPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '한끼 공고와 한끼 제안을 탭으로 전환하여 볼 수 있는 매칭 페이지입니다. 공고 캐러셀과 친구 목록이 표시됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof MatchingPage>

export const Default: Story = {}

export const RecruitTab: Story = {
    parameters: {
        docs: {
            description: {
                story: '한끼 공고 탭이 활성화된 상태입니다.'
            }
        }
    }
}

export const InvitationTab: Story = {
    parameters: {
        docs: {
            description: {
                story: '한끼 제안 탭이 활성화된 상태입니다.'
            }
        }
    }
}

