import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { AllergicMenuPage } from './AllergicMenuPage'

const meta: Meta<typeof AllergicMenuPage> = {
    title: 'Pages/Register/AllergicMenuPage',
    component: AllergicMenuPage,
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
                component: '회원가입 시 알러지나 못먹는 음식을 선택하는 페이지입니다. 여러 개를 중복 선택할 수 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof AllergicMenuPage>

export const Default: Story = {}

export const WithSelectionsSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '일부 항목이 선택된 상태입니다.'
            }
        }
    }
}

export const AllSelected: Story = {
    parameters: {
        docs: {
            description: {
                story: '모든 항목이 선택된 상태입니다.'
            }
        }
    }
}
