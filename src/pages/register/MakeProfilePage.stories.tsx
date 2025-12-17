import type { Meta, StoryObj } from '@storybook/react'

import { MakeProfilePage } from './MakeProfilePage'

const meta: Meta<typeof MakeProfilePage> = {
    title: 'Pages/Register/MakeProfilePage',
    component: MakeProfilePage,
    tags: ['autodocs'],
    decorators: [],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '회원가입 시 프로필 이미지와 이름을 설정하는 페이지입니다. 이름은 최대 6자까지 입력 가능합니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof MakeProfilePage>

export const Default: Story = {}

export const WithNameEntered: Story = {
    parameters: {
        docs: {
            description: {
                story: '이름이 입력된 상태입니다.'
            }
        }
    }
}

export const WithProfileImage: Story = {
    parameters: {
        docs: {
            description: {
                story: '프로필 이미지가 선택된 상태입니다.'
            }
        }
    }
}
