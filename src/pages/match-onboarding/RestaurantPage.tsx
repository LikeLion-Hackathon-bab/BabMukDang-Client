import { useEffect, useState } from 'react'
import type { RestaurantResponse } from '@kimdaegyu/babmukdang-shared/domain'
type RestaurantInitialState = { initialRestaurants: RestaurantResponse[] }
type RestaurantCardModel = {
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

import { RestaurantCard } from '@/components'
import { useSocket } from '@/contexts/SocketContext'

export function RestaurantPage() {
    const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([])

    const { phaseData, socket, restaurantPicks } = useSocket()
    useEffect(() => {
        if (phaseData && phaseData.phase === 'restaurant') {
            setRestaurants(
                (phaseData.data as RestaurantInitialState).initialRestaurants
            )
        }
    }, [phaseData])

    const onClickRestaurant = (restaurant: RestaurantCardModel) => {
        socket?.emit('pick-restaurant', { restaurantId: restaurant.id as RestaurantResponse['restaurantId'] })
    }

    const toCardModel = (restaurant: RestaurantResponse): RestaurantCardModel => ({
        id: String(restaurant.restaurantId),
        place_name: restaurant.placeName,
        category_name: restaurant.categoryName,
        category_group_name: restaurant.categoryGroupName,
        distance: restaurant.distance ?? '',
        road_address_name: restaurant.roadAddressName,
        address_name: restaurant.addressName,
        phone: restaurant.phone ?? '',
        place_url: restaurant.placeUrl ?? undefined,
        selectUsers: restaurantPicks
            .find(pick => pick.restaurantId === restaurant.restaurantId)
            ?.selectedMembers.map(String) ?? []
    })

    return (
        <>
            <div className="flex flex-col gap-10">
                {restaurants.map(restaurant => (
                    <RestaurantCard
                        key={restaurant.restaurantId}
                        restaurant={toCardModel(restaurant)}
                        onClick={onClickRestaurant}
                    />
                ))}
            </div>
        </>
    )
}
