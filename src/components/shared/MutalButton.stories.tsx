import type { Meta, StoryObj } from '@storybook/react'

import { MutalButton, MutalButtonSmall } from './MutalButton'

const meta: Meta<typeof MutalButton> = {
    title: 'Shared/MutalButton',
    component: MutalButton,
    tags: ['autodocs'],
    argTypes: {
        text: {
            control: 'text',
            description: '버튼 텍스트'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        },
        onClick: {
            action: 'onClick',
            description: '버튼 클릭 핸들러'
        },
        hasArrow: {
            control: 'boolean',
            description: '화살표 표시 여부'
        }
    },    decorators: [
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
        text: '확인하기'
    }
}

export const WithArrow: Story = {
    args: {
        text: '다음으로',
        hasArrow: true
    }
}

export const LongText: Story = {
    args: {
        text: '밥약속 참여 신청하기'
    }
}

export const WithCustomClass: Story = {
    args: {
        text: '제출하기',
        className: 'bg-primary-500'
    }
}

// MutalButtonSmall stories
export const Small: Story = {
    render: () => (
        <MutalButtonSmall
            text="확인"
            onClick={()=>{}}
        />
    )
}

export const SmallLongText: Story = {
    render: () => (
        <MutalButtonSmall
            text="참여 신청 완료"
            onClick={()=>{}}
        />
    )
}

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-col gap-16">
            <MutalButton
                text="기본 버튼"
                onClick={()=>{}}
            />
            <MutalButton
                text="화살표 버튼"
                hasArrow={true}
                onClick={()=>{}}
            />
            <MutalButtonSmall
                text="작은 버튼"
                onClick={()=>{}}
            />
        </div>
    )
}
