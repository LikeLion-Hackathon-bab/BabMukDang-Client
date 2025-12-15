import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

import { ProfileModal } from './ProfileModal'

const meta: Meta<typeof ProfileModal> = {
    title: 'Modals/ProfileModal',
    component: ProfileModal,
    tags: ['autodocs'],
    argTypes: {
        id: {
            control: 'text',
            description: '모달의 고유 ID'
        },
        likes: {
            control: 'object',
            description: '좋아하는 음식 목록'
        },
        dislikes: {
            control: 'object',
            description: '싫어하는 음식 목록'
        },
        allergies: {
            control: 'object',
            description: '알레르기 음식 목록'
        },
        onClose: {
            action: 'onClose',
            description: '모달 닫기 시 호출되는 콜백'
        },
        onAccept: {
            action: 'onAccept',
            description: '모달 확인 시 호출되는 콜백'
        }
    },
    args: {
        onClose: fn(),
        onAccept: fn()
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        id: 'profile-modal',
        likes: ['한식', '일식', '중식', '양식'],
        dislikes: ['매운 음식'],
        allergies: ['땅콩']
    }
}

export const ManyLikes: Story = {
    args: {
        id: 'many-likes-modal',
        likes: [
            '한식',
            '일식',
            '중식',
            '양식',
            '태국',
            '베트남',
            '인도',
            '멕시코'
        ],
        dislikes: ['패스트푸드'],
        allergies: []
    }
}

export const ManyDislikes: Story = {
    args: {
        id: 'many-dislikes-modal',
        likes: ['한식'],
        dislikes: ['매운 음식', '짠 음식', '기름진 음식', '느끼한 음식'],
        allergies: ['갑각류', '유제품', '글루텐']
    }
}

export const NoAllergies: Story = {
    args: {
        id: 'no-allergies-modal',
        likes: ['한식', '일식', '중식'],
        dislikes: ['매운 음식'],
        allergies: []
    }
}

export const OnlyAllergies: Story = {
    args: {
        id: 'only-allergies-modal',
        likes: ['모든 음식'],
        dislikes: [],
        allergies: ['땅콩', '갑각류', '우유', '밀', '계란']
    }
}

export const MinimalPreferences: Story = {
    args: {
        id: 'minimal-modal',
        likes: ['음식'],
        dislikes: [],
        allergies: []
    }
}
