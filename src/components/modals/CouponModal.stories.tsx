import type { Meta, StoryObj } from '@storybook/react'

import { CouponModal } from './CouponModal'

const meta: Meta<typeof CouponModal> = {
    title: 'Modals/CouponModal',
    component: CouponModal,
    tags: ['autodocs'],
    argTypes: {
        open: {
            control: 'boolean',
            description: '모달이 열려 있는지 여부'
        },
        id: {
            control: 'text',
            description: '모달의 고유 ID'
        },
        restaurantName: {
            control: 'text',
            description: '음식점 이름'
        },
        condition: {
            control: 'text',
            description: '쿠폰 사용 조건'
        },
        serviceItem: {
            control: 'text',
            description: '서비스 항목'
        },
        canUseAgain: {
            control: 'boolean',
            description: '재사용 가능 여부'
        },
        expirationDate: {
            control: 'text',
            description: '유효기간'
        },
        couponType: {
            control: 'text',
            description: '쿠폰 유형'
        },
        couponImageUrl: {
            control: 'text',
            description: '쿠폰 이미지 URL'
        },
        onClose: {
            action: 'onClose',
            description: '모달 닫기 시 호출되는 콜백'
        },
        onAccept: {
            action: 'onAccept',
            description: '모달 확인 시 호출되는 콜백'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        open: true,
        id: 'coupon-modal',
        restaurantName: '마초쉐프',
        condition: '15,000원 이상 주문 시',
        serviceItem: '음료 1잔 서비스',
        canUseAgain: true,
        expirationDate: '2024.12.31',
        couponType: '서비스',
        couponImageUrl: '/test/restaurant1.png'
    }
}

export const DiscountCoupon: Story = {
    args: {
        open: true,
        id: 'discount-coupon-modal',
        restaurantName: '청년다방',
        condition: '20,000원 이상 주문 시',
        serviceItem: '3,000원 할인',
        canUseAgain: false,
        expirationDate: '2024.11.30',
        couponType: '할인',
        couponImageUrl: '/test/restaurant2.png'
    }
}

export const OneTimeCoupon: Story = {
    args: {
        open: true,
        id: 'onetime-coupon-modal',
        restaurantName: '본죽',
        condition: '첫 방문 고객 한정',
        serviceItem: '죽 사이즈 업',
        canUseAgain: false,
        expirationDate: '2024.10.31',
        couponType: '이벤트',
        couponImageUrl: '/test/restaurant3.png'
    }
}

export const ReusableCoupon: Story = {
    args: {
        open: true,
        id: 'reusable-coupon-modal',
        restaurantName: '스타벅스',
        condition: '음료 주문 시',
        serviceItem: '텀블러 할인 500원',
        canUseAgain: true,
        expirationDate: '2025.01.31',
        couponType: '친환경',
        couponImageUrl: '/test/restaurant4.png'
    }
}

export const Closed: Story = {
    args: {
        open: false,
        id: 'closed-coupon-modal',
        restaurantName: '마초쉐프',
        condition: '15,000원 이상 주문 시',
        serviceItem: '음료 1잔 서비스',
        canUseAgain: true,
        expirationDate: '2024.12.31',
        couponType: '서비스',
        couponImageUrl: '/test/restaurant1.png'
    }
}
