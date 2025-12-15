import type { Meta, StoryObj } from '@storybook/react'
import { ProfileSection } from './ProfileSection'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof ProfileSection> = {
    title: 'Features/Profile/ProfileSection',
    component: ProfileSection,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        )
    ],
    argTypes: {
        profileImgUrl: {
            control: 'text',
            description: '프로필 이미지 URL'
        },
        name: {
            control: 'text',
            description: '사용자 이름'
        },
        description: {
            control: 'text',
            description: '자기 소개'
        },
        isFriend: {
            control: 'boolean',
            description: '친구 프로필 여부'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        profileImgUrl: 'https://picsum.photos/60/60',
        name: '홍길동',
        description: '맛있는 거 좋아해요!',
        likes: ['한식', '일식', '중식'],
        dislikes: ['매운음식'],
        allergies: ['땅콩'],
        isFriend: false
    }
}

export const FriendProfile: Story = {
    args: {
        profileImgUrl: 'https://picsum.photos/60/60',
        name: '김철수',
        description: '함께 밥 먹어요~',
        likes: ['양식', '디저트'],
        dislikes: ['생선'],
        allergies: [],
        isFriend: true
    }
}

export const ManyPreferences: Story = {
    args: {
        profileImgUrl: 'https://picsum.photos/60/60',
        name: '이영희',
        description: '다양한 음식을 좋아합니다',
        likes: ['한식', '일식', '중식', '양식', '동남아'],
        dislikes: ['매운음식', '신음식'],
        allergies: ['갑각류', '우유', '밀'],
        isFriend: false
    }
}

export const NoPreferences: Story = {
    args: {
        profileImgUrl: 'https://picsum.photos/60/60',
        name: '박지민',
        description: '가리는 거 없어요',
        likes: [],
        dislikes: [],
        allergies: [],
        isFriend: false
    }
}

export const NoProfileImage: Story = {
    args: {
        profileImgUrl: '',
        name: '최유리',
        description: '밥 먹을 사람~',
        likes: ['파스타'],
        dislikes: [],
        allergies: [],
        isFriend: false
    }
}
