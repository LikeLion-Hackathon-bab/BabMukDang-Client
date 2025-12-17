import type { Meta, StoryObj } from '@storybook/react'

import { CouponStoragePage } from './CouponStoragePage'

const meta: Meta<typeof CouponStoragePage> = {
    title: 'Pages/Profile/CouponStoragePage',
    component: CouponStoragePage,
    tags: ['autodocs'],
    decorators: [],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '보유한 쿠폰을 관리하는 페이지입니다. 사용 전/사용 후 필터로 쿠폰을 구분하여 볼 수 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof CouponStoragePage>

export const Default: Story = {}

export const UnusedCoupons: Story = {
    parameters: {
        docs: {
            description: {
                story: '사용 전 쿠폰 목록입니다.'
            }
        }
    }
}

export const UsedCoupons: Story = {
    parameters: {
        docs: {
            description: {
                story: '사용 후 쿠폰 목록입니다.'
            }
        }
    }
}

export const EmptyState: Story = {
    parameters: {
        docs: {
            description: {
                story: '쿠폰이 없는 빈 상태입니다.'
            }
        }
    }
}
