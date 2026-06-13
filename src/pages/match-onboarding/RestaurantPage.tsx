import { useEffect, useState } from 'react'
import type { RestaurantResponse } from '@kimdaegyu/babmukdang-shared/domain/restaurant'
type RestaurantInitialState = { initialRestaurants: RestaurantResponse[] }
import type { RestaurantCardView } from '@/viewModels'
import { useAuthStore } from '@/store'

import { RestaurantCard } from '@/components'
import { useSocket } from '@/contexts/SocketContext'

export function RestaurantPage() {
    const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([])

    const { phaseData, commands, restaurantPicks } = useSocket()
    useEffect(() => {
        if (phaseData && phaseData.phase === 'restaurant') {
            setRestaurants(
                (phaseData.data as RestaurantInitialState).initialRestaurants
            )
        }
    }, [phaseData])

    const userId = useAuthStore(state => state.userId)

    const onClickRestaurant = (restaurant: RestaurantCardView) => {
        commands?.pickRestaurant({
            restaurantId: restaurant.id as RestaurantResponse['restaurantId']
        })
    }

    const toCardModel = (restaurant: RestaurantResponse): RestaurantCardView => ({
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
                        selectedUserId={userId}
                    />
                ))}
            </div>
        </>
    )
}
