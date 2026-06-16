import type { Meta, StoryObj } from '@storybook/react'

import { ProfilePage } from './ProfilePage'

const meta: Meta<typeof ProfilePage> = {
    title: 'Pages/Navigation/ProfilePage',
    component: ProfilePage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '내 프로필 정보를 볼 수 있는 페이지입니다. 프로필 섹션과 프로필 설정 모달이 포함됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof ProfilePage>

export const Default: Story = {}

export const WithUserProfile: Story = {
    parameters: {
        docs: {
            description: {
                story: '사용자 프로필이 표시된 상태입니다.'
            }
        }
    }
}

