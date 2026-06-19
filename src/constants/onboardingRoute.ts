import type { MealPlanDecisionTaskKey } from '@kimdaegyu/babmukdang-shared/domain'

/**
 * Legacy match-onboarding route metadata migrated into MealPlanDecisionWorkflow.
 * The old recruit/invitation linear routes are gone, but the useful copy,
 * progress order, and voting constraints now describe the MealPlan task graph.
 */
export const mealPlanDecisionTaskOrder: Record<
    MealPlanDecisionTaskKey,
    number
> = {
    SCHEDULE_DATE: 1,
    SCHEDULE_TIME: 2,
    LOCATION_CANDIDATE: 3,
    LOCATION_VOTE: 4,
    EXCLUDE_MENU: 5,
    PREFER_MENU: 6,
    MENU_PICK: 7,
    RESTAURANT_SEARCH: 8,
    RESTAURANT_PICK: 9,
    FINAL_CONFIRMATION: 10
}

export const mealPlanDecisionTaskTitleMap: Record<
    MealPlanDecisionTaskKey,
    string
> = {
    SCHEDULE_DATE: '만날 날짜를 정해보아요.',
    SCHEDULE_TIME: '만날 시간을 정해보아요.',
    LOCATION_CANDIDATE: '만날 장소를 더 구체화 해봐요.',
    LOCATION_VOTE: '만날 장소를 정해보아요.',
    EXCLUDE_MENU: '최근에 먹은 메뉴예요. 또 먹어도 괜찮아요?',
    PREFER_MENU: '먹고 싶은 메뉴를 표시해보아요.',
    MENU_PICK: '오늘의 메뉴를 골라보아요.',
    RESTAURANT_SEARCH: '만남 장소 근처 맛집을 찾아보아요.',
    RESTAURANT_PICK: '만남 장소 근처 맛집 중 골라보아요.',
    FINAL_CONFIRMATION: '최종 밥약을 확인해보아요.'
}

export const mealPlanDecisionTaskDescriptionMap: Partial<
    Record<MealPlanDecisionTaskKey, string>
> = {
    SCHEDULE_DATE: '함께 시간을 보낼 수 있는 날짜를 모두 골라주세요.',
    SCHEDULE_TIME: '가능한 시간대를 모두 선택해주세요.',
    LOCATION_CANDIDATE:
        '지도에 위치를 클릭하거나, 장소 검색을 통해 장소를 추가할 수 있어요.',
    LOCATION_VOTE: '장소 후보가 모이면 가장 좋은 장소에 투표해보아요.',
    EXCLUDE_MENU: '피하고 싶은 메뉴를 먼저 제외하면 추천 품질이 좋아져요.',
    PREFER_MENU: '먹고 싶은 메뉴를 표시하면 메뉴 후보 점수에 반영돼요.',
    MENU_PICK: '후보 중 가장 먹고 싶은 메뉴를 골라주세요.',
    RESTAURANT_SEARCH: '장소와 메뉴가 정해지면 식당 후보가 갱신돼요.',
    RESTAURANT_PICK: '식당 후보 중 함께 가고 싶은 곳을 골라주세요.',
    FINAL_CONFIRMATION:
        '모든 핵심 결정이 준비되면 소유자가 밥약을 확정할 수 있어요.'
}

export const mealPlanDecisionTaskVoteLimitMap: Partial<
    Record<MealPlanDecisionTaskKey, string>
> = {
    SCHEDULE_DATE: '중복 투표',
    SCHEDULE_TIME: '1인 1투표',
    LOCATION_CANDIDATE: '1인 최대 2개 추가',
    LOCATION_VOTE: '1인 1투표',
    EXCLUDE_MENU: '중복 투표',
    PREFER_MENU: '중복 투표',
    MENU_PICK: '중복 투표',
    RESTAURANT_PICK: '1인 1투표',
    FINAL_CONFIRMATION: '전체 Ready'
}
