import type { Meta, StoryObj } from '@storybook/react'

import { ModalTrigger } from './ModalTrigger'

const meta: Meta<typeof ModalTrigger> = {
    title: 'Shared/ModalTrigger',
    component: ModalTrigger,
    tags: ['autodocs'],
    argTypes: {
        forId: {
            control: 'text',
            description: '열려는 모달의 ID'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        },
        disabled: {
            control: 'boolean',
            description: '비활성화 여부'
        },
        children: {
            description: '트리거 버튼 내용'
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

export const Default: Story = {
    args: {
        forId: 'sample-modal',
        children: (
            <button className="bg-primary-500 rounded-8 px-16 py-10 text-white">
                모달 열기
            </button>
        )
    }
}

export const Disabled: Story = {
    args: {
        forId: 'sample-modal',
        disabled: true,
        children: (
            <button className="bg-gray-3 rounded-8 cursor-not-allowed px-16 py-10 text-white">
                비활성화됨
            </button>
        )
    }
}

export const WithCustomClassName: Story = {
    args: {
        forId: 'custom-modal',
        className: 'inline-block',
        children: (
            <span className="bg-gray-7 rounded-full px-12 py-6 text-white">
                클릭
            </span>
        )
    }
}

export const TextTrigger: Story = {
    args: {
        forId: 'text-modal',
        children: (
            <span className="text-primary-500 text-body1-semibold cursor-pointer underline">
                여기를 클릭하세요
            </span>
        )
    }
}

export const IconTrigger: Story = {
    args: {
        forId: 'icon-modal',
        children: (
            <div className="bg-gray-2 flex size-40 cursor-pointer items-center justify-center rounded-full">
                <span className="text-lg">+</span>
            </div>
        )
    }
}
