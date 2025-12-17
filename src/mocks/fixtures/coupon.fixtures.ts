/**
 * @fileoverview Coupon (쿠폰) 관련 Mock Fixtures
 *
 * 쿠폰 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 * mockData.ts에서 마이그레이션됨
 */

import type { CouponResponse } from '@/apis'

/**
 * 쿠폰 응답 mock 데이터 목록
 */
export const mockCouponResponses: CouponResponse[] = [
    {
        couponId: 1,
        title: '동학 주점 2000원 할인',
        shopName: '동학 주점',
        type: 'DISCOUNT',
        condition: '15,000원 이상 주문 시',
        expiresAt: '2025-09-16',
        used: true,
        thumbnailUrl: '/test/coupon-restaurant.png'
    },
    {
        couponId: 2,
        title: '동학 주점 음료 서비스',
        shopName: '동학 주점',
        type: 'SERVICE',
        condition: '메인 메뉴 주문 시',
        expiresAt: '2025-09-16',
        used: true,
        thumbnailUrl: '/test/coupon-restaurant.png'
    },
    {
        couponId: 3,
        title: '오하이요 1000원 할인',
        shopName: '오하이요',
        type: 'DISCOUNT',
        condition: '10,000원 이상 주문 시',
        expiresAt: '2025-09-16',
        used: false,
        thumbnailUrl: '/test/coupon-restaurant.png'
    },
    {
        couponId: 4,
        title: '맛있는 중식당 탕수육 서비스',
        shopName: '맛있는 중식당',
        type: 'SERVICE',
        condition: '2인 이상 주문 시',
        expiresAt: '2025-09-16',
        used: false,
        thumbnailUrl: '/test/coupon-restaurant.png'
    }
]

/**
 * 사용 가능한 쿠폰만 필터링
 */
export const mockAvailableCoupons = mockCouponResponses.filter(c => !c.used)

/**
 * 사용된 쿠폰만 필터링
 */
export const mockUsedCoupons = mockCouponResponses.filter(c => c.used)

/**
 * 단일 쿠폰 응답 mock
 */
export const mockSingleCouponResponse: CouponResponse = mockCouponResponses[2]

// 하위 호환성을 위한 별칭
export const MockCouponList = mockCouponResponses
