import type { Meta, StoryObj } from '@storybook/react'
import { PostCardFooter } from './PostCardFooter'

const meta: Meta<typeof PostCardFooter> = {
    title: 'Features/Home/Post/PostCardFooter',
    component: PostCardFooter,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded'
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        restaurantInfo: {
            placeId: '1',
            placeName: '맛있는 식당',
            addressName: '서울시 강남구',
            roadAddressName: '서울시 강남구 테헤란로 123',
            phoneNumber: '02-1234-5678',
            placeUrl: 'https://picsum.photos/72/72',
            distance: '500m',
            categoryGroupCode: 'FD6',
            categoryGroupName: '음식점',
            categoryName: '한식 > 국밥',
            x: 127.0276,
            y: 37.4979
        }
    }
}

export const Japanese: Story = {
    args: {
        restaurantInfo: {
            placeId: '2',
            placeName: '스시오마카세',
            addressName: '서울시 서초구',
            roadAddressName: '서울시 서초구 사평대로 456',
            phoneNumber: '02-9876-5432',
            placeUrl: 'https://picsum.photos/72/72',
            distance: '1.2km',
            categoryGroupCode: 'FD6',
            categoryGroupName: '음식점',
            categoryName: '일식 > 초밥',
            x: 127.0276,
            y: 37.4979
        }
    }
}

export const NoDistance: Story = {
    args: {
        restaurantInfo: {
            placeId: '3',
            placeName: '중화반점',
            addressName: '서울시 종로구',
            roadAddressName: '서울시 종로구 종로 789',
            phoneNumber: '02-1111-2222',
            categoryGroupCode: 'FD6',
            categoryGroupName: '음식점',
            categoryName: '중식',
            x: 127.0276,
            y: 37.4979
        }
    }
}

export const NullRestaurant: Story = {
    args: {
        restaurantInfo: null
    }
}
