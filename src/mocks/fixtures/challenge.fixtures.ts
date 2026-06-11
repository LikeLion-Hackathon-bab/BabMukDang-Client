/**
 * @fileoverview Challenge (챌린지) 관련 Mock Fixtures
 *
 * Shared challenge status is currently a minimal stub ({ count }). Keep richer
 * week/month view data separate until the domain contract is finalized.
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
    count: mockMonthProgress.count
}

export const mockChallengeStatusWeekComplete: ChallengeStatusResponse = {
    count: 5
}

export const mockChallengeStatus: ChallengeStatusResponse =
    mockChallengeStatusInProgress
