/**
 * @fileoverview Challenge (챌린지) 관련 Mock Fixtures
 *
 * 챌린지 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 */

import type {
    ChallengeStatusResponse,
    WeekProgress,
    MonthProgress
} from '@/apis'

/**
 * 주간 진행 상황 mock 데이터
 */
export const mockWeekProgress: WeekProgress = {
    days: [true, true, false, true, false, false, false], // 월화수목금토일
    completed: 3,
    goal: 5
}

/**
 * 월간 진행 상황 mock 데이터
 */
export const mockMonthProgress: MonthProgress = {
    count: 12,
    goal: 20
}

/**
 * 챌린지 상태 응답 mock 데이터 (진행 중)
 */
export const mockChallengeStatusInProgress: ChallengeStatusResponse = {
    week: mockWeekProgress,
    month: mockMonthProgress,
    weekRewardAvailable: false,
    monthRewardAvailable: false
}

/**
 * 챌린지 상태 응답 mock 데이터 (주간 목표 달성)
 */
export const mockChallengeStatusWeekComplete: ChallengeStatusResponse = {
    week: {
        days: [true, true, true, true, true, false, false],
        completed: 5,
        goal: 5
    },
    month: mockMonthProgress,
    weekRewardAvailable: true,
    monthRewardAvailable: false
}

/**
 * 기본 챌린지 상태 응답 mock
 */
export const mockChallengeStatus: ChallengeStatusResponse =
    mockChallengeStatusInProgress
