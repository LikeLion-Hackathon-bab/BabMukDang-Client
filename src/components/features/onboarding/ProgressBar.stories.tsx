import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const meta: Meta<typeof ProgressBar> = {
    title: 'Features/Onboarding/ProgressBar',
    component: ProgressBar,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const InvitationStart: Story = {
    decorators: [
        Story => (
            <MemoryRouter initialEntries={['/invitation/location-vote']}>
                <Routes>
                    <Route
                        path="/:matchType/:stage"
                        element={<Story />}
                    />
                </Routes>
            </MemoryRouter>
        )
    ]
}

export const AnnouncementStart: Story = {
    decorators: [
        Story => (
            <MemoryRouter initialEntries={['/announcement/location-vote']}>
                <Routes>
                    <Route
                        path="/:matchType/:stage"
                        element={<Story />}
                    />
                </Routes>
            </MemoryRouter>
        )
    ]
}

export const InvitationMiddle: Story = {
    decorators: [
        Story => (
            <MemoryRouter initialEntries={['/invitation/menu']}>
                <Routes>
                    <Route
                        path="/:matchType/:stage"
                        element={<Story />}
                    />
                </Routes>
            </MemoryRouter>
        )
    ]
}

export const AnnouncementEnd: Story = {
    decorators: [
        Story => (
            <MemoryRouter initialEntries={['/announcement/restaurant']}>
                <Routes>
                    <Route
                        path="/:matchType/:stage"
                        element={<Story />}
                    />
                </Routes>
            </MemoryRouter>
        )
    ]
}
