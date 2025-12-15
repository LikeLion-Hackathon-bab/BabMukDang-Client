import type { Meta, StoryObj } from '@storybook/react'
import { KakaoMap } from './KakaoMap'
import { fn } from '@storybook/test'

const meta: Meta<typeof KakaoMap> = {
    title: 'Features/Onboarding/KakaoMap',
    component: KakaoMap,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        width: {
            control: 'text',
            description: '지도 너비'
        },
        height: {
            control: 'text',
            description: '지도 높이'
        },
        onLocationSelect: {
            action: 'location selected',
            description: '위치 선택 핸들러'
        }
    },
    args: {
        onLocationSelect: fn()
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        width: '100%',
        height: '260px'
    }
}

export const Large: Story = {
    args: {
        width: '100%',
        height: '400px'
    }
}

export const Small: Story = {
    args: {
        width: '100%',
        height: '180px'
    }
}

export const WithChildren: Story = {
    args: {
        width: '100%',
        height: '260px',
        children: (
            <div className="absolute top-4 left-4 z-10 rounded-lg bg-white p-2 shadow">
                <span className="text-caption-medium">지도 위 컴포넌트</span>
            </div>
        )
    }
}
