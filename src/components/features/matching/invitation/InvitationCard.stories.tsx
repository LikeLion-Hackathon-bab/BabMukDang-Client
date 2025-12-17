import type { Meta, StoryObj } from '@storybook/react'
import { InvitationCard } from './InvitationCard'
import { useState } from 'react'

// Mock Graphic component
const MockGraphic = () => (
    <div className="flex h-200 w-200 items-center justify-center rounded-lg bg-gradient-to-br from-orange-200 to-orange-400">
        <span className="text-4xl">🍽️</span>
    </div>
)

const meta: Meta<typeof InvitationCard> = {
    title: 'Features/Matching/Invitation/InvitationCard',
    component: InvitationCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        bgColor: {
            control: 'select',
            options: [
                'bg-primary-500',
                'bg-primary-400',
                'bg-orange-400',
                'bg-red-400'
            ],
            description: '배경 색상'
        },
        isEditing: {
            control: 'boolean',
            description: '수정 모드 여부'
        },
        showEditButton: {
            control: 'boolean',
            description: '수정 버튼 표시 여부'
        },
        from: {
            control: 'text',
            description: '보내는 사람 이름'
        }
    },}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        Graphic: <MockGraphic />,
        bgColor: 'bg-primary-500',
        from: '홍길동',
        editText: '함께 밥 먹어요!',
        isEditing: false,
        showEditButton: false
    }
}

export const WithEditButton: Story = {
    args: {
        Graphic: <MockGraphic />,
        bgColor: 'bg-primary-500',
        from: '홍길동',
        editText: '함께 밥 먹어요!',
        isEditing: false,
        showEditButton: true
    }
}

export const EditMode: Story = {
    args: {
        Graphic: <MockGraphic />,
        bgColor: 'bg-primary-500',
        from: '홍길동',
        editText: '함께 밥 먹어요!',
        isEditing: true,
        showEditButton: true
    }
}

export const DifferentColor: Story = {
    args: {
        Graphic: <MockGraphic />,
        bgColor: 'bg-orange-400',
        from: '김철수',
        editText: '맛있는 점심 어때요?',
        isEditing: false,
        showEditButton: false
    }
}

// Interactive story
const InteractiveInvitationCard = () => {
    const [editText, setEditText] = useState('함께 밥 먹어요!')
    const [isEditing, setIsEditing] = useState(false)

    return (
        <InvitationCard
            Graphic={<MockGraphic />}
            bgColor="bg-primary-500"
            from="홍길동"
            editText={editText}
            setEditText={setEditText}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            showEditButton={true}
        />
    )
}

export const Interactive: Story = {
    render: () => <InteractiveInvitationCard />
}
