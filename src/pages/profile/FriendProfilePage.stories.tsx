import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { FriendProfilePage } from './FriendProfilePage'

const meta: Meta<typeof FriendProfilePage> = {
    title: 'Pages/Profile/FriendProfilePage',
    component: FriendProfilePage,
    tags: ['autodocs'],
    decorators: [
        Story => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        )
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '친구의 프로필 정보를 볼 수 있는 페이지입니다. 좋아하는 음식, 못먹는 음식, 알러지 정보가 표시됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof FriendProfilePage>

export const Default: Story = {}

export const WithFriendInfo: Story = {
    parameters: {
        docs: {
            description: {
                story: '친구 정보가 표시된 상태입니다.'
            }
        }
    }
}

export const WithProfileModal: Story = {
    parameters: {
        docs: {
            description: {
                story: '프로필 알림 모달이 표시된 상태입니다.'
            }
        }
    }
}
