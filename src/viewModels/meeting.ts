import type { MealPlanCardView } from './api'

/**
 * Phase 4 화면 교체 전까지 파일명만 남아 있는 compatibility view model.
 * 데이터 모델은 MealPlanCardView를 사용한다.
 */
export type MeetingCardView = MealPlanCardView
export type MeetingHeaderView = Pick<
    MealPlanCardView,
    'title' | 'scheduleText' | 'placeText'
>
