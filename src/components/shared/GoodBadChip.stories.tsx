import type { Meta, StoryObj } from '@storybook/react'

import { GoodBadChip } from './GoodBadChip'

const meta: Meta<typeof GoodBadChip> = {
    title: 'Shared/GoodBadChip',
    component: GoodBadChip,
    tags: ['autodocs'],
    argTypes: {
        text: {
            control: 'text',
            description: '칩에 표시할 텍스트'
        },
        isGood: {
            control: 'boolean',
            description: '좋은 상태인지 여부 (true: 주황색, false: 회색)'
        }
    },
    decorators: [
        Story => (
            <div className="p-20">
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Good: Story = {
    args: {
        text: '서비스',
        isGood: true
    }
}

export const Bad: Story = {
    args: {
        text: '품절',
        isGood: false
    }
}

export const GoodLongText: Story = {
    args: {
        text: '음료 1잔 무료 제공',
        isGood: true
    }
}

export const BadLongText: Story = {
    args: {
        text: '주말 이용 불가',
        isGood: false
    }
}

export const AllChips: Story = {
    render: () => (
        <div className="flex flex-wrap gap-8">
            <GoodBadChip
                text="할인"
                isGood={true}
            />
            <GoodBadChip
                text="서비스"
                isGood={true}
            />
            <GoodBadChip
                text="이벤트"
                isGood={true}
            />
            <GoodBadChip
                text="품절"
                isGood={false}
            />
            <GoodBadChip
                text="만료"
                isGood={false}
            />
            <GoodBadChip
                text="제한"
                isGood={false}
            />
        </div>
    )
}
