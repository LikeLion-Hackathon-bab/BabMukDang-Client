import type { Meta, StoryObj } from '@storybook/react'
import { BottomNavigation } from './BottomNavigation'

// Mock icons
const MockHomeIcon = (props: any) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.strokecolor}
        strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
)

const MockMatchIcon = (props: any) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.strokecolor}
        strokeWidth="2">
        <circle
            cx="12"
            cy="12"
            r="10"
        />
    </svg>
)

const MockProfileIcon = (props: any) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.strokecolor}
        strokeWidth="2">
        <circle
            cx="12"
            cy="7"
            r="4"
        />
        <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
)

const meta: Meta<typeof BottomNavigation> = {
    title: 'Layout/BottomNavigation',
    component: BottomNavigation,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <div style={{ height: '200px', position: 'relative' }}>
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

const mockItems = [
    { path: '/', label: '홈', icon: MockHomeIcon },
    { path: '/match', label: '매칭', icon: MockMatchIcon },
    { path: '/profile', label: '프로필', icon: MockProfileIcon }
]

export const Default: Story = {
    args: {
        items: mockItems
    }
}

export const ActiveMatch: Story = {
    args: {
        items: mockItems
    }
}

export const ActiveProfile: Story = {
    args: {
        items: mockItems
    }
}
