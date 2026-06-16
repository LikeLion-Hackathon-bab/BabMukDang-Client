/**
 * @fileoverview MSW Handler 통합 진입점
 *
 * 모든 API mock handler를 여기서 통합하여 export합니다.
 * endpoints.ts에 정의된 모든 엔드포인트에 대한 핸들러를 포함합니다.
 */

// Domain handlers
import { articleHandlers } from './article.handlers'
import { authHandlers } from './auth.handlers'
import { profileHandlers } from './profile.handlers'
import { friendHandlers } from './friend.handlers'
import { preferenceHandlers } from './preference.handlers'
import { mealStatusHandlers } from './meal-status.handlers'
import { challengeHandlers } from './challenge.handlers'
import { couponHandlers } from './coupon.handlers'
import { mealPlanHandlers } from './mealPlan.handlers'
import { mealGroupHandlers } from './mealGroup.handlers'

/**
 * 모든 MSW request handler 배열
 * browser.ts 또는 server.ts에서 사용됩니다.
 *
 * @example
 * import { handlers } from './handlers'
 * const worker = setupWorker(...handlers)
 */
export const handlers = [
    // Auth (인증)
    ...authHandlers,

    // Articles (게시글)
    ...articleHandlers,

    // Profile (프로필)
    ...profileHandlers,

    // Friends (친구)
    ...friendHandlers,

    // Preferences (선호도)
    ...preferenceHandlers,

    // Meal Status (식사 상태)
    ...mealStatusHandlers,

    // Challenge (챌린지)
    ...challengeHandlers,

    // Coupons (쿠폰)
    ...couponHandlers,

    // MealPlan (밥약)
    ...mealPlanHandlers,

    // MealGroup (밥그룹)
    ...mealGroupHandlers
]

// 개별 핸들러 export (테스트에서 선택적 사용)
export {
    articleHandlers,
    authHandlers,
    profileHandlers,
    friendHandlers,
    preferenceHandlers,
    mealStatusHandlers,
    challengeHandlers,
    couponHandlers,
    mealPlanHandlers,
    mealGroupHandlers
}
