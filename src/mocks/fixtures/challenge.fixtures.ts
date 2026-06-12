/**
 * @fileoverview Challenge (챌린지) 관련 Mock Fixtures
 *
 * Shared challenge status follows the backend week/month progress response.
 */

import type {
    ChallengeStatusResponse,
    WeekProgress,
    MonthProgress
} from '@/apis'

export const mockWeekProgress: WeekProgress = {
    days: [true, true, false, true, false, false, false],
    completed: 3,
    goal: 5
}

export const mockMonthProgress: MonthProgress = {
    count: 12,
    goal: 20
}

export const mockChallengeStatusView = {
    week: mockWeekProgress,
    month: mockMonthProgress,
    weekRewardAvailable: false,
    monthRewardAvailable: false
}

export const mockChallengeStatusWeekCompleteView = {
    week: {
        days: [true, true, true, true, true, false, false],
        completed: 5,
        goal: 5
    },
    month: mockMonthProgress,
    weekRewardAvailable: true,
    monthRewardAvailable: false
}

export const mockChallengeStatusInProgress: ChallengeStatusResponse = {
    week: mockWeekProgress,
    month: mockMonthProgress,
    weekRewardAvailable: false,
    monthRewardAvailable: false
}

export const mockChallengeStatusWeekComplete: ChallengeStatusResponse = {
    week: mockChallengeStatusWeekCompleteView.week,
    month: mockMonthProgress,
    weekRewardAvailable: true,
    monthRewardAvailable: false
}

export const mockChallengeStatus: ChallengeStatusResponse =
    mockChallengeStatusInProgress
