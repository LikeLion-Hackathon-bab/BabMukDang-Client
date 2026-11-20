import type { Meta, StoryObj } from '@storybook/react'

import { UploadPage } from './UploadPage'

const meta: Meta<typeof UploadPage> = {
    title: 'Pages/Home/UploadPage',
    component: UploadPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '식사 인증 이미지를 업로드하고 함께 먹은 사람을 태그할 수 있는 페이지입니다. 식사 시간(아침/점심/저녁)을 선택할 수 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof UploadPage>

export const Default: Story = {}

export const WithImageSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '이미지가 선택된 상태의 업로드 페이지입니다.'
            }
        }
    }
}

export const WithTaggedPersons: Story = {
    parameters: {
        docs: {
            description: {
                story: '함께 식사한 사람이 태그된 상태입니다.'
            }
        }
    }
}
