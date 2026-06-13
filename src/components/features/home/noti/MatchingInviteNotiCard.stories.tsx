import type { Meta, StoryObj } from '@storybook/react'
import { MatchingInviteNotiCard } from './MatchingInviteNotiCard'
import type { MatchingInviteNoti } from '@/viewModels'

const meta: Meta<typeof MatchingInviteNotiCard> = {
    title: 'Features/Home/Noti/MatchingInviteNotiCard',
    component: MatchingInviteNotiCard,
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

const roomId = (value: string): MatchingInviteNoti['roomId'] =>
    value as MatchingInviteNoti['roomId']

export const Invitation: Story = {
    args: {
        noti: {
            notificationId: 'noti-1',
            kind: 'invitation',
            roomType: 'invitation',
            title: '밥약 초대',
            createdAt: '방금 전',
            message:
                '홍길동님이 점심 밥약에 초대했어요! 함께 맛있는 식사 어떠세요?',
            readAt: null,
            roomId: roomId('1')
        }
    }
}

export const Recruit: Story = {
    args: {
        noti: {
            notificationId: 'noti-2',
            kind: 'recruit',
            roomType: 'recruit',
            title: '공고 알림',
            createdAt: '1시간 전',
            message: '새로운 밥약 공고가 올라왔어요! 지금 바로 확인해보세요.',
            readAt: null,
            roomId: roomId('2')
        }
    }
}
