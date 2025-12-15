import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { StartRegisterPage } from './StartRegisterPage'

const meta: Meta<typeof StartRegisterPage> = {
    title: 'Pages/Register/StartRegisterPage',
    component: StartRegisterPage,
    tags: ['autodocs'],
    decorators: [
        Story => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        )
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '앱 시작 화면으로 카카오 로그인 버튼이 표시됩니다. 배경 이미지와 로고가 표시됩니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof StartRegisterPage>

export const Default: Story = {}
