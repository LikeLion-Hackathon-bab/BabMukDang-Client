import type { Meta, StoryObj } from '@storybook/react'
import { ThumbImg } from './ThumbImg'

const meta: Meta<typeof ThumbImg> = {
    title: 'Features/Onboarding/ThumbImg',
    component: ThumbImg,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    },
    argTypes: {
        size: {
            control: { type: 'select' },
            options: [80, 100, 120, 'full'],
            description: '이미지 크기'
        },
        aspectRatio: {
            control: 'text',
            description: '종횡비'
        },
        isExcluded: {
            control: 'boolean',
            description: '제외 상태'
        },
        onClick: {
            action: 'image clicked',
            description: '클릭 핸들러'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const mockItem = {
    name: '한식',
    aspectRatio: 1,
    placeholder: {
        blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        thumbhashDataURL:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAMElEQVR4nGNgYGBYtWrV////GRgY1q1bBwTbt2+HMBYvXszAwMDAwMDAcP36dQYGBgAYTwz7jMVdGQAAAABJRU5ErkJggg=='
    },
    images: {
        src: 'https://picsum.photos/120/120',
        avifSrcset: 'https://picsum.photos/120/120 1x',
        sizes: '120px'
    }
}

export const Default: Story = {
    args: {
        item: mockItem,
        size: 120
    }
}

export const Small: Story = {
    args: {
        item: mockItem,
        size: 80
    }
}

export const Large: Story = {
    args: {
        item: mockItem,
        size: 'full'
    }
}

export const CustomAspectRatio: Story = {
    args: {
        item: mockItem,
        size: 120,
        aspectRatio: '6/7'
    }
}

export const Excluded: Story = {
    args: {
        item: mockItem,
        size: 120,
        isExcluded: true
    }
}

export const NoImage: Story = {
    args: {
        item: undefined,
        size: 120
    }
}
