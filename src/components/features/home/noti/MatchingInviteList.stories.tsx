import type { Meta, StoryObj } from '@storybook/react'
import { MatchingInviteList } from './MatchingInviteList'
import type { MatchingInviteNoti } from '@/viewModels'

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
    }
}

export default meta
type Story = StoryObj<typeof meta>

const roomId = (value: string): MatchingInviteNoti['roomId'] =>
    value as MatchingInviteNoti['roomId']

const mockMatchingNotis: MatchingInviteNoti[] = [
    {
        notificationId: 'noti-1',
        kind: 'invitation',
        roomType: 'invitation',
        title: '밥약 초대',
        createdAt: '방금 전',
        message: '홍길동님이 밥약에 초대했어요!',
        readAt: null,
        roomId: roomId('1')
    },
    {
        notificationId: 'noti-2',
        kind: 'recruit',
        roomType: 'recruit',
        title: '공고 알림',
        createdAt: '1시간 전',
        message: '새로운 밥약 공고가 올라왔어요!',
        readAt: null,
        roomId: roomId('2')
    },
    {
        notificationId: 'noti-3',
        kind: 'invitation',
        roomType: 'invitation',
        title: '밥약 초대',
        createdAt: '2시간 전',
        message: '김철수님이 밥약에 초대했어요!',
        readAt: null,
        roomId: roomId('3')
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
        matchingNotis: mockMatchingNotis.filter(n => n.kind === 'invitation')
    }
}

export const RecruitOnly: Story = {
    args: {
        matchingNotis: mockMatchingNotis.filter(n => n.kind === 'recruit')
    }
}
