import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { FinishRegisterPage } from './FinishRegisterPage'

const meta: Meta<typeof FinishRegisterPage> = {
    title: 'Pages/Register/FinishRegisterPage',
    component: FinishRegisterPage,
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
                component: '회원가입이 완료되었을 때 보여주는 축하 페이지입니다. 친구 추가하러 가기 버튼이 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof FinishRegisterPage>

export const Default: Story = {}
