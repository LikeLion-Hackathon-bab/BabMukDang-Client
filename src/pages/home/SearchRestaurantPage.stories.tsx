import type { Meta, StoryObj } from '@storybook/react'

import { SearchRestaurantPage } from './SearchRestaurantPage'

const meta: Meta<typeof SearchRestaurantPage> = {
    title: 'Pages/Home/SearchRestaurantPage',
    component: SearchRestaurantPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '카카오 맵을 통해 식당을 검색하고 선택할 수 있는 페이지입니다. 이미지의 GPS 정보를 파싱하여 위치를 가져올 수 있습니다.'
            }
        }
    }
}

export default meta
type Story = StoryObj<typeof SearchRestaurantPage>

export const Default: Story = {}

export const WithMapView: Story = {
    parameters: {
        docs: {
            description: {
                story: '지도가 표시된 상태의 식당 검색 페이지입니다.'
            }
        }
    }
}
