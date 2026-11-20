/** @fileoverview MealPlan mock fixtures used by legacy story placeholders. */
import type { MyMealPlanListItem } from '@/apis/types'
import { mapMyMealPlanListItem } from '@/apis/mappers/mealPlan.mapper'

const now = '2026-06-16T09:00:00.000Z'

const createMealPlanItem = ({
    id,
    title,
    status,
    group
}: {
    id: string
    title: string
    status: MyMealPlanListItem['status']
    group: MyMealPlanListItem['group']
}): MyMealPlanListItem => ({
    mealPlanId: id as MyMealPlanListItem['mealPlanId'],
    group,
    title,
    status,
    channels: ['OWNER_ONLY'],
    participantCount: 2,
    selectedDate: '2026-06-16',
    selectedTime: '12:30',
    selectedAreaName: '서울과학기술대학교 정문 앞',
    selectedRestaurantName: '동학 주점',
    primaryAction: {
        label: '밥약 보기',
        href: `/meal-plans/${id}`
    },
    updatedAt: now
})

export const mockMealPlanListItems: MyMealPlanListItem[] = [
    createMealPlanItem({
        id: '11111111-1111-4111-8111-111111111111',
        title: '점심 밥약',
        status: 'DECIDING',
        group: 'DECIDING'
    }),
    createMealPlanItem({
        id: '22222222-2222-4222-8222-222222222222',
        title: '저녁 밥약',
        status: 'CONFIRMED',
        group: 'UPCOMING'
    })
]

export const mockSingleMealPlanListItem = mockMealPlanListItems[0]
export const MockMealPlanList = mockMealPlanListItems.map(mapMyMealPlanListItem)

export const mockMeetingResponses = mockMealPlanListItems
export const mockSingleMeetingResponse = mockSingleMealPlanListItem
export const MockMeetingList = MockMealPlanList
