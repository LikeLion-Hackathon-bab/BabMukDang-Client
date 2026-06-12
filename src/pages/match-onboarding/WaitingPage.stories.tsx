import type { Meta, StoryObj } from '@storybook/react'

import { WaitingPage } from './WaitingPage'

const meta: Meta<typeof WaitingPage> = {
    title: 'Pages/MatchOnboarding/WaitingPage',
    component: WaitingPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '매칭이 성사되어 대기 중인 상태를 보여주는 페이지입니다. 시간, 장소, 인원 정보가 표시되며 매칭 취소가 가능합니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof WaitingPage>

export const Default: Story = {}

export const RecruitType: Story = {
    parameters: {
        docs: {
            description: {
                story: '공고 타입의 매칭 대기 상태입니다.'
            }
        }
    }
}

export const InvitationType: Story = {
    parameters: {
        docs: {
            description: {
                story: '한끼 제안 타입의 매칭 대기 상태입니다.'
            }
        }
    }
}

