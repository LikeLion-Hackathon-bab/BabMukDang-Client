import type { Meta, StoryObj } from '@storybook/react'

import { TagPerson } from './TagPerson'

const meta: Meta<typeof TagPerson> = {
    title: 'Shared/TagPerson',
    component: TagPerson,
    tags: ['autodocs'],
    argTypes: {
        name: {
            control: 'text',
            description: '태그할 사람의 이름'
        },
        orange: {
            control: 'boolean',
            description: '주황색 배경 여부'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
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
        name: '홍길동'
    }
}

export const Orange: Story = {
    args: {
        name: '김철수',
        orange: true
    }
}

export const LongName: Story = {
    args: {
        name: '알렉산더해밀턴'
    }
}

export const ShortName: Story = {
    args: {
        name: '민준'
    }
}

export const EnglishName: Story = {
    args: {
        name: 'JohnDoe',
        orange: true
    }
}

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-8">
            <TagPerson name="홍길동" />
            <TagPerson
                name="김철수"
                orange
            />
            <TagPerson name="이영희" />
            <TagPerson
                name="박민수"
                orange
            />
            <TagPerson name="정지원" />
        </div>
    )
}

export const InContext: Story = {
    render: () => (
        <div className="rounded-12 bg-gray-100 p-16">
            <p className="text-body1-medium text-gray-7 mb-8">
                함께 하는 사람들:
            </p>
            <div className="flex flex-wrap gap-6">
                <TagPerson
                    name="김밥맛집"
                    orange
                />
                <TagPerson
                    name="점심친구"
                    orange
                />
                <TagPerson
                    name="저녁모임"
                    orange
                />
            </div>
        </div>
    )
}
