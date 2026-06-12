import type { Meta, StoryObj } from '@storybook/react'
import { RecruitCard } from './RecruitCard'
import { useRef } from 'react'
import { MockRecruits } from '@/constants/mockData'

const meta: Meta<typeof RecruitCard> = {
    title: 'Features/Matching/Recruit/RecruitCard',
    component: RecruitCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        index: {
            control: 'number',
            description: '카드 인덱스'
        },
        currentIndex: {
            control: 'number',
            description: '현재 활성 인덱스'
        },
        isActive: {
            control: 'boolean',
            description: '활성 상태 여부'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockRecruit = { ...MockRecruits[0] }

const RecruitCardWrapper = (props: any) => {
    const cardRef = useRef<HTMLDivElement>(null)
    return (
        <RecruitCard
            {...props}
            cardRef={cardRef}
        />
    )
}

export const Active: Story = {
    render: () => (
        <div className="w-280">
            <RecruitCardWrapper
                recruit={mockRecruit}
                index={0}
                currentIndex={0}
                isActive={true}
            />
        </div>
    )
}

export const Inactive: Story = {
    render: () => (
        <div className="w-280">
            <RecruitCardWrapper
                recruit={mockRecruit}
                index={1}
                currentIndex={0}
                isActive={false}
            />
        </div>
    )
}

export const WithProfileImages: Story = {
    render: () => (
        <div className="w-280">
            <RecruitCardWrapper
                recruit={{
                    ...mockRecruit,
                    author: {
                        ...mockRecruit.author,
                        profileImageUrl: 'https://picsum.photos/40/40'
                    },
                    participants: [
                        {
                            memberId: 2,
                            name: '김철수',
                            profileImageUrl: 'https://picsum.photos/40/40'
                        },
                        {
                            memberId: 3,
                            name: '이영희',
                            profileImageUrl: 'https://picsum.photos/40/40'
                        }
                    ]
                }}
                index={0}
                currentIndex={0}
                isActive={true}
            />
        </div>
    )
}

export const ManyParticipants: Story = {
    render: () => (
        <div className="w-280">
            <RecruitCardWrapper
                recruit={{
                    ...mockRecruit,
                    targetCount: 5,
                    participants: [
                        { memberId: 2, name: '김철수', profileImageUrl: '' },
                        { memberId: 3, name: '이영희', profileImageUrl: '' },
                        { memberId: 4, name: '박지민', profileImageUrl: '' },
                        { memberId: 5, name: '최유리', profileImageUrl: '' }
                    ]
                }}
                index={0}
                currentIndex={0}
                isActive={true}
            />
        </div>
    )
}

