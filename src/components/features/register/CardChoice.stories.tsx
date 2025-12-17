import type { Meta, StoryObj } from '@storybook/react'
import { CardChoice } from './CardChoice'

const meta: Meta<typeof CardChoice> = {
    title: 'Features/Register/CardChoice',
    component: CardChoice,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        label: {
            control: 'text',
            description: '카드 라벨'
        },
        selected: {
            control: 'boolean',
            description: '선택 상태'
        },
        className: {
            control: 'text',
            description: '추가 클래스명'
        },
        onToggle: {
            action: 'toggled',
            description: '토글 핸들러'
        }
    },}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        label: '한식',
        selected: false
    }
}

export const Selected: Story = {
    args: {
        label: '한식',
        selected: true
    }
}

export const LongLabel: Story = {
    args: {
        label: '동남아시아 음식',
        selected: false
    }
}

export const WithInteraction: Story = {
    args: {
        label: '일식',
        selected: false
    },
}

// Multiple cards example
export const MultipleCards: Story = {
    render: () => (
        <div className="flex flex-wrap gap-10">
            <CardChoice
                label="한식"
                selected={true}
                onToggle={() => {}}
            />
            <CardChoice
                label="중식"
                selected={false}
                onToggle={() => {}}
            />
            <CardChoice
                label="일식"
                selected={true}
                onToggle={() => {}}
            />
            <CardChoice
                label="양식"
                selected={false}
                onToggle={() => {}}
            />
            <CardChoice
                label="디저트"
                selected={false}
                onToggle={() => {}}
            />
        </div>
    )
}
