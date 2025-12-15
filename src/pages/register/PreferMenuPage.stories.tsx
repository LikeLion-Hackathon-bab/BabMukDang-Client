import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { PreferMenuPage } from './PreferMenuPage'

const meta: Meta<typeof PreferMenuPage> = {
    title: 'Pages/Register/PreferMenuPage',
    component: PreferMenuPage,
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
                component: '회원가입 시 좋아하는 메뉴와 테마를 선택하는 페이지입니다. 중복 선택이 가능합니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof PreferMenuPage>

export const Default: Story = {}

export const WithSelectionsSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '일부 메뉴가 선택된 상태입니다.'
            }
        }
    }
}

export const MultipleSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '여러 메뉴가 선택된 상태입니다.'
            }
        }
    }
}
