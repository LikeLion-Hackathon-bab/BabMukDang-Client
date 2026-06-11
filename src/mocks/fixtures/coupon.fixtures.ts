/** @fileoverview Coupon mock fixtures */
import type { CouponResponse } from '@/apis'

const coupon = (data: Omit<CouponResponse, 'couponId'> & { couponId: number }) =>
    ({ ...data, couponId: data.couponId as CouponResponse['couponId'] }) satisfies CouponResponse

export const mockCouponResponses: CouponResponse[] = [
    coupon({ couponId: 1, title: '동학 주점 2000원 할인', shopName: '동학 주점', type: 'DISCOUNT', condition: '15,000원 이상 주문 시', expiresAt: '2025-09-16', used: true, thumbnailUrl: 'https://example.com/test/coupon-restaurant.png' }),
    coupon({ couponId: 2, title: '동학 주점 음료 서비스', shopName: '동학 주점', type: 'SERVICE', condition: '메인 메뉴 주문 시', expiresAt: '2025-09-16', used: true, thumbnailUrl: 'https://example.com/test/coupon-restaurant.png' }),
    coupon({ couponId: 3, title: '오하이요 1000원 할인', shopName: '오하이요', type: 'DISCOUNT', condition: '10,000원 이상 주문 시', expiresAt: '2025-09-16', used: false, thumbnailUrl: 'https://example.com/test/coupon-restaurant.png' }),
    coupon({ couponId: 4, title: '맛있는 중식당 탕수육 서비스', shopName: '맛있는 중식당', type: 'SERVICE', condition: '2인 이상 주문 시', expiresAt: '2025-09-16', used: false, thumbnailUrl: 'https://example.com/test/coupon-restaurant.png' })
]

export const mockAvailableCoupons = mockCouponResponses.filter(c => !c.used)
export const mockUsedCoupons = mockCouponResponses.filter(c => c.used)
export const mockSingleCouponResponse: CouponResponse = mockCouponResponses[2]
export const MockCouponList = mockCouponResponses
