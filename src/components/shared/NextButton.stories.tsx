import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

import { NextButton } from './NextButton'

const meta: Meta<typeof NextButton> = {
    title: 'Shared/NextButton',
    component: NextButton,
    tags: ['autodocs'],
    argTypes: {
        onClick: {
            action: 'onClick',
            description: '버튼 클릭 핸들러'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        }
    },
    args: {
        onClick: fn()
    },
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <div className="relative h-400 w-full bg-gray-100">
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {}
}

export const WithCustomClass: Story = {
    args: {
        className: 'bg-primary-500'
    }
}

export const InContextWithContent: Story = {
    decorators: [
        Story => (
            <div className="relative h-screen w-full bg-gray-100 p-20">
                <h1 className="text-title1-bold mb-16">설문 페이지</h1>
                <p className="text-body1-medium text-gray-6">
                    원하시는 옵션을 선택해주세요.
                </p>
                <div className="mt-20 flex flex-col gap-10">
                    <div className="rounded-12 bg-white p-16 shadow">
                        옵션 1
                    </div>
                    <div className="rounded-12 bg-white p-16 shadow">
                        옵션 2
                    </div>
                    <div className="rounded-12 bg-white p-16 shadow">
                        옵션 3
                    </div>
                </div>
                <Story />
            </div>
        )
    ]
}
