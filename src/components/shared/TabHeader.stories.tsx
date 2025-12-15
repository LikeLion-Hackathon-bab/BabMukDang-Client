import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { useState } from 'react'

import { TabHeader } from './TabHeader'

const meta: Meta<typeof TabHeader> = {
    title: 'Shared/TabHeader',
    component: TabHeader,
    tags: ['autodocs'],
    argTypes: {
        tabs: {
            control: 'object',
            description: '탭 목록 (key, label)'
        },
        activeTab: {
            control: 'text',
            description: '현재 활성화된 탭 키'
        },
        onTabChange: {
            action: 'onTabChange',
            description: '탭 변경 핸들러'
        }
    },
    args: {
        onTabChange: fn()
    },
    decorators: [
        Story => (
            <div className="w-full max-w-400">
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

const defaultTabs = [
    { key: 'home', label: '홈' },
    { key: 'matching', label: '매칭' }
]

export const Default: Story = {
    args: {
        tabs: defaultTabs,
        activeTab: 'home'
    }
}

export const SecondTabActive: Story = {
    args: {
        tabs: defaultTabs,
        activeTab: 'matching'
    }
}

export const ThreeTabs: Story = {
    args: {
        tabs: [
            { key: 'all', label: '전체' },
            { key: 'pending', label: '대기중' },
            { key: 'completed', label: '완료' }
        ],
        activeTab: 'all'
    }
}

export const FourTabs: Story = {
    args: {
        tabs: [
            { key: 'posts', label: '게시글' },
            { key: 'meetings', label: '약속' },
            { key: 'friends', label: '친구' },
            { key: 'settings', label: '설정' }
        ],
        activeTab: 'posts'
    }
}

export const LongLabels: Story = {
    args: {
        tabs: [
            { key: 'announcements', label: '공고' },
            { key: 'invitations', label: '초대' }
        ],
        activeTab: 'announcements'
    }
}

// Interactive story with state
const InteractiveTabHeader = () => {
    const [activeTab, setActiveTab] = useState('home')

    return (
        <div className="flex flex-col gap-16">
            <TabHeader
                tabs={defaultTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <div className="rounded-12 bg-gray-100 p-20 text-center">
                <span className="text-body1-medium text-gray-6">
                    현재 탭: {activeTab}
                </span>
            </div>
        </div>
    )
}

export const Interactive: Story = {
    render: () => <InteractiveTabHeader />
}
