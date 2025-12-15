import type { Meta, StoryObj } from '@storybook/react'

import { NotiStoragePage } from './NotiStoragePage'

const meta: Meta<typeof NotiStoragePage> = {
    title: 'Pages/Home/NotiStoragePage',
    component: NotiStoragePage,
    tags: ['autodocs'],
    decorators: [],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '알림과 동네소식을 탭으로 전환하여 볼 수 있는 알림 보관함 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof NotiStoragePage>

export const Default: Story = {}

export const NotiTab: Story = {
    parameters: {
        docs: {
            description: {
                story: '알림 탭이 활성화된 상태입니다.'
            }
        }
    }
}

export const LocalNewsTab: Story = {
    parameters: {
        docs: {
            description: {
                story: '동네소식 탭이 활성화된 상태입니다.'
            }
        }
    }
}
