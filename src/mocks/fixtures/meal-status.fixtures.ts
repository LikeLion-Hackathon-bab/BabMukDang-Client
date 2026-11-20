/** @fileoverview Meal Status mock fixtures */
import type { MealStatusResponse, UpdateMealStatusRequest } from '@/apis'

export const mockFastingStatus: MealStatusResponse = {
    hungry: true,
    label: '공복',
    updatedAt: '2024-12-17',
    secondsToAutoOff: 0
}

export const mockFedStatus: MealStatusResponse = {
    hungry: false,
    label: '식사 완료',
    updatedAt: '2024-12-17',
    secondsToAutoOff: 10800
}

export const mockMealStatus: MealStatusResponse = mockFastingStatus

export const mockAteNowRequest: UpdateMealStatusRequest = {
    action: 'ARTICLE_UPLOAD'
}

export const mockSetOffRequest: UpdateMealStatusRequest = {
    action: 'SET_MANNUALY'
}
