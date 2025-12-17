import type { Meta, StoryObj } from '@storybook/react'
import { BottomSheet } from './BottomSheet'

const meta: Meta<typeof BottomSheet> = {
    title: 'Features/Matching/BottomSheet',
    component: BottomSheet,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        initialExposure: {
            control: { type: 'range', min: 0, max: 100, step: 5 },
            description: '초기 노출 높이'
        },
        threshold: {
            control: { type: 'range', min: 50, max: 300, step: 10 },
            description: '스와이프 임계값'
        },
        duration: {
            control: { type: 'range', min: 100, max: 500, step: 50 },
            description: '애니메이션 지속 시간(ms)'
        },
        dragResistance: {
            control: { type: 'range', min: 0.1, max: 0.5, step: 0.05 },
            description: '드래그 저항'
        },
        enableBackdrop: {
            control: 'boolean',
            description: '배경 오버레이 활성화'
        },
        height: {
            control: { type: 'range', min: 300, max: 800, step: 50 },
            description: '바텀시트 높이'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        initialExposure: 30,
        enableBackdrop: true,
        children: (
            <div className="p-20">
                <h2 className="text-title2-semibold mb-10">바텀시트 내용</h2>
                <p className="text-body1-medium text-gray-6">
                    드래그하여 바텀시트를 열거나 닫을 수 있습니다.
                </p>
            </div>
        )
    }
}

export const HighExposure: Story = {
    args: {
        initialExposure: 75,
        enableBackdrop: true,
        children: (
            <div className="p-20">
                <h2 className="text-title2-semibold mb-10">높은 초기 노출</h2>
                <p className="text-body1-medium text-gray-6">
                    초기 노출이 75px로 설정되었습니다.
                </p>
            </div>
        )
    }
}

export const NoBackdrop: Story = {
    args: {
        initialExposure: 30,
        enableBackdrop: false,
        children: (
            <div className="p-20">
                <h2 className="text-title2-semibold mb-10">배경 없음</h2>
                <p className="text-body1-medium text-gray-6">
                    배경 오버레이가 비활성화되었습니다.
                </p>
            </div>
        )
    }
}

export const CustomHeight: Story = {
    args: {
        initialExposure: 50,
        height: 500,
        enableBackdrop: true,
        children: (
            <div className="p-20">
                <h2 className="text-title2-semibold mb-10">커스텀 높이</h2>
                <p className="text-body1-medium text-gray-6">
                    바텀시트 높이가 500px로 설정되었습니다.
                </p>
            </div>
        )
    }
}
