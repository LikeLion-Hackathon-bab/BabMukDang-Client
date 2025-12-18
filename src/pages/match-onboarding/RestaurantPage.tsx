import { useEffect, useRef, useState } from 'react'

import { RestaurantCard } from '@/components'
import { useSocket } from '@/contexts/SocketContext'
import { useAuthStore } from '@/store'

interface InitialDto {
    initialRestaurants: Restaurant[]
    restaurantUserList: {
        userId: string
        restaurantId: string
    }[]
}
interface Restaurant {
    id: string
    place_name: string
    category_name: string
    category_group_name: string
    distance: string
    road_address_name: string
    address_name: string
    phone: string
    selectUsers: string[]
    place_url?: string
}
type RestaurantPickUpdatedDto = RestaurantPickUpdate[]

interface RestaurantPickUpdate {
    restaurantId: string
    userId: string
}

export function RestaurantPage() {
    const [restaurantList, setRestaurantList] = useState<Restaurant[]>([])

    const { userId } = useAuthStore()
    const { initialState, socket } = useSocket()
    useEffect(() => {
        if (initialState && initialState.stage === 'restaurant') {
            setRestaurantList(
                initialState.initialState.initialRestaurants.map(
                    (restaurant: Restaurant) => ({
                        ...restaurant,
                        selectUsers:
                            initialState.initialState.restaurantUserList
                                .filter(
                                    (item: any) =>
                                        item.restaurantId === restaurant.id
                                )
                                .map((item: any) => item.userId)
                    })
                )
            )
        }
    }, [initialState])
    const onClickRestaurant = (restaurant: any) => {
        socket?.emit('pick-restaurant', { restaurantId: restaurant.id })
    }
    useEffect(() => {
        const handlePickUpdated = (data: RestaurantPickUpdatedDto) => {
            setRestaurantList(prev =>
                prev.map(restaurant => ({
                    ...restaurant,
                    selectUsers: data
                        .filter(
                            (item: any) => item.restaurantId === restaurant.id
                        )
                        .map((item: any) => item.userId)
                }))
            )
        }
        socket?.on('restaurant-pick-updated', handlePickUpdated)
        return () => {
            socket?.off('restaurant-pick-updated', handlePickUpdated)
        }
    }, [socket])
    return (
        <>
            <div className="flex flex-col gap-10">
                {restaurantList.map((restaurant, index) => (
                    <RestaurantCard
                        key={index}
                        restaurant={restaurant}
                        onClick={onClickRestaurant}
                    />
                ))}
            </div>
        </>
    )
}
