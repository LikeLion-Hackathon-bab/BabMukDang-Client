import type { Meta, StoryObj } from '@storybook/react'
import { RegisterLayout } from './RegisterLayout'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const meta: Meta<typeof RegisterLayout> = {
    title: 'Layout/RegisterLayout',
    component: RegisterLayout,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    decorators: [
        () => (
            <MemoryRouter initialEntries={['/register']}>
                <Routes>
                    <Route
                        path="/register"
                        element={<RegisterLayout />}>
                        <Route
                            index
                            element={
                                <div className="p-20">
                                    <h1 className="text-title2-semibold">
                                        회원가입 페이지
                                    </h1>
                                    <p className="text-body1-medium text-gray-6 mt-10">
                                        헤더와 하단 네비게이션이 숨겨진
                                        레이아웃입니다.
                                    </p>
                                </div>
                            }
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        )
    ]
}
