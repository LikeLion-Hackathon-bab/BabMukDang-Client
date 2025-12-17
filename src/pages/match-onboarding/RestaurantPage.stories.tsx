import type { Meta, StoryObj } from '@storybook/react'

import { RestaurantPage } from './RestaurantPage'

const meta: Meta<typeof RestaurantPage> = {
    title: 'Pages/MatchOnboarding/RestaurantPage',
    component: RestaurantPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    '추천된 식당 목록에서 선택하여 투표할 수 있는 페이지입니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof RestaurantPage>

export const Default: Story = {}

export const WithRestaurantList: Story = {
    parameters: {
        docs: {
            description: {
                story: '식당 목록이 표시된 상태입니다.'
            }
        }
    }
}

export const WithSelectedRestaurant: Story = {
    parameters: {
        docs: {
            description: {
                story: '식당이 선택된 상태입니다.'
            }
        }
    }
}
