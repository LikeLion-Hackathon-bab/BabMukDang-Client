import type { Meta, StoryObj } from '@storybook/react'
import { MatchingInviteNotiCard } from './MatchingInviteNotiCard'

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

export const Invitation: Story = {
    args: {
        noti: {
            id: 1,
            type: 'invitation',
            title: '밥약 초대',
            time: '방금 전',
            message:
                '홍길동님이 점심 밥약에 초대했어요! 함께 맛있는 식사 어떠세요?',
            period: '2024.12.15 12:00',
            imageUrl: 'https://picsum.photos/60/60'
        }
    }
}

export const Announcement: Story = {
    args: {
        noti: {
            id: 2,
            type: 'announcement',
            title: '공고 알림',
            time: '1시간 전',
            message: '새로운 밥약 공고가 올라왔어요! 지금 바로 확인해보세요.',
            period: '2024.12.15 18:00',
            imageUrl: 'https://picsum.photos/60/60'
        }
    }
}
