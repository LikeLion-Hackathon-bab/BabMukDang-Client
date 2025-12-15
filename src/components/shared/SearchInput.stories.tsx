import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { useState } from 'react'

import { SearchInput } from './SearchInput'

const meta: Meta<typeof SearchInput> = {
    title: 'Shared/SearchInput',
    component: SearchInput,
    tags: ['autodocs'],
    argTypes: {
        handleSearch: {
            action: 'handleSearch',
            description: '검색 실행 핸들러'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        },
        placeholder: {
            control: 'text',
            description: '플레이스홀더 텍스트'
        }
    },
    args: {
        handleSearch: fn()
    },
    decorators: [
        Story => (
            <div className="w-full max-w-400 p-20">
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        placeholder: '검색어를 입력하세요'
    }
}

export const RestaurantSearch: Story = {
    args: {
        placeholder: '음식점 이름을 검색하세요'
    }
}

export const FriendSearch: Story = {
    args: {
        placeholder: '친구 이름을 검색하세요'
    }
}

export const LocationSearch: Story = {
    args: {
        placeholder: '장소를 검색하세요'
    }
}

export const WithCustomClass: Story = {
    args: {
        placeholder: '검색',
        className: 'shadow-lg'
    }
}

// Interactive story with state
const InteractiveSearchInput = () => {
    const [searchResults, setSearchResults] = useState<string[]>([])

    const handleSearch = (keyword: string) => {
        console.log('Searching for:', keyword)
        if (keyword) {
            setSearchResults([
                `"${keyword}" 검색 결과 1`,
                `"${keyword}" 검색 결과 2`,
                `"${keyword}" 검색 결과 3`
            ])
        } else {
            setSearchResults([])
        }
    }

    return (
        <div className="flex flex-col gap-16">
            <SearchInput
                handleSearch={handleSearch}
                placeholder="검색어를 입력하세요"
            />
            {searchResults.length > 0 && (
                <div className="rounded-12 flex flex-col gap-8 bg-white p-16 shadow">
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="text-body1-medium text-gray-7">
                            {result}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export const Interactive: Story = {
    render: () => <InteractiveSearchInput />
}
