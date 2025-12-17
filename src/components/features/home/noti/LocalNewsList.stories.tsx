import type { Meta, StoryObj } from '@storybook/react'
import { LocalNewsList } from './LocalNewsList'

const meta: Meta<typeof LocalNewsList> = {
    title: 'Features/Home/Noti/LocalNewsList',
    component: LocalNewsList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        handleDeleteLocalNewsNoti: {
            action: 'delete clicked',
            description: '삭제 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockLocalNewsNotis = [
    {
        id: 1,
        type: 'school' as const,
        title: '학교 공지',
        time: '1시간 전',
        message: '학식 메뉴가 업데이트 되었습니다.',
        period: '2024.12.15 ~ 2024.12.20',
        imageUrl: 'https://picsum.photos/60/60'
    },
    {
        id: 2,
        type: 'restaurant' as const,
        title: '맛집 소식',
        time: '2시간 전',
        message: '새로운 맛집이 오픈했어요!',
        period: '2024.12.15',
        imageUrl: 'https://picsum.photos/60/60'
    },
    {
        id: 3,
        type: 'area' as const,
        title: '동네 소식',
        time: '3시간 전',
        message: '근처에 새로운 카페가 생겼어요.',
        period: '2024.12.14',
        imageUrl: 'https://picsum.photos/60/60'
    }
]

export const Default: Story = {
    args: {
        localNewsNotis: mockLocalNewsNotis
    }
}

export const Empty: Story = {
    args: {
        localNewsNotis: []
    }
}

export const SingleItem: Story = {
    args: {
        localNewsNotis: [mockLocalNewsNotis[0]]
    }
}
