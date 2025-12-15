import type { Meta, StoryObj } from '@storybook/react'
import { LocationVoteItem } from './LocationVoteItem'
import { fn } from '@storybook/test'

const meta: Meta<typeof LocationVoteItem> = {
    title: 'Features/Onboarding/LocationVoteItem',
    component: LocationVoteItem,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        isSelected: {
            control: 'boolean',
            description: '선택 상태'
        },
        handleLocationSelect: {
            action: 'location selected',
            description: '위치 선택 핸들러'
        }
    },
    args: {
        handleLocationSelect: fn()
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        location: {
            id: '1',
            address: '서울특별시 강남구 역삼동',
            placeName: '강남역'
        },
        isSelected: false
    }
}

export const Selected: Story = {
    args: {
        location: {
            id: '1',
            address: '서울특별시 강남구 역삼동',
            placeName: '강남역'
        },
        isSelected: true
    }
}

export const LongAddress: Story = {
    args: {
        location: {
            id: '2',
            address: '서울특별시 강남구 테헤란로 123번길 45 ABC빌딩 1층',
            placeName: '긴 주소 장소'
        },
        isSelected: false
    }
}
