import type { Meta, StoryObj } from '@storybook/react'

import { KebabButton } from './KebabButton'

const meta: Meta<typeof KebabButton> = {
    title: 'Shared/KebabButton',
    component: KebabButton,
    tags: ['autodocs'],
    argTypes: {
        onClick: {
            action: 'onClick',
            description: '메뉴 항목 클릭 시 호출되는 콜백'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        }
    },
    decorators: [
        Story => (
            <div className="flex h-200 items-start justify-end p-20">
                <Story />
            </div>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCustomClass: Story = {
    args: {
        className: 'ml-auto'
    }
}

export const InCard: Story = {
    decorators: [
        Story => (
            <div className="rounded-12 shadow-drop-1 w-300 bg-white p-16">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-body1-bold">게시글 제목</h3>
                        <p className="text-caption-medium text-gray-5">
                            게시글 내용입니다...
                        </p>
                    </div>
                    <Story />
                </div>
            </div>
        )
    ]
}
