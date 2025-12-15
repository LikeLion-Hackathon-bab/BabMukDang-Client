import type { Meta, StoryObj } from '@storybook/react'
import { MatchingInviteList } from './MatchingInviteList'
import { fn } from '@storybook/test'

const meta: Meta<typeof MatchingInviteList> = {
    title: 'Features/Home/Noti/MatchingInviteList',
    component: MatchingInviteList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        handleDeleteMatchingNoti: {
            action: 'delete clicked',
            description: '삭제 핸들러'
        },
        handleMatchingInviteNotiClick: {
            action: 'noti clicked',
            description: '알림 클릭 핸들러'
        }
    },
    args: {
        handleDeleteMatchingNoti: fn(),
        handleMatchingInviteNotiClick: fn()
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockMatchingNotis = [
    {
        id: 1,
        type: 'invitation' as const,
        title: '밥약 초대',
        time: '방금 전',
        message: '홍길동님이 밥약에 초대했어요!',
        period: '2024.12.15 12:00',
        imageUrl: 'https://picsum.photos/60/60'
    },
    {
        id: 2,
        type: 'announcement' as const,
        title: '공고 알림',
        time: '1시간 전',
        message: '새로운 밥약 공고가 올라왔어요!',
        period: '2024.12.15 18:00',
        imageUrl: 'https://picsum.photos/60/60'
    },
    {
        id: 3,
        type: 'invitation' as const,
        title: '밥약 초대',
        time: '2시간 전',
        message: '김철수님이 밥약에 초대했어요!',
        period: '2024.12.16 13:00',
        imageUrl: 'https://picsum.photos/60/60'
    }
]

export const Default: Story = {
    args: {
        matchingNotis: mockMatchingNotis
    }
}

export const Empty: Story = {
    args: {
        matchingNotis: []
    }
}

export const InvitationOnly: Story = {
    args: {
        matchingNotis: mockMatchingNotis.filter(n => n.type === 'invitation')
    }
}

export const AnnouncementOnly: Story = {
    args: {
        matchingNotis: mockMatchingNotis.filter(n => n.type === 'announcement')
    }
}
