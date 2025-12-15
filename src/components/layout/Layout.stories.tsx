import type { Meta, StoryObj } from '@storybook/react'
import { Layout } from './Layout'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const meta: Meta<typeof Layout> = {
    title: 'Layout/Layout',
    component: Layout,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        Story => (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </QueryClientProvider>
        )
    ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
