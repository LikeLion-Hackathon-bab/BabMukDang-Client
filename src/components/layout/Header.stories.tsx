import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './Header'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof Header> = {
    title: 'Layout/Header',
    component: Header,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        )
    ],
    argTypes: {
        title: {
            control: 'text',
            description: '헤더 타이틀'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        config: {
            visible: true,
            showLeftButton: true,
            showCenterElement: true,
            showRightButton: true,
            title: '밥먹당'
        }
    }
}

export const WithTitle: Story = {
    args: {
        config: {
            visible: true,
            showLeftButton: true,
            showCenterElement: true,
            showRightButton: true,
            title: '게시글'
        }
    }
}

export const NoBackButton: Story = {
    args: {
        config: {
            visible: true,
            showLeftButton: false,
            showCenterElement: true,
            showRightButton: true,
            title: '홈'
        }
    }
}

export const NoAlarmButton: Story = {
    args: {
        config: {
            visible: true,
            showLeftButton: true,
            showCenterElement: true,
            showRightButton: false,
            title: '설정'
        }
    }
}

export const OnlyTitle: Story = {
    args: {
        config: {
            visible: true,
            showLeftButton: false,
            showCenterElement: true,
            showRightButton: false,
            title: '프로필'
        }
    }
}

export const Hidden: Story = {
    args: {
        config: {
            visible: false
        }
    }
}

export const CustomLeft: Story = {
    args: {
        config: {
            visible: true,
            showLeftButton: true,
            showCenterElement: true,
            showRightButton: true,
            title: '커스텀',
            left: <span className="text-primary-main">뒤로</span>
        }
    }
}

export const CustomRight: Story = {
    args: {
        config: {
            visible: true,
            showLeftButton: true,
            showCenterElement: true,
            showRightButton: true,
            title: '커스텀',
            right: (
                <button className="text-primary-main text-body2-semibold">
                    저장
                </button>
            )
        }
    }
}
