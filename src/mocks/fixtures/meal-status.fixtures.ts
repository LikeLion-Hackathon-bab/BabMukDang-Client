/**
 * @fileoverview Meal Status (식사 상태) 관련 Mock Fixtures
 *
 * 식사 상태 관련 테스트 및 개발용 mock 데이터를 정의합니다.
 */

import type { MealStatusResponse, UpdateMealStatusRequest } from '@/apis'

/**
 * 식사 상태 응답 mock 데이터 (공복 상태)
 */
export const mockFastingStatus: MealStatusResponse = {
    status: 'FASTING',
    lastMealAt: '2024-12-17T08:30:00',
    fastingMinutes: 240,
    fastingHours: 4,
    secondsToAutoOff: 0
}

/**
 * 식사 상태 응답 mock 데이터 (식사 후 상태)
 */
export const mockFedStatus: MealStatusResponse = {
    status: 'FED',
    lastMealAt: '2024-12-17T12:30:00',
    fastingMinutes: 0,
    fastingHours: 0,
    secondsToAutoOff: 10800 // 3시간 후 자동 OFF
}

/**
 * 기본 식사 상태 응답 mock
 */
export const mockMealStatus: MealStatusResponse = mockFastingStatus

/**
 * 식사 상태 업데이트 요청 mock 데이터 (밥 먹음)
 */
export const mockAteNowRequest: UpdateMealStatusRequest = {
    action: 'ATE_NOW'
}

/**
 * 식사 상태 업데이트 요청 mock 데이터 (공복 시작)
 */
export const mockSetOffRequest: UpdateMealStatusRequest = {
    action: 'SET_OFF'
}
