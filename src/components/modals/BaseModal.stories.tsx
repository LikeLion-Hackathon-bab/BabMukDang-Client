import type { Meta, StoryObj } from '@storybook/react'

import { BaseModal } from './BaseModal'

const meta: Meta<typeof BaseModal> = {
    title: 'Modals/BaseModal',
    component: BaseModal,
    tags: ['autodocs'],
    argTypes: {
        open: {
            control: 'boolean',
            description: '모달이 열려 있는지 여부'
        },
        id: {
            control: 'text',
            description: '모달의 고유 ID'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        },
        onClose: {
            action: 'onClose',
            description: '모달 닫기 시 호출되는 콜백'
        },
        onAccept: {
            action: 'onAccept',
            description: '모달 확인 시 호출되는 콜백'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const SampleModalContent = ({
    onClose,
    onAccept
}: {
    onClose?: () => void
    onAccept?: () => void
}) => (
    <div className="rounded-16 bg-white p-20 shadow-lg">
        <h2 className="text-title2-bold mb-16">샘플 모달</h2>
        <p className="text-body1-medium text-gray-6 mb-20">
            이것은 BaseModal 내부에 들어가는 샘플 컨텐츠입니다.
        </p>
        <div className="flex gap-10">
            <button
                onClick={onClose}
                className="bg-gray-2 text-gray-6 rounded-8 px-16 py-10">
                취소
            </button>
            <button
                onClick={onAccept}
                className="bg-primary-500 rounded-8 px-16 py-10 text-white">
                확인
            </button>
        </div>
    </div>
)

export const Default: Story = {
    args: {
        open: true,
        id: 'base-modal',
        children: <SampleModalContent />
    }
}

export const Closed: Story = {
    args: {
        open: false,
        id: 'base-modal-closed',
        children: <SampleModalContent />
    }
}

export const WithCustomId: Story = {
    args: {
        open: true,
        id: 'custom-modal-id',
        children: <SampleModalContent />
    }
}

export const WithCustomClassName: Story = {
    args: {
        open: true,
        id: 'styled-modal',
        className: 'px-20',
        children: <SampleModalContent />
    }
}
