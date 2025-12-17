import type { Meta, StoryObj } from '@storybook/react'
import { LocalNewsNotiCard } from './LocalNewsNotiCard'

const meta: Meta<typeof LocalNewsNotiCard> = {
    title: 'Features/Home/Noti/LocalNewsNotiCard',
    component: LocalNewsNotiCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const School: Story = {
    args: {
        noti: {
            id: 1,
            type: 'school',
            title: '학교 공지',
            time: '1시간 전',
            message: '오늘의 학식 메뉴: 김치찌개, 돈까스, 샐러드',
            period: '2024.12.15',
            imageUrl: 'https://picsum.photos/60/60'
        }
    }
}

export const Restaurant: Story = {
    args: {
        noti: {
            id: 2,
            type: 'restaurant',
            title: '맛집 소식',
            time: '2시간 전',
            message: '신규 오픈! 첫 방문 고객 10% 할인',
            period: '2024.12.15 ~ 2024.12.31',
            imageUrl: 'https://picsum.photos/60/60'
        }
    }
}

export const Area: Story = {
    args: {
        noti: {
            id: 3,
            type: 'area',
            title: '동네 소식',
            time: '어제',
            message: '근처 카페에서 커피 무료 이벤트 진행 중!',
            period: '2024.12.14 ~ 2024.12.16',
            imageUrl: 'https://picsum.photos/60/60'
        }
    }
}

export const WithoutImage: Story = {
    args: {
        noti: {
            id: 4,
            type: 'area',
            title: '동네 소식',
            time: '3일 전',
            message: '이미지 없는 알림입니다.',
            period: '2024.12.12'
        }
    }
}
