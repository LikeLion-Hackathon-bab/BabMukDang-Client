import type { Meta, StoryObj } from '@storybook/react'
import { MealPlanNotificationCard } from './MealPlanNotificationCard'
import type { MealPlanNotificationView } from '@/viewModels'
import { domainId } from '@/domain/factories'

const meta: Meta<typeof MealPlanNotificationCard> = {
    title: 'Features/Home/Noti/MealPlanNotificationCard',
    component: MealPlanNotificationCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        onClick: {
            action: 'card clicked',
            description: '카드 클릭 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockNotification: MealPlanNotificationView = {
    notificationId: 'noti-1',
    kind: 'MEAL_PLAN_INVITE_RECEIVED',
    mealPlanId: domainId.mealPlan('00000000-0000-4000-8000-000000000001'),
    deepLink: '/meal-plans/meal-plan-1',
    title: '새 밥약 초대가 도착했어요',
    createdAt: '2026-06-16T09:00:00.000Z',
    createdAtLabel: '방금 전',
    message: '홍길동님이 점심 밥약에 초대했어요.',
    readAt: null
}

export const Unread: Story = {
    args: {
        notification: mockNotification
    }
}

export const Read: Story = {
    args: {
        notification: {
            ...mockNotification,
            readAt: '2026-06-16T09:05:00.000Z'
        }
    }
}
