import type { Meta, StoryObj } from '@storybook/react'
import { SwipeableCard } from './SwipeableCard'
import { fn } from '@storybook/test'

const meta: Meta<typeof SwipeableCard> = {
    title: 'Features/Home/Noti/SwipeableCard',
    component: SwipeableCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        threshold: {
            control: { type: 'range', min: 20, max: 100, step: 10 },
            description: '스와이프 임계값'
        },
        duration: {
            control: { type: 'range', min: 100, max: 500, step: 50 },
            description: '애니메이션 지속 시간(ms)'
        },
        deleteButtonWidth: {
            control: { type: 'range', min: 60, max: 120, step: 10 },
            description: '삭제 버튼 너비'
        },
        resistance: {
            control: { type: 'range', min: 0.1, max: 0.9, step: 0.1 },
            description: '스와이프 저항'
        },
        className: {
            control: 'text',
            description: '추가 클래스명'
        },
        onDelete: {
            action: 'delete clicked',
            description: '삭제 핸들러'
        }
    },
    args: {
        onDelete: fn()
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        children: (
            <div className="flex w-full flex-col gap-10 bg-white px-20 py-16">
                <div className="flex w-full flex-row items-center justify-between">
                    <span className="text-body2-semibold text-gray-7">
                        스와이프 카드
                    </span>
                    <span className="text-caption-medium text-gray-3">
                        방금 전
                    </span>
                </div>
                <span className="text-caption-medium text-gray-5">
                    왼쪽으로 스와이프하여 삭제할 수 있습니다.
                </span>
            </div>
        )
    }
}

export const CustomThreshold: Story = {
    args: {
        threshold: 100,
        children: (
            <div className="flex w-full flex-col gap-10 bg-white px-20 py-16">
                <span className="text-body2-semibold text-gray-7">
                    높은 임계값 (100px)
                </span>
                <span className="text-caption-medium text-gray-5">
                    더 많이 스와이프해야 삭제됩니다.
                </span>
            </div>
        )
    }
}

export const FastAnimation: Story = {
    args: {
        duration: 150,
        children: (
            <div className="flex w-full flex-col gap-10 bg-white px-20 py-16">
                <span className="text-body2-semibold text-gray-7">
                    빠른 애니메이션
                </span>
                <span className="text-caption-medium text-gray-5">
                    150ms 애니메이션
                </span>
            </div>
        )
    }
}
