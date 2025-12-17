import type { Meta, StoryObj } from '@storybook/react'
import { LocationCadidateItem } from './LocationCadidateItem'

const meta: Meta<typeof LocationCadidateItem> = {
    title: 'Features/Onboarding/LocationCadidateItem',
    component: LocationCadidateItem,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        onClick: {
            action: 'item clicked',
            description: '아이템 클릭 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        location: {
            placeName: '강남역',
            address: '서울특별시 강남구 역삼동',
            isSelected: false
        }
    }
}

export const Selected: Story = {
    args: {
        location: {
            placeName: '강남역',
            address: '서울특별시 강남구 역삼동',
            isSelected: true
        }
    }
}

export const LongName: Story = {
    args: {
        location: {
            placeName: '아주 긴 이름의 장소입니다',
            address: '서울특별시 강남구 테헤란로 123번길 45 ABC빌딩 1층',
            isSelected: false
        }
    }
}
