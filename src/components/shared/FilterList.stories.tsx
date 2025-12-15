import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { FilterList } from './FilterList'

const meta: Meta<typeof FilterList> = {
    title: 'Shared/FilterList',
    component: FilterList,
    tags: ['autodocs'],
    argTypes: {
        filterList: {
            control: 'object',
            description: '필터 목록'
        },
        activeFilter: {
            control: 'object',
            description: '현재 활성화된 필터'
        },
        setActiveFilter: {
            action: 'setActiveFilter',
            description: '필터 변경 핸들러'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        }
    },    decorators: [
        Story => (
            <div className="p-20">
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

const defaultFilters = [
    { key: 'all', label: '전체' },
    { key: 'korean', label: '한식' },
    { key: 'japanese', label: '일식' },
    { key: 'chinese', label: '중식' },
    { key: 'western', label: '양식' }
]

export const Default: Story = {
    args: {
        filterList: defaultFilters,
        activeFilter: { key: 'all', label: '전체' }
    }
}

export const KoreanSelected: Story = {
    args: {
        filterList: defaultFilters,
        activeFilter: { key: 'korean', label: '한식' }
    }
}

export const FewFilters: Story = {
    args: {
        filterList: [
            { key: 'all', label: '전체' },
            { key: 'favorites', label: '즐겨찾기' }
        ],
        activeFilter: { key: 'all', label: '전체' }
    }
}

export const ManyFilters: Story = {
    args: {
        filterList: [
            { key: 'all', label: '전체' },
            { key: 'korean', label: '한식' },
            { key: 'japanese', label: '일식' },
            { key: 'chinese', label: '중식' },
            { key: 'western', label: '양식' },
            { key: 'southeast', label: '동남아' },
            { key: 'fast', label: '패스트푸드' },
            { key: 'cafe', label: '카페' }
        ],
        activeFilter: { key: 'all', label: '전체' }
    },
    decorators: [
        Story => (
            <div className="max-w-400 overflow-x-auto p-20">
                <Story />
            </div>
        )
    ]
}

// Interactive story with state
const InteractiveFilterList = () => {
    const [activeFilter, setActiveFilter] = useState(defaultFilters[0])

    return (
        <FilterList
            filterList={defaultFilters}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
        />
    )
}

export const Interactive: Story = {
    render: () => <InteractiveFilterList />
}
