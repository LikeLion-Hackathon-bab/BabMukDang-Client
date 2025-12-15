import type { Meta, StoryObj } from '@storybook/react'
import { MenuCard } from './MenuCard'

const meta: Meta<typeof MenuCard> = {
    title: 'Features/Onboarding/MenuCard',
    component: MenuCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        menuName: {
            control: 'text',
            description: '메뉴 이름'
        },
        currentUser: {
            control: 'text',
            description: '현재 사용자 ID'
        },
        onClick: {
            action: 'card clicked',
            description: '카드 클릭 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockCategory = {
    name: '한식',
    aspectRatio: 1,
    placeholder: {
        blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        thumbhashDataURL: 'data:image/png;base64,iVBORw0KGgo...'
    },
    images: {
        src: 'https://picsum.photos/120/140',
        avifSrcset: 'https://picsum.photos/120/140 1x'
    }
}

export const Default: Story = {
    args: {
        menuName: '한식',
        category: mockCategory,
        currentUser: 'user1',
        selectedUsers: []
    }
}

export const Selected: Story = {
    args: {
        menuName: '한식',
        category: mockCategory,
        currentUser: 'user1',
        selectedUsers: ['user1']
    }
}

export const WithOtherUsers: Story = {
    args: {
        menuName: '한식',
        category: mockCategory,
        currentUser: 'user1',
        selectedUsers: ['user2', 'user3']
    }
}

export const CurrentUserSelected: Story = {
    args: {
        menuName: '한식',
        category: mockCategory,
        currentUser: 'user1',
        selectedUsers: ['user1', 'user2', 'user3']
    }
}

export const NoCategory: Story = {
    args: {
        menuName: '기타',
        category: undefined,
        currentUser: 'user1',
        selectedUsers: []
    }
}
