import type { Meta, StoryObj } from '@storybook/react'
import {
    AddAnnouncementButton,
    CloseAnnouncementButton
} from './AnnouncementButton'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const AddButtonMeta: Meta<typeof AddAnnouncementButton> = {
    title: 'Features/Matching/Announcement/AddAnnouncementButton',
    component: AddAnnouncementButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
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

export default AddButtonMeta
type AddButtonStory = StoryObj<typeof AddButtonMeta>

export const AddButton: AddButtonStory = {
    args: {
        announcementAddData: {
            location: '강남역 근처',
            message: '점심 같이 드실 분!',
            targetCount: 3,
            meetingAt: '2024-12-15T12:00'
        }
    }
}

// CloseAnnouncementButton 스토리
export const CloseButton: StoryObj<typeof CloseAnnouncementButton> = {
    render: () => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <CloseAnnouncementButton announcementId={1} />
            </MemoryRouter>
        </QueryClientProvider>
    )
}
