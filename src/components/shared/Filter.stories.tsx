import type { Meta, StoryObj } from '@storybook/react'

import { Filter } from './Filter'

const meta: Meta<typeof Filter> = {
    title: 'Shared/Filter',
    component: Filter,
    tags: ['autodocs'],
    argTypes: {
        filter: {
            control: 'object',
            description: '필터 객체 (key, label)'
        },
        activeFilter: {
            control: 'object',
            description: '현재 활성화된 필터'
        },
        onClick: {
            action: 'onClick',
            description: '필터 클릭 핸들러'
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

export const Active: Story = {
    args: {
        filter: { key: 'all', label: '전체' },
        activeFilter: { key: 'all', label: '전체' }
    }
}

export const Inactive: Story = {
    args: {
        filter: { key: 'korean', label: '한식' },
        activeFilter: { key: 'all', label: '전체' }
    }
}

export const LongLabel: Story = {
    args: {
        filter: { key: 'southeast-asian', label: '동남아시아 음식' },
        activeFilter: { key: 'southeast-asian', label: '동남아시아 음식' }
    }
}

export const ShortLabel: Story = {
    args: {
        filter: { key: 'japanese', label: '일식' },
        activeFilter: { key: 'other', label: '기타' }
    }
}
