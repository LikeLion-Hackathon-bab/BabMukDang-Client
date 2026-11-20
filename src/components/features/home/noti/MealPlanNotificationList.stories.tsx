import type { Meta, StoryObj } from '@storybook/react'
import { MealPlanNotificationList } from './MealPlanNotificationList'
import type { MealPlanNotificationView } from '@/viewModels'
import { domainId } from '@/domain/factories'

const meta: Meta<typeof MealPlanNotificationList> = {
    title: 'Features/Home/Noti/MealPlanNotificationList',
    component: MealPlanNotificationList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        onDeleteNotification: {
            action: 'delete clicked',
            description: '삭제 핸들러'
        },
        onNotificationClick: {
            action: 'notification clicked',
            description: '알림 클릭 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockNotifications: MealPlanNotificationView[] = [
    {
        notificationId: 'noti-1',
        kind: 'MEAL_PLAN_INVITE_RECEIVED',
        mealPlanId: domainId.mealPlan('00000000-0000-4000-8000-000000000001'),
        deepLink: '/meal-plans/meal-plan-1',
        title: '새 밥약 초대가 도착했어요',
        createdAt: '2026-06-16T09:00:00.000Z',
        createdAtLabel: '방금 전',
        message: '홍길동님이 점심 밥약에 초대했어요.',
        readAt: null
    },
    {
        notificationId: 'noti-2',
        kind: 'MEAL_PLAN_READY_COMPLETED',
        mealPlanId: domainId.mealPlan('00000000-0000-4000-8000-000000000002'),
        deepLink: '/meal-plans/meal-plan-2',
        title: '모두 준비 완료했어요',
        createdAt: '2026-06-16T08:00:00.000Z',
        createdAtLabel: '1시간 전',
        message: '저녁 밥약 참여자들이 모두 준비 완료했어요.',
        readAt: null
    },
    {
        notificationId: 'noti-3',
        kind: 'MEAL_PLAN_RECORD_NEEDED',
        mealPlanId: domainId.mealPlan('00000000-0000-4000-8000-000000000003'),
        deepLink: '/meal-plans/meal-plan-3/record',
        title: '밥 기록을 남겨주세요',
        createdAt: '2026-06-16T07:00:00.000Z',
        createdAtLabel: '2시간 전',
        message: '점심 밥약이 완료됐어요. 같이 먹은 밥을 기록해 주세요.',
        readAt: null
    }
]

export const Default: Story = {
    args: {
        notifications: mockNotifications
    }
}

export const Empty: Story = {
    args: {
        notifications: []
    }
}
