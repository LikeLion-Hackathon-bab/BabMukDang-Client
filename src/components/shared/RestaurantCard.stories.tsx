import type { Meta, StoryObj } from '@storybook/react'

import { RestaurantCard } from './RestaurantCard'

const meta: Meta<typeof RestaurantCard> = {
    title: 'Shared/RestaurantCard',
    component: RestaurantCard,
    tags: ['autodocs'],
    argTypes: {
        restaurant: {
            control: 'object',
            description: '음식점 정보'
        },
        onClick: {
            action: 'onClick',
            description: '카드 클릭 핸들러'
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스'
        },
        gps: {
            control: 'object',
            description: 'GPS 정보'
        }
    }
}

export default meta
type Story = StoryObj<typeof meta>

const defaultRestaurant = {
    id: '1',
    place_name: '마초쉐프',
    category_name: '음식점 > 양식 > 파스타',
    category_group_name: '음식점',
    distance: '250',
    road_address_name: '서울 강남구 역삼동 123-45',
    address_name: '서울 강남구 역삼동 123-45',
    phone: '02-1234-5678',
    selectUsers: [],
    place_url: 'https://place.map.kakao.com/123456'
}

export const Default: Story = {
    args: {
        restaurant: defaultRestaurant
    }
}

export const Selected: Story = {
    args: {
        restaurant: {
            ...defaultRestaurant,
            selectUsers: ['user1']
        }
    }
}

export const WithMultipleUsers: Story = {
    args: {
        restaurant: {
            ...defaultRestaurant,
            selectUsers: ['user1', 'user2', 'user3']
        }
    }
}

export const NoPhone: Story = {
    args: {
        restaurant: {
            ...defaultRestaurant,
            phone: ''
        }
    }
}

export const NoPlaceUrl: Story = {
    args: {
        restaurant: {
            ...defaultRestaurant,
            place_url: undefined
        }
    }
}

export const LongDistance: Story = {
    args: {
        restaurant: {
            ...defaultRestaurant,
            distance: '1500'
        }
    }
}

export const MinimalInfo: Story = {
    args: {
        restaurant: {
            id: '2',
            place_name: '김밥천국',
            category_name: '음식점 > 한식',
            category_group_name: '음식점',
            distance: '100',
            road_address_name: '',
            address_name: '서울 강남구 역삼동',
            phone: '',
            selectUsers: [],
            place_url: undefined
        }
    }
}

export const WithGPS: Story = {
    args: {
        restaurant: defaultRestaurant,
        gps: {
            current: {
                latitude: 37.4979,
                longitude: 127.0276
            }
        }
    }
}
