import { useEffect, useState } from 'react'
import type {
    KakaoRestaurantResponseDto,
    RestaurantInitialState
} from '@kimdaegyu/babmukdang-shared'

import { RestaurantCard } from '@/components'
import { useSocket } from '@/contexts/SocketContext'

export function RestaurantPage() {
    const [restaurants, setRestaurants] = useState<
        KakaoRestaurantResponseDto[]
    >([])

    const { phaseData, socket, restaurantPicks } = useSocket()
    useEffect(() => {
        if (phaseData && phaseData.phase === 'restaurant') {
            setRestaurants(
                (phaseData.data as RestaurantInitialState).initialRestaurants
            )
        }
    }, [phaseData])

    const onClickRestaurant = (restaurant: { id: string }) => {
        socket?.emit('pick-restaurant', { restaurantId: restaurant.id })
    }

    return (
        <>
            <div className="flex flex-col gap-10">
                {restaurants.map(restaurant => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={{
                            ...restaurant,
                            selectUsers:
                                restaurantPicks.find(
                                    pick => pick.restaurantId === restaurant.id
                                )?.selectedUsers ?? []
                        }}
                        onClick={onClickRestaurant}
                    />
                ))}
            </div>
        </>
    )
}
